import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import nextEnv from '@next/env'
import { MongoClient } from 'mongodb'

nextEnv.loadEnvConfig(process.cwd())

const args = new Set(process.argv.slice(2))
const allowedArgs = new Set(['--apply', '--dry-run', '--allow-osm-geocoding', '--help'])
const unexpectedArgs = [...args].filter((arg) => !allowedArgs.has(arg))

if (unexpectedArgs.length) {
  throw new Error(`Unknown option(s): ${unexpectedArgs.join(', ')}`)
}

if (args.has('--help')) {
  console.log(`Migrate legacy property locations to approximate coordinates.

Usage:
  node scripts/migrate-property-coordinates.mjs [--dry-run] [--allow-osm-geocoding]
  node scripts/migrate-property-coordinates.mjs --apply --allow-osm-geocoding

The default is a read-only dry run. Network geocoding and database writes each
require an explicit flag. OSM queries use place names only, run sequentially at
most once per second, and are cached in .cache/property-location-geocode-cache.json.
Set NOMINATIM_CONTACT_EMAIL before enabling OSM geocoding.
`)
  process.exit(0)
}

if (args.has('--apply') && args.has('--dry-run')) {
  throw new Error('Choose either --apply or --dry-run, not both.')
}

const applyChanges = args.has('--apply')
const allowOsmGeocoding = args.has('--allow-osm-geocoding')
const mongoUrl = process.env.MONGO_URL
const databaseName = process.env.DB_NAME

if (!mongoUrl || !databaseName) {
  throw new Error('MONGO_URL and DB_NAME must be configured in .env.local.')
}

const nominatimContactEmail = String(process.env.NOMINATIM_CONTACT_EMAIL || '').trim()
if (allowOsmGeocoding && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nominatimContactEmail)) {
  throw new Error('Set NOMINATIM_CONTACT_EMAIL to a monitored contact address before using OSM geocoding.')
}

const cacheDirectory = path.join(process.cwd(), '.cache')
const cachePath = path.join(cacheDirectory, 'property-location-geocode-cache.json')
const nominatimEndpoint = new URL(
  process.env.NOMINATIM_SEARCH_URL || 'https://nominatim.openstreetmap.org/search',
)

if (nominatimEndpoint.protocol !== 'https:') {
  throw new Error('NOMINATIM_SEARCH_URL must use HTTPS.')
}

function normalize(value) {
  return String(value || '').trim().normalize('NFKC').toLocaleLowerCase('en-IN')
}

function placeName(value) {
  const name = String(value || '').trim().normalize('NFC').slice(0, 120)
  if (!name || /\d/.test(name) || /\b(road|street|highway|lane|plot|house|flat|apartment|building)\b/i.test(name)) {
    return ''
  }
  return name
}

function buildPlaceQuery(record) {
  const candidates = [
    record.locality,
    record.village,
    record.city,
    record.tehsil,
    record.district,
    record.state,
  ].map(placeName).filter(Boolean)

  if (candidates.length === 0) candidates.push(placeName(record.location))
  const uniqueNames = [...new Map(candidates.filter(Boolean).map((name) => [normalize(name), name])).values()]
  if (uniqueNames.length === 0) return ''
  return `${uniqueNames.join(', ')}, India`
}

function validCoordinates(latitude, longitude) {
  return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 &&
    Number.isFinite(longitude) && longitude >= -180 && longitude <= 180
}

function coordinatesFrom(record) {
  if (record.latitude == null || record.longitude == null) return null
  const latitude = Number(record.latitude)
  const longitude = Number(record.longitude)
  return validCoordinates(latitude, longitude) ? { latitude, longitude } : null
}

async function readCache() {
  try {
    const contents = await readFile(cachePath, 'utf8')
    const parsed = JSON.parse(contents)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch (error) {
    if (error.code === 'ENOENT') return {}
    throw error
  }
}

let lastRequestStartedAt = 0

async function geocode(query, cache) {
  const key = normalize(query)
  if (Object.hasOwn(cache, key)) return cache[key]
  if (!allowOsmGeocoding) return null

  const wait = Math.max(0, 1100 - (Date.now() - lastRequestStartedAt))
  if (wait) await new Promise((resolve) => setTimeout(resolve, wait))

  const url = new URL(nominatimEndpoint)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '1')
  url.searchParams.set('q', query)
  url.searchParams.set('email', nominatimContactEmail)
  lastRequestStartedAt = Date.now()

  const response = await fetch(url, {
    headers: {
      'User-Agent': `HimBhumi-property-location-migration/1.0 (${nominatimContactEmail})`,
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) {
    throw new Error(`Nominatim returned HTTP ${response.status} for a place-name query.`)
  }

  const results = await response.json()
  const first = Array.isArray(results) ? results[0] : null
  const latitude = first ? Number(first.lat) : NaN
  const longitude = first ? Number(first.lon) : NaN
  cache[key] = validCoordinates(latitude, longitude)
    ? { latitude, longitude, displayName: String(first.display_name || '').slice(0, 300) }
    : { notFound: true }
  await mkdir(cacheDirectory, { recursive: true })
  await writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`, 'utf8')
  return cache[key]
}

function coordinateFilter(record) {
  return {
    _id: record._id,
    latitude: Object.hasOwn(record, 'latitude') ? record.latitude : { $exists: false },
    longitude: Object.hasOwn(record, 'longitude') ? record.longitude : { $exists: false },
  }
}

async function migrateCollection(collection, cache) {
  const cursor = collection.find({
    $or: [
      { latitude: { $exists: false } },
      { longitude: { $exists: false } },
      { latitude: null },
      { longitude: null },
    ],
  })
  let candidates = 0
  let migrated = 0
  let skippedPartial = 0
  let unresolved = 0

  for await (const record of cursor) {
    if (record.latitude != null || record.longitude != null) {
      skippedPartial += 1
      console.warn(`${collection.collectionName}/${record.id || record._id}: one coordinate is missing; left unchanged.`)
      continue
    }

    candidates += 1
    const query = buildPlaceQuery(record)
    if (!query) {
      unresolved += 1
      console.warn(`${collection.collectionName}/${record.id || record._id}: no safe place-name fields; left unchanged.`)
      continue
    }

    const result = await geocode(query, cache)
    if (!result || result.notFound || !validCoordinates(result.latitude, result.longitude)) {
      unresolved += 1
      console.log(`${collection.collectionName}/${record.id || record._id}: ${query} — unresolved; left unchanged.`)
      continue
    }

    console.log(`${collection.collectionName}/${record.id || record._id}: ${query} — ${result.latitude}, ${result.longitude}${result.displayName ? ` (${result.displayName})` : ''}`)
    if (applyChanges) {
      const update = await collection.updateOne(coordinateFilter(record), {
        $set: {
          latitude: result.latitude,
          longitude: result.longitude,
          coordinatePrecision: 'approximate-area-center',
          coordinateSource: 'nominatim',
          updatedAt: new Date().toISOString(),
        },
      })
      if (update.modifiedCount === 1) migrated += 1
      else console.warn(`${collection.collectionName}/${record.id || record._id}: changed during migration; skipped.`)
    }
  }

  return { collection: collection.collectionName, candidates, migrated, skippedPartial, unresolved }
}

const cache = await readCache()
const client = new MongoClient(mongoUrl, { serverSelectionTimeoutMS: 10000 })

try {
  await client.connect()
  const db = client.db(databaseName)
  const results = []
  for (const name of ['properties', 'listings']) {
    results.push(await migrateCollection(db.collection(name), cache))
  }

  console.table(results)
  if (!applyChanges) {
    console.log('Dry run only: no database records were changed.')
    if (!allowOsmGeocoding) {
      console.log('Unresolved locations need --allow-osm-geocoding and NOMINATIM_CONTACT_EMAIL before approximate coordinates can be looked up.')
    }
  }
} finally {
  await client.close()
}
