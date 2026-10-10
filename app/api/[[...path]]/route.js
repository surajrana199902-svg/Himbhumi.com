import { NextResponse } from 'next/server'
import { randomBytes, randomUUID, scryptSync } from 'crypto'
import { createHmac, timingSafeEqual } from 'crypto'
import { MongoClient } from 'mongodb'
import nodemailer from 'nodemailer'
import { createLegacyLocationCatalog, LEGACY_LOCATION_NAMES, slugifyLocation } from '../../../lib/location-data'
import { locationPath } from '../../../lib/location-utils'

let clientPromise
let locationCatalogInitialization
const allowDemoReads = process.env.NODE_ENV !== 'production'
const legacyLocationCatalog = createLegacyLocationCatalog()
const unavailablePropertyImage = '/images/property-image-unavailable.svg'
const unavailablePropertyImageIds = new Set([
  'photo-1759123136466-63b3c37db41f',
  'photo-1767634854859-db8255389e64',
  'photo-1780391592801-5e8867523492',
  'photo-1589891685391-b37508e8df4c',
])
const starterProperties = [
  { title: 'The Cedar House', location: 'Kasauli', price: '₹ 4.85 Cr', type: 'Villa', area: '3,200 sq. ft.', address: 'Manki Point Road, Kasauli, Himachal Pradesh', image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Kasauli_Circuit_House.jpg/1920px-Kasauli_Circuit_House.jpg", gallery: ["https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Kasauli_Circuit_House.jpg/1920px-Kasauli_Circuit_House.jpg","https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/Government_circuit_house%2C_Kasauli%2CIndia.jpg/1920px-Government_circuit_house%2C_Kasauli%2CIndia.jpg","https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/Landscape_around_Cantonment_area%2CKasauli_%2CIndia.jpg/1920px-Landscape_around_Cantonment_area%2CKasauli_%2CIndia.jpg"], description: 'A considered mountain residence where warm cedar, generous glazing, and quiet outdoor spaces frame the best of Kasauli. Designed for slow weekends and effortless hosting.', amenities: ['Mountain views', 'Private garden', 'Fireplace lounge', 'Solar backup', 'Staff room'], specs: [{ label: 'Bedrooms', value: '4' }, { label: 'Bathrooms', value: '4.5' }, { label: 'Plot size', value: '8,900 sq. ft.' }, { label: 'Year built', value: '2023' }], nearby: ['Kasauli Club · 8 min', 'Lawrence School · 14 min', 'Kasauli Market · 10 min', 'Gilbert Trail · 12 min'], video: 'https://cdn.coverr.co/videos/coverr-aerial-view-of-the-mountains-1577/1080p.mp4' },
  { title: 'Pinecrest Estate', location: 'Shimla', price: '₹ 7.20 Cr', type: 'Estate', area: '5,850 sq. ft.', address: 'Mashobra Road, Shimla, Himachal Pradesh', image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Shimla_skyline.jpg/1920px-Shimla_skyline.jpg", gallery: ["https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Shimla_skyline.jpg/1920px-Shimla_skyline.jpg","https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/Cityscape_of_Shimla.jpg/1920px-Cityscape_of_Shimla.jpg","https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d5/The_Ridge_Shimla_4.jpg/1920px-The_Ridge_Shimla_4.jpg"], description: 'A private estate above Shimla with layered lawns, forest-facing rooms, and a distinctly residential sense of arrival. A rare long-term base in the hills.', amenities: ['Forest outlook', 'Double-height living', 'Home office', 'Covered parking', 'Guest suite'], specs: [{ label: 'Bedrooms', value: '5' }, { label: 'Bathrooms', value: '5' }, { label: 'Plot size', value: '1.4 acres' }, { label: 'Year built', value: '2022' }], nearby: ['Theog Market · 16 min', 'Bishop Cotton School · 24 min', 'IGMC Shimla · 22 min', 'Craignano Nature Park · 8 min'] },
  { title: 'Valley Light Residence', location: 'Dharamshala', price: '₹ 3.40 Cr', type: 'Residence', area: '2,480 sq. ft.', address: 'Naddi Village, Dharamshala, Himachal Pradesh', image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5f/Dhauladhar_alpenglow_above_Dharamshala%2C_India.jpg/1920px-Dhauladhar_alpenglow_above_Dharamshala%2C_India.jpg", gallery: ["https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5f/Dhauladhar_alpenglow_above_Dharamshala%2C_India.jpg/1920px-Dhauladhar_alpenglow_above_Dharamshala%2C_India.jpg","https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Dharamshala_02.jpg/1920px-Dharamshala_02.jpg","https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a6/Dharamshala_03_%28Cropped%29.jpg/1920px-Dharamshala_03_%28Cropped%29.jpg"], description: 'A light-filled modern home with long valley views toward the Dhauladhar range. Natural materials and simple planning make every room feel connected to the landscape.', amenities: ['Dhauladhar views', 'Terrace garden', 'Library nook', 'Rainwater harvesting', 'Furnished'], specs: [{ label: 'Bedrooms', value: '3' }, { label: 'Bathrooms', value: '3' }, { label: 'Plot size', value: '5,200 sq. ft.' }, { label: 'Year built', value: '2024' }], nearby: ['Naddi Market · 5 min', 'Tibetan Children’s Village · 13 min', 'Zonal Hospital · 18 min', 'Dal Lake · 6 min'] },
  { title: 'Apple Orchard Retreat', location: 'Manali', price: '₹ 5.65 Cr', type: 'Farmhouse', area: '4,100 sq. ft.', address: 'Prini Village, Manali, Himachal Pradesh', image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/Manali_7.jpg/1920px-Manali_7.jpg", gallery: ["https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/Manali_7.jpg/1920px-Manali_7.jpg","https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/Manali_India_4.jpg/1920px-Manali_India_4.jpg","https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Manali-Snow_Valley_Resort-02-2016-gje.jpg/1920px-Manali-Snow_Valley_Resort-02-2016-gje.jpg"], description: 'A quiet orchard retreat near Manali, balancing alpine character with contemporary comfort. The landscape is the hero, with private corners for every season.', amenities: ['Apple orchard', 'Mountain deck', 'Caretaker cottage', 'Wood-fired sauna', 'River access'], specs: [{ label: 'Bedrooms', value: '4' }, { label: 'Bathrooms', value: '4' }, { label: 'Land', value: '1.1 acres' }, { label: 'Year built', value: '2021' }], nearby: ['Old Manali · 12 min', 'The Manali School · 9 min', 'Civil Hospital · 15 min', 'Hadimba Temple · 14 min'] },
  { title: 'The Green Valley Plot', location: 'Baddi', price: '₹ 1.18 Cr', type: 'Land', area: '12,500 sq. ft.', address: 'Bhatoli Kalan, Baddi, Himachal Pradesh', image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0e/National_Highway_22_old_road_to_Pinjore_Kalka_Baddi_Nalagarh_%28off_Himalayan_Expressway%29.jpeg/1920px-National_Highway_22_old_road_to_Pinjore_Kalka_Baddi_Nalagarh_%28off_Himalayan_Expressway%29.jpeg", gallery: ["https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0e/National_Highway_22_old_road_to_Pinjore_Kalka_Baddi_Nalagarh_%28off_Himalayan_Expressway%29.jpeg/1920px-National_Highway_22_old_road_to_Pinjore_Kalka_Baddi_Nalagarh_%28off_Himalayan_Expressway%29.jpeg","https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f3/Village_houses_and_fields_in_Himachal_Pradesh%2C_India_with_hills_in_the_background.jpg/1920px-Village_houses_and_fields_in_Himachal_Pradesh%2C_India_with_hills_in_the_background.jpg","https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Bhekli_village%2C_Kullu%2C_Himachal_Pradesh%2C_India.jpg/1920px-Bhekli_village%2C_Kullu%2C_Himachal_Pradesh%2C_India.jpg"], description: 'A well-positioned parcel in the Baddi–Nalagarh growth corridor, suited to a private residence, boutique retreat, or considered investment.', amenities: ['Road frontage', 'Clear title', 'Water connection', 'Electricity nearby', 'Flexible zoning'], specs: [{ label: 'Land area', value: '12,500 sq. ft.' }, { label: 'Road width', value: '30 ft.' }, { label: 'Slope', value: 'Gentle' }, { label: 'Title', value: 'Clear' }], nearby: ['Baddi Market · 9 min', 'Eicher School · 12 min', 'ESI Hospital · 15 min', 'Pinjore Gardens · 28 min'] },
  { title: 'Solan Courtyard Home', location: 'Solan', price: '₹ 2.75 Cr', type: 'Home', area: '2,900 sq. ft.', address: 'Chambaghat, Solan, Himachal Pradesh', image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/Solan_city.jpg/1920px-Solan_city.jpg", gallery: ["https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/Solan_city.jpg/1920px-Solan_city.jpg","https://thumb.wikimedia.org/wikipedia/commons/thumb/9/92/The_Mall_Solan.jpg/1920px-The_Mall_Solan.jpg","https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d0/Solan_city_view_from_Solan_bypass.jpg/1920px-Solan_city_view_from_Solan_bypass.jpg"], description: 'A gracious courtyard home in Solan with a welcoming plan, excellent natural light, and room to grow into a family legacy.', amenities: ['Central courtyard', 'Modular kitchen', 'Study room', 'Garage', 'Solar water heater'], specs: [{ label: 'Bedrooms', value: '4' }, { label: 'Bathrooms', value: '3' }, { label: 'Plot size', value: '6,500 sq. ft.' }, { label: 'Year built', value: '2020' }], nearby: ['Solan Mall · 8 min', 'St. Luke’s School · 10 min', 'Regional Hospital · 11 min', 'Mohan Park · 6 min'] },
  { title: 'Azure Heights Residences', location: 'Mohali', price: '₹ 2.90 Cr', type: 'Apartment / Flat', area: '1,980 sq. ft.', address: 'Phase 11, Mohali, Punjab', image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/Aparna_Zenon%2C_Hyderabad_-_Symmetric_framing_of_the_high-rise_apartment_towers_facade.jpg/1920px-Aparna_Zenon%2C_Hyderabad_-_Symmetric_framing_of_the_high-rise_apartment_towers_facade.jpg", gallery: ["https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/Aparna_Zenon%2C_Hyderabad_-_Symmetric_framing_of_the_high-rise_apartment_towers_facade.jpg/1920px-Aparna_Zenon%2C_Hyderabad_-_Symmetric_framing_of_the_high-rise_apartment_towers_facade.jpg","https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/A_residential_apartment_in_Hitec_City%2C_Hyderabad.jpg/1920px-A_residential_apartment_in_Hitec_City%2C_Hyderabad.jpg","https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Vaibhav_Apartment%2C_Manikonda.jpg/1920px-Vaibhav_Apartment%2C_Manikonda.jpg"], description: 'A polished urban residence in Mohali with a welcoming open plan, premium facilities, and fast access to the Tricity business corridor.', amenities: ['Clubhouse', 'Power backup', 'Covered parking', '24x7 security', 'Community lawn'], specs: [{ label: 'Bedrooms', value: '3' }, { label: 'Bathrooms', value: '3' }, { label: 'Area', value: '1,980 sq. ft.' }, { label: 'Year built', value: '2024' }], nearby: ['IT City · 10 min', 'AeroCity · 12 min', 'Fortis Hospital · 15 min', 'Phase 8 market · 9 min'] },
  { title: 'Sector 82 Smart Villa', location: 'Gurugram', price: '₹ 5.40 Cr', type: 'Villa', area: '3,650 sq. ft.', address: 'Sector 82, Gurugram, Haryana', image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/76/DLF_Cyber_City_with_Rapid_Metro%2C_Gurgaon.jpg/1920px-DLF_Cyber_City_with_Rapid_Metro%2C_Gurgaon.jpg", gallery: ["https://thumb.wikimedia.org/wikipedia/commons/thumb/7/76/DLF_Cyber_City_with_Rapid_Metro%2C_Gurgaon.jpg/1920px-DLF_Cyber_City_with_Rapid_Metro%2C_Gurgaon.jpg","https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Sector_22_Gurgaon%2C_at_Dusk.jpg/1920px-Sector_22_Gurgaon%2C_at_Dusk.jpg","https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/Sector-47%2C_Gurgaon%2C_Decorated_for_Diwali.jpg/1920px-Sector-47%2C_Gurgaon%2C_Decorated_for_Diwali.jpg"], description: 'A contemporary villa in Gurgaon designed for families prioritizing connectivity, outdoor spaces, and easy access to the NCR business belt.', amenities: ['Double-height lounge', 'Private terrace', 'Lush courtyard', 'Smart home', 'Servant room'], specs: [{ label: 'Bedrooms', value: '4' }, { label: 'Bathrooms', value: '4' }, { label: 'Plot size', value: '4,200 sq. ft.' }, { label: 'Year built', value: '2023' }], nearby: ['Dwarka Expressway · 8 min', 'Golf Course Road · 15 min', 'Medanta · 18 min', 'CyberHub · 20 min'] },
  { title: 'Dehradun Valley Home', location: 'Dehradun', price: '₹ 2.15 Cr', type: 'House', area: '2,240 sq. ft.', address: 'Rajpur Road, Dehradun, Uttarakhand', image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/Dehradun_4.jpg/1920px-Dehradun_4.jpg", gallery: ["https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/Dehradun_4.jpg/1920px-Dehradun_4.jpg","https://upload.wikimedia.org/wikipedia/commons/9/93/Nakraunda%2C_Dehradun.jpg","https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f3/The_Dehradun_Clock_Tower.jpg/1920px-The_Dehradun_Clock_Tower.jpg"], description: 'A modern hillside home that captures Dehradun’s clean air and easy access to the city’s premium residential pockets and green belt.', amenities: ['Forest view', 'Private sit-out', 'Dedicated study', 'Water storage', 'Guest parking'], specs: [{ label: 'Bedrooms', value: '3' }, { label: 'Bathrooms', value: '3' }, { label: 'Plot size', value: '3,800 sq. ft.' }, { label: 'Year built', value: '2022' }], nearby: ['Rajpur Road · 6 min', 'Sahastradhara Road · 14 min', 'ISBT · 16 min', 'Clement Town · 11 min'] },
  { title: 'Panchkula Green Plot', location: 'Panchkula', price: '₹ 1.62 Cr', type: 'Residential plot', area: '5,000 sq. ft.', address: 'MDC, Panchkula, Haryana', image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f2/Chandigarh_and_surrounding_aerial_photo_04-2016_img1_%28file%29.jpg/1920px-Chandigarh_and_surrounding_aerial_photo_04-2016_img1_%28file%29.jpg", gallery: ["https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f2/Chandigarh_and_surrounding_aerial_photo_04-2016_img1_%28file%29.jpg/1920px-Chandigarh_and_surrounding_aerial_photo_04-2016_img1_%28file%29.jpg","https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/Sukhna_Lake_Chandigarh_Evening.jpg/1920px-Sukhna_Lake_Chandigarh_Evening.jpg","https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7d/Ariel_view_of_Chandigarh.jpg/1920px-Ariel_view_of_Chandigarh.jpg"], description: 'A premium residential parcel in Panchkula offering a calm, well-connected address close to Chandigarh’s amenities and the surrounding hill belt.', amenities: ['Corner plot', 'Good road frontage', 'Nearby utilities', 'Low-density surroundings', 'Clear title'], specs: [{ label: 'Land area', value: '5,000 sq. ft.' }, { label: 'Road width', value: '30 ft.' }, { label: 'Location', value: 'MDC' }, { label: 'Title', value: 'Clear' }], nearby: ['MDC · 5 min', 'Sector 20 · 10 min', 'Chandigarh · 20 min', 'Pinjore Gardens · 18 min'] },
  { title: 'Riverside Commercial Space', location: 'Patiala', price: '₹ 3.10 Cr', type: 'Commercial property', area: '2,400 sq. ft.', address: 'Urban Estate, Patiala, Punjab', image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Ambala_Chandigarh_Highway_-_NH_21_-_Zirakpur_-_Chandigarh_2016-08-05_6036.JPG/1920px-Ambala_Chandigarh_Highway_-_NH_21_-_Zirakpur_-_Chandigarh_2016-08-05_6036.JPG", gallery: ["https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Ambala_Chandigarh_Highway_-_NH_21_-_Zirakpur_-_Chandigarh_2016-08-05_6036.JPG/1920px-Ambala_Chandigarh_Highway_-_NH_21_-_Zirakpur_-_Chandigarh_2016-08-05_6036.JPG","https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f0/Commercial_Building_Under_Construction_-_Kankadahad_-_Dhenkanal_2018-01-25_9790.JPG/1920px-Commercial_Building_Under_Construction_-_Kankadahad_-_Dhenkanal_2018-01-25_9790.JPG","https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/Private_Commercial_Building_Under_Construction_-_Choudwar_-_Cuttack_2018-01-26_9988.JPG/1920px-Private_Commercial_Building_Under_Construction_-_Choudwar_-_Cuttack_2018-01-26_9988.JPG"], description: 'A strategic commercial address in Patiala with a strong frontage, flexible layout, and ready access to the shopping and transit corridors.', amenities: ['High visibility', 'Flexible floor plate', 'Staff washroom', 'Power backup', 'Frontage access'], specs: [{ label: 'Area', value: '2,400 sq. ft.' }, { label: 'Parking', value: '4 cars' }, { label: 'Use', value: 'Commercial' }, { label: 'Status', value: 'Ready' }], nearby: ['Urban Estate · 7 min', 'Rajindra Nagar · 10 min', 'Patiala City Centre · 12 min', 'Local bus stand · 8 min'] },
]

async function getDb() {
  if (!process.env.MONGO_URL) throw new Error('MONGO_URL is not configured')
  if (!clientPromise) {
    clientPromise = MongoClient.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 10000 })
      .catch((error) => {
        clientPromise = undefined
        throw error
      })
  }
  const client = await clientPromise
  return client.db(process.env.DB_NAME)
}

function serialize(property) {
  if (!property) return property
  const { _id, ...safe } = property
  const normalizeImage = (image) => {
    if (typeof image !== 'string') return image
    const imageId = image.match(/photo-\d+-[a-f\d]+/i)?.[0]
    return imageId && unavailablePropertyImageIds.has(imageId)
      ? unavailablePropertyImage
      : image
  }
  return {
    ...safe,
    ...(typeof safe.image === 'string' ? { image: normalizeImage(safe.image) } : {}),
    ...(Array.isArray(safe.gallery) ? { gallery: safe.gallery.map(normalizeImage) } : {}),
    ...(Array.isArray(safe.photos) ? { photos: safe.photos.map(normalizeImage) } : {}),
  }
}

function listingToProperty(listing) {
  return {
    id: listing.id,
    title: listing.title,
    location: listing.location || listing.city || listing.locality || listing.district || 'Himachal Pradesh',
    locationId: listing.locationId || '',
    state: listing.state || '',
    district: listing.district || '',
    tehsil: listing.tehsil || '',
    city: listing.city || '',
    locality: listing.locality || '',
    price: listing.price,
    type: listing.category,
    area: [listing.area, listing.areaUnit].filter(Boolean).join(' '),
    address: [listing.locality, listing.city, listing.district, listing.state].filter(Boolean).join(', '),
    image: listing.image || (listing.photos || [])[0] || '',
    gallery: (listing.photos && listing.photos.length) ? listing.photos : (listing.image ? [listing.image] : []),
    description: listing.description || '',
    amenities: Array.isArray(listing.amenities) ? listing.amenities : [],
    specs: [
      listing.bedrooms ? { label: 'Bedrooms', value: String(listing.bedrooms) } : null,
      listing.bathrooms ? { label: 'Bathrooms', value: String(listing.bathrooms) } : null,
      (listing.area) ? { label: 'Area', value: [listing.area, listing.areaUnit].filter(Boolean).join(' ') } : null,
      listing.propertyAge ? { label: 'Age', value: String(listing.propertyAge) } : null,
    ].filter(Boolean),
    nearby: listing.landmark ? [listing.landmark] : [],
    latitude: listing.latitude ?? null,
    longitude: listing.longitude ?? null,
    coordinatePrecision: listing.coordinatePrecision || null,
    video: listing.video || '',
    virtualTourUrl: listing.virtualTourUrl || '',
    bedrooms: listing.bedrooms || '',
    views: listing.views || 0,
    mapsLink: listing.mapsLink || '',
    listingType: listing.listingType || '',
    negotiable: !!listing.negotiable,
    featured: !!listing.featured,
    verified: !!listing.verified,
    sourceListingId: listing.listingId,
    status: listing.publicationStatus || 'published',
    createdAt: listing.createdAt || new Date().toISOString(),
    updatedAt: listing.updatedAt || listing.createdAt || new Date().toISOString(),
  }
}

async function ensureSeed(db) {
  const collection = db.collection('properties')
  if (await collection.countDocuments() === 0) {
    await collection.insertMany(starterProperties.map((property) => ({ ...property, id: randomUUID(), status: 'published', createdAt: new Date().toISOString() })))
  }
}

function normalizeLocationName(name) {
  return String(name || '').trim().normalize('NFKC').toLocaleLowerCase('en-IN')
}

function presentLocations(locations) {
  return locations.map((location) => ({
    ...location,
    urlPath: locationPath(location, locations),
  }))
}

async function getLocationCatalog(db) {
  const collection = db.collection('locations')
  if (!locationCatalogInitialization) {
    locationCatalogInitialization = (async () => {
      await collection.createIndex(
        { type: 1, parentLocationId: 1, nameKey: 1 },
        { unique: true, name: 'location_hierarchy_unique' },
      )
      await collection.bulkWrite(legacyLocationCatalog.map((location) => ({
        updateOne: {
          filter: {
            type: location.type,
            parentLocationId: location.parentLocationId,
            nameKey: normalizeLocationName(location.name),
          },
          update: {
            $setOnInsert: { ...location, nameKey: normalizeLocationName(location.name) },
          },
          upsert: true,
        },
      })))
    })().catch((error) => {
      locationCatalogInitialization = undefined
      throw error
    })
  }
  await locationCatalogInitialization
  const locations = await collection.find({}).toArray()
  return presentLocations(locations.map(serialize).sort((a, b) =>
    (a.legacyOrder ?? 10000) - (b.legacyOrder ?? 10000) || a.name.localeCompare(b.name),
  ))
}

function presentLegacyLocations() {
  return presentLocations(legacyLocationCatalog)
}

function getLocationAncestors(location, byId) {
  const ancestors = []
  let current = location
  while (current) {
    ancestors.push(current)
    current = current.parentLocationId ? byId.get(current.parentLocationId) : null
  }
  return ancestors
}

function getLocationDescendants(location, catalog) {
  const byParent = new Map()
  for (const item of catalog) {
    if (!item.parentLocationId) continue
    const children = byParent.get(item.parentLocationId) || []
    children.push(item)
    byParent.set(item.parentLocationId, children)
  }
  const descendants = []
  const pending = [location]
  while (pending.length) {
    const current = pending.pop()
    descendants.push(current)
    pending.push(...(byParent.get(current.id) || []))
  }
  return descendants
}

function propertyLocationFields(location, catalog) {
  const byId = new Map(catalog.map((item) => [item.id, item]))
  const ancestors = getLocationAncestors(location, byId)
  const city = ancestors.find((item) => item.type === 'city')
  const village = ancestors.find((item) => item.type === 'village')
  return {
    locationId: location.id,
    location: village?.name || city?.name || location.name,
    state: location.state,
    district: location.district,
    tehsil: location.tehsil || '',
    city: city?.name || '',
    locality: village?.name || '',
  }
}

function resolveLocation(value, catalog) {
  const query = String(value || '').trim()
  if (!query) return null
  const normalized = normalizeLocationName(query)
  const direct = catalog.find((location) => location.id === query) ||
    catalog.find((location) => location.urlPath === query.replace(/^\/+|\/+$/g, ''))
  if (direct) return direct
  return catalog
    .filter((location) =>
      location.slug === query ||
      normalizeLocationName(location.name) === normalized,
    )
    .sort((a, b) => {
      const priority = { city: 0, village: 1, district: 2, tehsil: 3, state: 4 }
      return priority[a.type] - priority[b.type]
    })[0] || null
}

function filterPropertiesByLocation(properties, selection, catalog) {
  if (!selection || selection === 'All locations') return properties
  const selected = resolveLocation(selection, catalog)
  if (!selected) return properties.filter((property) =>
    [property.location, property.city, property.locality, property.district, property.state]
      .some((name) => normalizeLocationName(name) === normalizeLocationName(selection)),
  )

  const matchingLocations = getLocationDescendants(selected, catalog)
  const matchingIds = new Set(matchingLocations.map((location) => location.id))
  const matchingNames = new Set(matchingLocations.map((location) => normalizeLocationName(location.name)))
  const byId = new Map(catalog.map((location) => [location.id, location]))

  return properties.filter((property) => {
    if (property.locationId) return matchingIds.has(property.locationId)
    const names = [property.location, property.city, property.locality, property.district]
      .map(normalizeLocationName)
      .filter(Boolean)
    if (names.some((name) => matchingNames.has(name))) return true

    const legacyLocation = resolveLocation(property.location || property.city || property.locality || property.district, catalog)
    return legacyLocation && getLocationAncestors(legacyLocation, byId)
      .some((ancestor) => ancestor.id === selected.id)
  })
}

function searchLocationCatalog(locations, query) {
  const normalized = normalizeLocationName(query)
  if (!normalized) return locations

  const byId = new Map(locations.map((location) => [location.id, location]))
  const matches = locations.filter((location) =>
    [location.name, location.type, location.state, location.district, location.tehsil, location.city]
      .some((value) => normalizeLocationName(value).includes(normalized)),
  )
  const resultIds = new Set()
  for (const match of matches) {
    for (const descendant of getLocationDescendants(match, locations)) resultIds.add(descendant.id)
    for (const ancestor of getLocationAncestors(match, byId)) resultIds.add(ancestor.id)
  }
  return locations.filter((location) => resultIds.has(location.id))
}

const LOCATION_PARENT_TYPES = {
  state: null,
  district: 'state',
  tehsil: 'district',
  city: 'tehsil',
  village: 'city',
}

function makeLocationRecord(input, parent, id = randomUUID()) {
  const name = String(input.name || '').trim().normalize('NFC')
  const type = String(input.type || '').trim().toLowerCase()
  if (!name || name.length > 120) throw new Error('Location names must contain 1 to 120 characters.')
  if (!Object.hasOwn(LOCATION_PARENT_TYPES, type)) throw new Error('Location type must be state, district, tehsil, city, or village.')
  if (type === 'state' ? parent != null : !parent || parent.type !== LOCATION_PARENT_TYPES[type]) {
    throw new Error(type === 'state' ? 'A state must not have a parent location.' : `${type} must be added under a ${LOCATION_PARENT_TYPES[type]}.`)
  }

  const state = type === 'state' ? name : parent.state
  const district = type === 'district' ? name : parent?.type === 'district' ? parent.name : parent?.district || ''
  const tehsil = type === 'tehsil' ? name : parent?.type === 'tehsil' ? parent.name : parent?.tehsil || ''
  const city = type === 'city' ? name : parent?.type === 'city' ? parent.name : parent?.city || ''
  const latitude = input.latitude === '' || input.latitude == null ? undefined : Number(input.latitude)
  const longitude = input.longitude === '' || input.longitude == null ? undefined : Number(input.longitude)
  if (latitude !== undefined && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) throw new Error('Latitude must be between -90 and 90.')
  if (longitude !== undefined && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) throw new Error('Longitude must be between -180 and 180.')

  return {
    id,
    name,
    nameKey: normalizeLocationName(name),
    type,
    state,
    district,
    tehsil,
    city,
    parentLocationId: parent?.id || null,
    slug: slugifyLocation(name),
    ...(latitude !== undefined ? { latitude } : {}),
    ...(longitude !== undefined ? { longitude } : {}),
    isLegacy: false,
    legacyOrder: 10000,
    createdAt: new Date().toISOString(),
  }
}

const fallbackProperties = starterProperties.map((property, index) => ({
  ...property,
  id: `starter-${index + 1}`,
  status: 'published',
  createdAt: new Date().toISOString(),
}))
const fallbackInquiries = []
const fallbackMessages = []

function response(data, status = 200) { return NextResponse.json(data, { status }) }

function databaseUnavailable(error) {
  const cause = error?.cause || error
  const message = String(cause?.message || 'Unknown database error')
    .replace(/mongodb(?:\+srv)?:\/\/[^@\s]+@/gi, 'mongodb+srv://[redacted]@')
  const authenticationFailed = cause?.code === 8000 || /bad auth|authentication failed/i.test(message)
  const tlsFailed = /tlsv1 alert|tls handshake|ssl routines/i.test(message)
  console.error('Persistent database operation failed:', {
    name: error?.name || 'DatabaseError',
    code: cause?.code || cause?.codeName || null,
    message,
  })
  const errorMessage = authenticationFailed
    ? 'MongoDB authentication failed. Check the Atlas database username and password and confirm authSource=admin. Your changes were not saved.'
    : tlsFailed
      ? 'MongoDB TLS connection failed before authentication. Check Atlas Network Access and outbound TLS/firewall rules. Your changes were not saved.'
      : 'Database unavailable. Your changes were not saved. Please try again later.'
  return response({ error: errorMessage }, 503)
}

const oauthSecret = () => process.env.GOOGLE_OAUTH_SESSION_SECRET || ''
function googleOAuthCredentials(role) {
  const rolePrefix = role === 'admin' ? 'GOOGLE_ADMIN' : role === 'agent' ? 'GOOGLE_AGENT' : 'GOOGLE'
  return {
    clientId: process.env[`${rolePrefix}_CLIENT_ID`] || process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env[`${rolePrefix}_CLIENT_SECRET`] || process.env.GOOGLE_CLIENT_SECRET || '',
  }
}
const googleOAuthConfigured = (role) => {
  const credentials = googleOAuthCredentials(role)
  return !!(credentials.clientId && credentials.clientSecret && oauthSecret().length >= 32)
}
const normalizedEmailList = (value) => String(value || '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean)
const adminGoogleEmails = () => normalizedEmailList(process.env.ADMIN_GOOGLE_EMAILS)
const agentGoogleEmails = () => normalizedEmailList(process.env.AGENT_GOOGLE_EMAILS)

function googleRoleFor(email) {
  const normalized = String(email || '').trim().toLowerCase()
  if (adminGoogleEmails().includes(normalized)) return 'admin'
  if (agentGoogleEmails().includes(normalized)) return 'agent'
  return 'user'
}

function googleSession(request) {
  const session = verifySession(request, 'himbhumi_session', oauthSecret(), null)
  if (session?.role !== 'admin') return session
  return {
    ...session,
    role: googleRoleFor(session.email),
  }
}

function accountSession(request) {
  const session = googleSession(request)
  if (session) return session
  const legacyAgent = agentSession(request)
  if (legacyAgent) return { ...legacyAgent, userId: agentUsername(), email: agentUsername(), role: 'agent' }
  return null
}

function agentOwnerId(request) {
  const session = agentSession(request)
  return session?.userId || session?.email || session?.username || agentUsername()
}

function agentOwnerIds(request) {
  const session = agentSession(request)
  if (!session) return []
  const ownerIds = [session.userId, session.email, session.username]
  if (!session.userId || String(session.email || '').toLowerCase() === agentUsername()) ownerIds.push(agentUsername())
  return [...new Set(ownerIds.filter(Boolean))]
}

function isAdmin(request) { return googleSession(request)?.role === 'admin' }
function requireAdmin(request) { return isAdmin(request) ? null : response({ error: 'Admin authentication required' }, 401) }

function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim()) }

function agentUsername() { return String(process.env.AGENT_USERNAME || '').trim().toLowerCase() }
function agentPassword() { return String(process.env.AGENT_PASSWORD || '') }
function agentSecret() { return process.env.AGENT_SESSION_SECRET || '' }

function signedToken(payload, secret) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', secret).update(encoded).digest('base64url')
  return `${encoded}.${signature}`
}

function verifySession(request, cookieName, secret, role) {
  const token = request.cookies.get(cookieName)?.value || ''
  const [payload, signature] = token.split('.')
  if (!payload || !signature || !secret) return null
  const expected = createHmac('sha256', secret).update(payload).digest('base64url')
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return (role == null || data.role === role) && data.exp > Date.now() ? data : null
  } catch {
    return null
  }
}

function agentSession(request) {
  const google = googleSession(request)
  if (google?.role === 'agent' && (google.email || google.username)) return google
  const session = verifySession(request, 'himbhumi_agent', agentSecret(), 'agent')
  return session
}

function inboxActor(request) {
  const google = googleSession(request)
  if (google && ['user', 'agent', 'admin'].includes(google.role) && google.email) {
    const email = String(google.email).trim().toLowerCase()
    return {
      id: google.role === 'admin' ? `admin:${email}` : String(google.userId || email),
      email,
      name: String(google.name || email),
      role: google.role,
    }
  }

  const agent = agentSession(request)
  if (agent) {
    const email = String(agent.email || agent.username || '').trim().toLowerCase()
    return {
      id: String(agent.userId || email),
      email,
      name: String(agent.name || email),
      role: 'agent',
    }
  }

  return null
}

function isInboxParticipant(thread, actor) {
  return thread.participants?.some((participant) => participant.id === actor.id) || false
}

async function resolveInboxRecipient(db, actor, emailInput, roleInput) {
  const email = String(emailInput || '').trim().toLowerCase()
  const role = String(roleInput || '').trim().toLowerCase()
  if (!isValidEmail(email) || !['user', 'agent', 'admin'].includes(role) || email === actor.email) return null

  if (role === 'admin') {
    if (!adminGoogleEmails().includes(email)) return null
    return { id: `admin:${email}`, email, name: 'HimBhumi administrator', role }
  }

  if (role === 'agent') {
    const account = await db.collection('users').findOne({ email, role: 'agent' })
    if (account?.googleSub) return { id: String(account.googleSub), email, name: String(account.name || email), role }
    const agent = await db.collection('agents').findOne({ email, status: 'approved' })
    if (agent) return { id: String(agent.id), email, name: String(agent.name || email), role }
    return null
  }

  const account = await db.collection('users').findOne({ email, role: 'user' })
  return account?.googleSub
    ? { id: String(account.googleSub), email, name: String(account.name || email), role }
    : null
}

async function resolvePropertyRecipient(db, property, actor) {
  const ownerId = String(property.agentOwnerId || '').trim()
  if (ownerId) {
    const account = await db.collection('users').findOne({ googleSub: ownerId, role: 'agent' })
    if (account?.googleSub) return { id: String(account.googleSub), email: String(account.email).toLowerCase(), name: String(account.name || account.email), role: 'agent' }
    const agent = await db.collection('agents').findOne({
      status: 'approved',
      $or: [{ id: ownerId }, { email: ownerId.toLowerCase() }],
    })
    if (agent) return { id: String(agent.id), email: String(agent.email).toLowerCase(), name: String(agent.name || agent.email), role: 'agent' }
    if (ownerId.toLowerCase() === agentUsername()) {
      return { id: ownerId.toLowerCase(), email: ownerId.toLowerCase(), name: 'Agent', role: 'agent' }
    }
  }

  const admin = adminGoogleEmails()[0]
  if (!admin) throw new Error('No administrator inbox recipient is configured.')
  return { id: `admin:${admin}`, email: admin, name: actor.role === 'admin' ? actor.name : 'HimBhumi administrator', role: 'admin' }
}

async function createInboxThread(db, sender, recipient, { subject, body, propertyId, propertyTitle, inquiryId }) {
  const now = new Date().toISOString()
  const thread = {
    id: randomUUID(),
    participants: [sender, recipient],
    subject,
    propertyId: propertyId || null,
    propertyTitle: propertyTitle || '',
    inquiryId: inquiryId || null,
    createdAt: now,
    lastMessageAt: now,
    lastMessagePreview: body.slice(0, 180),
    lastMessageSenderId: sender.id,
  }
  const message = {
    id: randomUUID(),
    threadId: thread.id,
    senderId: sender.id,
    senderRole: sender.role,
    senderName: sender.name,
    body,
    readBy: [sender.id],
    createdAt: now,
  }
  await db.collection('inbox_threads').insertOne(thread)
  try {
    await db.collection('inbox_messages').insertOne(message)
  } catch (error) {
    try {
      await db.collection('inbox_threads').deleteOne({ id: thread.id })
    } catch (cleanupError) {
      console.error('Failed to remove an incomplete inbox thread:', { name: cleanupError?.name || 'DatabaseError', code: cleanupError?.code || null })
    }
    throw error
  }
  return { thread: serialize(thread), message: serialize(message) }
}

function secureStringEqual(left, right) {
  const a = Buffer.from(String(left))
  const b = Buffer.from(String(right))
  return a.length === b.length && timingSafeEqual(a, b)
}

function hashAgentPassword(password, salt) {
  return scryptSync(password, salt, 64).toString('hex')
}

function requireAgent(request) {
  return agentSession(request) ? null : response({ error: 'Agent authentication required' }, 401)
}

function isSupportedTourUrl(value) {
  if (!value) return true
  try {
    const { hostname, protocol } = new URL(value)
    return protocol === 'https:' && (
      hostname === 'matterport.com' || hostname.endsWith('.matterport.com') ||
      hostname === 'kuula.co' || hostname.endsWith('.kuula.co') ||
      hostname === 'pannellum.org' || hostname.endsWith('.pannellum.org')
    )
  } catch {
    return false
  }
}

function priceInLakhs(value) {
  const text = String(value || '').toLocaleLowerCase('en-IN')
  const amount = Number(text.replace(/[₹,\s]/g, '').match(/\d+(?:\.\d+)?/)?.[0])
  if (!Number.isFinite(amount)) return null
  if (/\bcr\b|crore/.test(text)) return amount * 100
  if (/\bl\b|lakh/.test(text)) return amount
  return amount >= 100000 ? amount / 100000 : amount
}

function monthlyRentInRupees(value) {
  const text = String(value || '').toLocaleLowerCase('en-IN').replace(/,/g, '')
  const match = text.match(/(\d+(?:\.\d+)?)\s*(crore|cr|lakh|lac|k)?/)
  const amount = Number(match?.[1])
  if (!Number.isFinite(amount)) return null
  if (match[2] === 'crore' || match[2] === 'cr') return amount * 10000000
  if (match[2] === 'lakh' || match[2] === 'lac') return amount * 100000
  if (match[2] === 'k') return amount * 1000
  return amount
}

function bedroomsFor(property) {
  const direct = Number(property.bedrooms)
  if (Number.isFinite(direct) && direct > 0) return direct
  const spec = property.specs?.find((item) => item.label?.toLocaleLowerCase() === 'bedrooms')
  return Number(String(spec?.value || '').match(/\d+/)?.[0]) || null
}

function propertyTypeMatches(propertyType, selectedType) {
  const actual = String(propertyType || '').toLocaleLowerCase()
  const requested = String(selectedType || '').toLocaleLowerCase()
  if (requested === 'house') return actual.includes('house') || actual.includes('home') || actual.includes('villa')
  if (requested === 'apartment / flat') return actual.includes('apartment') || actual.includes('flat')
  if (requested === 'studio') return actual.includes('studio')
  if (requested === 'commercial property') return actual.includes('commercial') || ['shop', 'office', 'warehouse'].includes(actual)
  if (requested === 'agricultural land') return actual.includes('agricultural') || actual.includes('farm')
  return actual === requested
}

function filterPropertiesByFacets(properties, params) {
  const minPrice = params.get('minPrice') === null ? null : Number(params.get('minPrice'))
  const maxPrice = params.get('maxPrice') === null ? null : Number(params.get('maxPrice'))
  const bedrooms = params.getAll('bhk')
  const types = params.getAll('type')
  const listingType = params.get('listingType')?.trim().toLocaleLowerCase() || ''
  return properties.filter((property) => {
    if (listingType && String(property.listingType || '').trim().toLocaleLowerCase() !== listingType) return false
    const price = listingType === 'for rent' ? monthlyRentInRupees(property.price) : priceInLakhs(property.price)
    if (minPrice !== null && Number.isFinite(minPrice) && (price === null || price < minPrice)) return false
    if (maxPrice !== null && Number.isFinite(maxPrice) && (price === null || price > maxPrice)) return false
    const bedroomCount = bedroomsFor(property)
    const studio = String(`${property.title || ''} ${property.type || property.category || ''}`).toLocaleLowerCase().includes('studio') || String(property.bedrooms ?? '').trim() === '0'
    if (bedrooms.length && !bedrooms.some((bhk) => bhk === 'Studio' ? studio : bhk === '4+' ? bedroomCount >= 4 : bedroomCount === Number(bhk))) return false
    if (types.length && !types.some((type) => propertyTypeMatches(property.type || property.category, type))) return false
    return true
  })
}

function propertyEditFields(body) {
  const allowed = [
    'title', 'category', 'listingType', 'price', 'negotiable', 'area', 'areaUnit',
    'bedrooms', 'bathrooms', 'propertyAge', 'description', 'state', 'district',
    'tehsil', 'city', 'locality', 'locationId', 'landmark', 'mapsLink', 'latitude', 'longitude', 'photos',
    'image', 'video', 'virtualTourUrl', 'amenities',
  ]
  return Object.fromEntries(allowed.filter((key) => Object.hasOwn(body, key)).map((key) => [key, body[key]]))
}

function propertyCoordinates(input) {
  const latitudeInput = String(input.latitude ?? '').trim()
  const longitudeInput = String(input.longitude ?? '').trim()
  if (!latitudeInput && !longitudeInput) return { latitude: null, longitude: null }
  if (!latitudeInput || !longitudeInput) throw new Error('Choose both latitude and longitude for the property pin.')
  const latitude = Number(latitudeInput)
  const longitude = Number(longitudeInput)
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) throw new Error('Latitude must be between -90 and 90.')
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new Error('Longitude must be between -180 and 180.')
  return { latitude, longitude }
}

const smtpConfigured = () => process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
const defaultAdminNotificationRecipients = [
  'Surajrana7339@gmail.com',
  'Surajrana2686@gmail.com',
  'Suraj.rana199902@gmail.com',
]
const adminNotificationRecipients = () => String(process.env.ADMIN_NOTIFICATION_EMAILS || defaultAdminNotificationRecipients.join(','))
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(isValidEmail)

let mailTransporter
function getTransporter() {
  if (!mailTransporter) {
    const port = Number(process.env.SMTP_PORT || 587)
    mailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  }
  return mailTransporter
}

async function sendOtpEmail(to, code) {
  const from = process.env.SMTP_FROM || `HimBhumi Real Estates <${process.env.SMTP_USER}>`
  await getTransporter().sendMail({
    from,
    to,
    subject: `Your HimBhumi verification code: ${code}`,
    text: `Your HimBhumi verification code is ${code}. It expires in 10 minutes. If you did not request this, please ignore this email.`,
    html: `<div style="font-family:Georgia,serif;max-width:480px;margin:auto;padding:24px;border:1px solid #dbe9e0;border-radius:16px">
      <h2 style="color:#0a4a20;margin:0 0 8px">HimBhumi Real Estates</h2>
      <p style="color:#444;font-size:14px">Use the code below to verify your email address and publish your property listing.</p>
      <p style="font-size:34px;letter-spacing:8px;font-weight:700;color:#0a4a20;margin:20px 0">${code}</p>
      <p style="color:#888;font-size:12px">This code expires in 10 minutes. If you did not request it, you can safely ignore this email.</p>
    </div>`,
  })
}

async function sendMessageEmail(to, subject, text) {
  const from = process.env.SMTP_FROM || `HimBhumi Real Estates <${process.env.SMTP_USER}>`
  await getTransporter().sendMail({ from, to, subject, text })
}

async function notifyAdminRecipients(subject, text) {
  const recipients = adminNotificationRecipients()
  if (!smtpConfigured() || !recipients.length) return { sent: false, reason: 'SMTP notifications are not configured' }
  const from = process.env.SMTP_FROM || `HimBhumi Real Estates <${process.env.SMTP_USER}>`
  try {
    await getTransporter().sendMail({ from, to: recipients, subject, text })
    return { sent: true }
  } catch (error) {
    console.error('Admin notification email error:', error?.message || error)
    return { sent: false, reason: 'Notification delivery failed' }
  }
}

function inquiryNotification(inquiry) {
  return [
    'A new HimBhumi property enquiry was received.',
    '',
    `Name: ${inquiry.fullName}`,
    `Mobile: ${inquiry.mobile}`,
    `Email: ${inquiry.email || 'Not provided'}`,
    `Property: ${inquiry.propertyTitle || inquiry.propertyId}`,
    `Message: ${inquiry.message || 'No message provided.'}`,
  ].join('\n')
}

function messageNotification(message) {
  return [
    'A new HimBhumi message was created.',
    '',
    `Recipient: ${message.to}`,
    `Subject: ${message.subject}`,
    `Message: ${message.message}`,
  ].join('\n')
}

export async function GET(request, { params }) {
  try {
    const routeParams = await params
    const parts = routeParams?.path || []
    const url = new URL(request.url)
    const appOrigin = (process.env.NEXT_PUBLIC_BASE_URL || url.origin).replace(/\/+$/, '')
    if (parts[0] === 'auth' && parts[1] === 'google' && parts[2] === 'callback') {
      const redirectWithError = (error) => {
        const result = NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, appOrigin))
        result.cookies.set('himbhumi_oauth_state', '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 0, path: '/' })
        return result
      }
      const stateCookie = request.cookies.get('himbhumi_oauth_state')?.value || ''
      const returnedState = url.searchParams.get('state') || ''
      const [stateId, requestedRole] = stateCookie.split('.')
      if (!stateCookie || !secureStringEqual(stateCookie, returnedState) || !stateId || !['user', 'agent', 'admin'].includes(requestedRole)) {
        return redirectWithError('oauth_state')
      }
      if (url.searchParams.has('error') || !url.searchParams.get('code')) return redirectWithError('oauth_cancelled')
      const credentials = googleOAuthCredentials(requestedRole)
      if (!googleOAuthConfigured(requestedRole)) {
        return redirectWithError('oauth_not_configured')
      }

      const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${appOrigin}/api/auth/google/callback`
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: url.searchParams.get('code'),
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      })
      const tokenData = await tokenResponse.json()
      if (!tokenResponse.ok || !tokenData.access_token) {
        console.error('Google OAuth token exchange failed:', tokenData.error || tokenResponse.status)
        return redirectWithError('oauth_exchange')
      }
      const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      })
      const profile = await profileResponse.json()
      if (!profileResponse.ok || !profile.sub || !isValidEmail(profile.email) || profile.email_verified !== true) {
        console.error('Google OAuth profile validation failed:', profileResponse.status)
        return redirectWithError('oauth_profile')
      }

      const email = String(profile.email).trim().toLowerCase()
      let role = googleRoleFor(email)
      if (requestedRole === 'admin' && role !== 'admin') return redirectWithError('admin_not_allowed')
      let agentApplicationStatus = ''
      if (requestedRole === 'agent' && role !== 'agent') {
        const now = new Date().toISOString()
        try {
          const db = await getDb()
          const agents = db.collection('agents')
          await agents.createIndex({ email: 1 }, { unique: true, name: 'agent_email_unique' })
          let agent = await agents.findOne({ email })
          if (!agent) {
            try {
              await agents.insertOne({
                id: randomUUID(),
                name: String(profile.name || email).slice(0, 120),
                email,
                phone: '',
                googleSub: profile.sub,
                applicationSource: 'google',
                status: 'pending',
                createdAt: now,
                updatedAt: now,
              })
            } catch (error) {
              if (error?.code !== 11000) throw error
            }
            agent = await agents.findOne({ email })
          }
          if (agent?.status === 'rejected') {
            await agents.updateOne(
              { email, status: 'rejected' },
              {
                $set: {
                  name: String(profile.name || email).slice(0, 120),
                  googleSub: profile.sub,
                  applicationSource: 'google',
                  status: 'pending',
                  createdAt: now,
                  updatedAt: now,
                },
                $unset: { reviewedAt: '' },
              },
            )
            agent = await agents.findOne({ email })
          } else if (agent?.status === 'pending') {
            await agents.updateOne(
              { email, status: 'pending' },
              {
                $set: {
                  name: String(profile.name || email).slice(0, 120),
                  googleSub: profile.sub,
                  applicationSource: 'google',
                  updatedAt: now,
                },
              },
            )
            agent = await agents.findOne({ email })
          }
          if (agent?.status === 'approved') {
            if (!agent.googleSub || agent.googleSub === profile.sub) role = 'agent'
            else agentApplicationStatus = 'identity_mismatch'
          } else {
            agentApplicationStatus = agent?.status || 'pending'
          }
        } catch (error) {
          console.error('Google agent application could not be saved:', { name: error?.name || 'DatabaseError', code: error?.code || null })
          return redirectWithError('agent_application_unavailable')
        }
      }

      const account = {
        googleSub: profile.sub,
        email,
        name: String(profile.name || email).slice(0, 200),
        picture: typeof profile.picture === 'string' ? profile.picture : '',
        role,
        updatedAt: new Date().toISOString(),
      }
      try {
        const db = await getDb()
        await db.collection('users').updateOne(
          { googleSub: profile.sub },
          { $set: account, $setOnInsert: { createdAt: account.updatedAt } },
          { upsert: true },
        )
      } catch (error) {
        console.error('Google account persistence failed:', { name: error?.name || 'DatabaseError', code: error?.code || null })
        return redirectWithError('account_store_unavailable')
      }

      const session = signedToken({
        userId: profile.sub,
        email,
        name: account.name,
        picture: account.picture,
        role,
        exp: Date.now() + 8 * 60 * 60 * 1000,
      }, oauthSecret())
      const destination = role === 'admin'
        ? '/admin'
        : role === 'agent'
          ? '/agent'
          : agentApplicationStatus === 'identity_mismatch'
            ? '/agent?error=agent_identity_mismatch'
          : agentApplicationStatus
            ? '/agent?application=pending'
            : '/login?success=1'
      const result = NextResponse.redirect(new URL(destination, appOrigin))
      result.cookies.set('himbhumi_session', session, {
        httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
        maxAge: 8 * 60 * 60, path: '/',
      })
      result.cookies.set('himbhumi_oauth_state', '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 0, path: '/' })
      return result
    }
    if (parts[0] === 'auth' && parts[1] === 'google') {
      const role = url.searchParams.get('role') || 'user'
      if (!['user', 'agent', 'admin'].includes(role)) return response({ error: 'Unsupported sign-in role.' }, 400)
      const credentials = googleOAuthCredentials(role)
      if (!googleOAuthConfigured(role)) {
        return NextResponse.redirect(new URL('/login?error=oauth_not_configured', appOrigin))
      }
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${appOrigin}/api/auth/google/callback`
      const canonicalOrigin = new URL(redirectUri).origin
      const requestHost = (request.headers.get('x-forwarded-host') || request.headers.get('host') || url.host)
        .split(',')[0]
        .trim()
        .toLowerCase()
      const requestProtocol = (request.headers.get('x-forwarded-proto') || url.protocol.slice(0, -1))
        .split(',')[0]
        .trim()
        .toLowerCase()
      if (`${requestProtocol}://${requestHost}` !== canonicalOrigin) {
        const canonicalAuthUrl = new URL('/api/auth/google', canonicalOrigin)
        canonicalAuthUrl.searchParams.set('role', role)
        return NextResponse.redirect(canonicalAuthUrl)
      }
      const state = `${randomUUID()}.${role}`
      const authorizeUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      authorizeUrl.search = new URLSearchParams({
        client_id: credentials.clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        state,
        prompt: 'select_account',
      }).toString()
      const result = NextResponse.redirect(authorizeUrl)
      result.cookies.set('himbhumi_oauth_state', state, {
        httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
        maxAge: 10 * 60, path: '/',
      })
      return result
    }
    if (parts[0] === 'auth' && parts[1] === 'session') {
      const session = accountSession(request)
      return session
        ? response({ authenticated: true, user: { email: session.email || session.username, name: session.name || '', picture: session.picture || '', role: session.role } })
        : response({ authenticated: false })
    }
    if (parts[0] === 'admin' && parts[1] === 'session') return isAdmin(request) ? response({ authenticated: true }) : response({ error: 'Not authenticated' }, 401)
    if (parts[0] === 'agent' && parts[1] === 'session') {
      let session = agentSession(request)
      if (session) {
        return response({ authenticated: true, username: session.email || session.username || '', name: session.name || '', picture: session.picture || '', role: session.role || 'agent' })
      }

      const google = googleSession(request)
      if (google?.role !== 'user' || !google.email) {
        return response({ authenticated: false })
      }

      try {
        const db = await getDb()
        const agent = await db.collection('agents').findOne({ email: String(google.email).trim().toLowerCase() })
        if (!agent) return response({ authenticated: false })
        if (agent.status === 'approved' && (!agent.googleSub || agent.googleSub === google.userId)) {
          session = {
            ...google,
            role: 'agent',
            exp: Math.min(google.exp, Date.now() + 8 * 60 * 60 * 1000),
          }
          const result = response({ authenticated: true, username: session.email, name: session.name || '', picture: session.picture || '', role: 'agent' })
          result.cookies.set('himbhumi_session', signedToken(session, oauthSecret()), {
            httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
            maxAge: Math.max(0, Math.floor((session.exp - Date.now()) / 1000)), path: '/',
          })
          return result
        }
        if (agent.status === 'approved' && agent.googleSub && agent.googleSub !== google.userId) {
          return response({
            authenticated: false,
            application: { status: 'identity_mismatch', email: agent.email, name: agent.name || agent.email },
          })
        }
        if (agent.status === 'pending' || agent.status === 'rejected') {
          return response({
            authenticated: false,
            application: { status: agent.status, email: agent.email, name: agent.name || agent.email },
          })
        }
        return response({ authenticated: false })
      } catch (error) {
        return databaseUnavailable(error)
      }
    }
    if (parts[0] === 'inbox') {
      const actor = inboxActor(request)
      if (!actor) return response({ error: 'Sign in with a verified account to use the inbox.' }, 401)
      let db
      try { db = await getDb() } catch (databaseError) { return databaseUnavailable(databaseError) }

      if (parts[1]) {
        const thread = await db.collection('inbox_threads').findOne({ id: parts[1] })
        if (!thread || (actor.role !== 'admin' && !isInboxParticipant(thread, actor))) {
          return response({ error: 'Conversation not found or you do not have access.' }, 404)
        }
        await db.collection('inbox_messages').updateMany(
          { threadId: thread.id, senderId: { $ne: actor.id }, readBy: { $ne: actor.id } },
          { $addToSet: { readBy: actor.id } },
        )
        const messages = await db.collection('inbox_messages')
          .find({ threadId: thread.id })
          .sort({ createdAt: 1 })
          .limit(200)
          .toArray()
        return response({ actor, thread: serialize(thread), messages: messages.map(serialize) })
      }

      const query = actor.role === 'admin' ? {} : { 'participants.id': actor.id }
      const threads = await db.collection('inbox_threads')
        .find(query)
        .sort({ lastMessageAt: -1 })
        .limit(100)
        .toArray()
      return response({ actor, threads: threads.map(serialize) })
    }
    if (parts[0] === 'agent' && parts[1] === 'listings') {
      const authError = requireAgent(request)
      if (authError) return authError
      const db = await getDb()
      const ownerIds = agentOwnerIds(request)
      const [listings, properties] = await Promise.all([
        db.collection('listings').find({ agentOwnerId: { $in: ownerIds } }).sort({ createdAt: -1 }).toArray(),
        db.collection('properties').find({ agentOwnerId: { $in: ownerIds } }).toArray(),
      ])
      const propertyById = new Map(properties.map((property) => [property.id, property]))
      return response({ listings: listings.map((listing) => ({
        ...serialize(listing),
        views: propertyById.get(listing.id)?.views || listing.views || 0,
      })) })
    }
    if (parts[0] === 'user' && parts[1] === 'favorites') {
      const session = accountSession(request)
      if (!session) return response({ error: 'Authentication required' }, 401)
      const db = await getDb()
      const record = await db.collection('user_favorites').findOne({ userId: session.userId || session.email || session.username })
      return response({ favoriteIds: record?.favoriteIds || [] })
    }
    if ((parts[0] === 'inquiries' || parts[0] === 'listings' || parts[0] === 'messages' || parts[0] === 'agents') && !isAdmin(request)) return response({ error: 'Admin authentication required' }, 401)
    if (parts[0] === 'locations') {
      let catalog
      let source
      let db
      try {
        db = await getDb()
      } catch (databaseError) {
        if (process.env.MONGO_URL && !allowDemoReads) return databaseUnavailable(databaseError)
        catalog = presentLegacyLocations()
        source = 'legacy-catalog'
      }
      if (db) {
        try {
          catalog = await getLocationCatalog(db)
        } catch (error) {
          if (!allowDemoReads) return databaseUnavailable(error)
          db = undefined
          catalog = presentLegacyLocations()
          source = 'legacy-catalog'
        }
      }
      if (parts[1]) {
        const location = catalog.find((item) => item.id === parts[1] || item.urlPath === parts.slice(1).join('/'))
        return location ? response({ location, source }) : response({ error: 'Location not found' }, 404)
      }
      const found = searchLocationCatalog(catalog, url.searchParams.get('q') || '')
      return response({ locations: found, source })
    }
    let db
    try {
      db = await getDb()
    } catch (databaseError) {
      if (process.env.MONGO_URL && !(allowDemoReads && parts[0] === 'properties')) return databaseUnavailable(databaseError)
      if (parts[0] === 'agents') return databaseUnavailable(databaseError)
      if (parts[0] === 'properties') {
        const selected = url.searchParams.get('location')
        const results = filterPropertiesByFacets(
          filterPropertiesByLocation(fallbackProperties, selected, presentLegacyLocations()),
          url.searchParams,
        )
        if (parts[1]) {
          const property = fallbackProperties.find((item) => item.id === parts[1])
          return property ? response(property) : response({ error: 'Property not found' }, 404)
        }
        return response({ properties: results, locations: LEGACY_LOCATION_NAMES, source: 'demo-catalog' })
      }
      if (parts[0] === 'inquiries') return response({ inquiries: fallbackInquiries, source: 'demo-catalog' })
      if (parts[0] === 'listings') return response({ listings: [], source: 'demo-catalog' })
      if (parts[0] === 'messages') return response({ messages: fallbackMessages, source: 'demo-catalog' })
      throw databaseError
    }
    if (parts[0] === 'agents') {
      try {
        const agents = await db.collection('agents').find({}).sort({ createdAt: -1 }).toArray()
        return response({ agents: agents.map(({ id, name, email, phone, status, applicationSource, createdAt, reviewedAt }) => ({ id, name, email, phone, status, applicationSource, createdAt, reviewedAt })) })
      } catch (error) {
        return databaseUnavailable(error)
      }
    }
    const locationCatalog = await getLocationCatalog(db)
    if (parts[0] === 'properties') {
      await ensureSeed(db)
      if (parts[1]) {
        const propertyQuery = { id: parts[1] }
        if (!isAdmin(request)) propertyQuery.status = { $in: ['published', 'approved'] }
        const property = await db.collection('properties').findOne(propertyQuery)
        return property ? response(serialize(property)) : response({ error: 'Property not found' }, 404)
      }
      const selected = url.searchParams.get('location')
      const location = selected && selected !== 'All locations'
        ? resolveLocation(selected, locationCatalog)
        : null
      if (selected && selected !== 'All locations' && !location) {
        return response({ properties: [], locations: LEGACY_LOCATION_NAMES })
      }
      const matchingLocations = location ? getLocationDescendants(location, locationCatalog) : []
      const matchingIds = matchingLocations.map((item) => item.id)
      const matchingNames = matchingLocations.map((item) => item.name)
      const query = {
        ...(!isAdmin(request) ? { status: { $in: ['published', 'approved'] } } : {}),
        ...(location ? { $or: [
          { locationId: { $in: matchingIds } },
          { location: { $in: matchingNames } },
          { city: { $in: matchingNames } },
          { locality: { $in: matchingNames } },
          { district: { $in: matchingNames } },
        ] } : {}),
      }
      const results = await db.collection('properties').find(query).sort({ createdAt: -1 }).toArray()
      const filtered = filterPropertiesByFacets(results, url.searchParams)
      return response({ properties: filtered.map(serialize), locations: LEGACY_LOCATION_NAMES })
    }
    if (parts[0] === 'inquiries') {
      const inquiries = await db.collection('inquiries').find({}).sort({ createdAt: -1 }).toArray()
      return response({ inquiries: inquiries.map(serialize) })
    }
    if (parts[0] === 'messages') {
      const messages = await db.collection('messages').find({}).sort({ createdAt: -1 }).toArray()
      return response({ messages: messages.map(serialize) })
    }
    if (parts[0] === 'listings') {
      const url = new URL(request.url)
      const listingIdParam = url.searchParams.get('listingId')
      if (listingIdParam) {
        const found = await db.collection('listings').findOne({ listingId: listingIdParam.trim().toUpperCase() })
        if (!found) return response({ error: 'No listing found with that ID. Please check and try again.' }, 404)
        return response({ listing: { listingId: found.listingId, title: found.title, status: found.status || 'pending_review', verified: !!found.verified, featured: !!found.featured, category: found.category, listingType: found.listingType, price: found.price, city: found.city, district: found.district, image: found.image || (found.photos || [])[0] || '', propertyId: found.status === 'approved' ? found.id : null, createdAt: found.createdAt } })
      }
      if (parts[1]) {
        const listing = await db.collection('listings').findOne({ id: parts[1] })
        return listing ? response(serialize(listing)) : response({ error: 'Listing not found' }, 404)
      }
      const statusFilter = url.searchParams.get('status')
      const query = statusFilter ? { status: statusFilter } : {}
      const listings = await db.collection('listings').find(query).sort({ createdAt: -1 }).toArray()
      return response({ listings: listings.map(serialize) })
    }
    return response({ error: 'Route not found' }, 404)
  } catch (error) { return response({ error: error?.message || 'Server error' }, 500) }
}

export async function POST(request, { params }) {
  try {
    const routeParams = await params
    const parts = routeParams?.path || []
    const rawBody = await request.text()
    const body = rawBody ? JSON.parse(rawBody) : {}
    if (parts[0] === 'inbox') {
      const actor = inboxActor(request)
      if (!actor) return response({ error: 'Sign in with a verified account to use the inbox.' }, 401)
      const text = String(body.message || '').trim()
      if (!text || text.length > 4000) return response({ error: 'Messages must contain 1 to 4,000 characters.' }, 400)
      let db
      try { db = await getDb() } catch (databaseError) { return databaseUnavailable(databaseError) }

      if (parts[1]) {
        const thread = await db.collection('inbox_threads').findOne({ id: parts[1] })
        if (!thread || (actor.role !== 'admin' && !isInboxParticipant(thread, actor))) {
          return response({ error: 'Conversation not found or you do not have access.' }, 404)
        }
        const now = new Date().toISOString()
        const message = {
          id: randomUUID(),
          threadId: thread.id,
          senderId: actor.id,
          senderRole: actor.role,
          senderName: actor.name,
          body: text,
          readBy: [actor.id],
          createdAt: now,
        }
        try {
          await db.collection('inbox_messages').insertOne(message)
          await db.collection('inbox_threads').updateOne(
            { id: thread.id },
            { $set: { lastMessageAt: now, lastMessagePreview: text.slice(0, 180), lastMessageSenderId: actor.id } },
          )
        } catch (error) {
          return databaseUnavailable(error)
        }
        return response({ message: serialize(message) }, 201)
      }

      const subject = String(body.subject || '').trim()
      if (!subject || subject.length > 160) return response({ error: 'Enter a subject of up to 160 characters.' }, 400)
      let recipient
      let property = null
      if (body.propertyId) {
        property = await db.collection('properties').findOne({ id: String(body.propertyId) })
        if (!property || !['published', 'approved'].includes(property.status)) {
          return response({ error: 'This property is not available for new conversations.' }, 404)
        }
        recipient = await resolvePropertyRecipient(db, property, actor)
      } else {
        const recipientRole = String(body.recipientRole || '').trim().toLowerCase()
        if (actor.role === 'user' && !['admin', 'agent'].includes(recipientRole)) {
          return response({ error: 'Verified users can start conversations with an administrator or approved agent.' }, 403)
        }
        if (actor.role === 'agent' && !['admin', 'agent'].includes(recipientRole)) {
          return response({ error: 'Agents can start conversations with an administrator or another approved agent.' }, 403)
        }
        recipient = await resolveInboxRecipient(db, actor, body.recipientEmail, recipientRole)
      }
      if (!recipient) return response({ error: 'The recipient is not an active, verified HimBhumi account.' }, 404)
      if (recipient.id === actor.id) return response({ error: 'Choose another account to start this conversation.' }, 400)
      try {
        const created = await createInboxThread(db, actor, recipient, {
          subject,
          body: text,
          propertyId: property?.id,
          propertyTitle: property?.title,
        })
        return response(created, 201)
      } catch (error) {
        return databaseUnavailable(error)
      }
    }
    if (parts[0] === 'agent' && parts[1] === 'signup') {
      const name = String(body.name || '').trim()
      const email = String(body.email || '').trim().toLowerCase()
      const phone = String(body.phone || '').trim()
      const password = String(body.password || '')
      if (!name || name.length > 120) return response({ error: 'Enter your name (up to 120 characters).' }, 400)
      if (!isValidEmail(email) || email.length > 254) return response({ error: 'Enter a valid email address.' }, 400)
      if (phone.length > 40) return response({ error: 'Phone number must be 40 characters or fewer.' }, 400)
      if (password.length < 12 || password.length > 128) return response({ error: 'Choose a password between 12 and 128 characters.' }, 400)
      if (email === agentUsername()) return response({ error: 'This email is reserved for the configured agent account.' }, 409)
      if (!agentSecret()) return response({ error: 'Agent access is not configured. Please contact the site administrator.' }, 503)

      try {
        const db = await getDb()
        const agents = db.collection('agents')
        await agents.createIndex({ email: 1 }, { unique: true, name: 'agent_email_unique' })
        const salt = randomBytes(16).toString('hex')
        const agent = {
          id: randomUUID(),
          name,
          email,
          phone,
          applicationSource: 'email',
          passwordSalt: salt,
          passwordHash: hashAgentPassword(password, salt),
          status: 'pending',
          createdAt: new Date().toISOString(),
        }
        await agents.insertOne(agent)
      } catch (error) {
        if (error?.code === 11000) return response({ error: 'An agent application already exists for this email.' }, 409)
        return databaseUnavailable(error)
      }
      return response({ submitted: true, status: 'pending' }, 201)
    }
    if (parts[0] === 'agent' && parts[1] === 'login') {
      const username = String(body.username || body.email || '').trim().toLowerCase()
      const password = String(body.password || '')
      if (!agentSecret()) return response({ error: 'Agent access is not configured. Please contact the site administrator.' }, 503)
      if (password.length > 128) return response({ error: 'Invalid agent credentials' }, 401)
      let approvedAgent
      if (agentUsername() && agentPassword() && secureStringEqual(username, agentUsername()) && secureStringEqual(password, agentPassword())) {
        approvedAgent = { id: agentUsername(), email: agentUsername(), name: 'Agent' }
      } else {
        let agent
        try {
          const db = await getDb()
          agent = await db.collection('agents').findOne({ email: username })
        } catch (error) {
          return databaseUnavailable(error)
        }
        if (!agent || typeof agent.passwordSalt !== 'string' || typeof agent.passwordHash !== 'string' || !secureStringEqual(hashAgentPassword(password, agent.passwordSalt), agent.passwordHash)) {
          return response({ error: 'Invalid agent credentials' }, 401)
        }
        if (agent.status === 'pending') return response({ error: 'Your agent application is pending admin approval.' }, 403)
        if (agent.status !== 'approved') return response({ error: 'Your agent application has not been approved. Contact the site administrator for help.' }, 403)
        approvedAgent = agent
      }
      const token = signedToken({ role: 'agent', username: approvedAgent.email, email: approvedAgent.email, userId: approvedAgent.id, name: approvedAgent.name, exp: Date.now() + 8 * 60 * 60 * 1000 }, agentSecret())
      const result = response({ authenticated: true, username: approvedAgent.email, name: approvedAgent.name })
      result.cookies.set('himbhumi_agent', token, {
        httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
        maxAge: 8 * 60 * 60, path: '/',
      })
      return result
    }
    if (parts[0] === 'agent' && parts[1] === 'logout') {
      const result = response({ authenticated: false })
      result.cookies.set('himbhumi_agent', '', {
        httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
        maxAge: 0, path: '/',
      })
      result.cookies.set('himbhumi_session', '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 0, path: '/' })
      return result
    }
    if (parts[0] === 'auth' && parts[1] === 'logout') {
      const result = response({ authenticated: false })
      result.cookies.set('himbhumi_session', '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 0, path: '/' })
      result.cookies.set('himbhumi_agent', '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 0, path: '/' })
      result.cookies.set('himbhumi_admin', '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 0, path: '/' })
      return result
    }
    if (parts[0] === 'properties' && parts[2] === 'view') {
      const db = await getDb()
      const result = await db.collection('properties').updateOne(
        { id: parts[1], status: { $in: ['published', 'approved'] } },
        { $inc: { views: 1 } },
      )
      if (!result.matchedCount) return response({ error: 'Property not found' }, 404)
      const property = await db.collection('properties').findOne({ id: parts[1] }, { projection: { views: 1 } })
      return response({ recorded: true, views: property?.views || 0 })
    }
    if (parts[0] === 'admin' && parts[1] === 'login') {
      return response({ error: 'Password-based administrator sign-in is disabled. Use an authorized Google account.' }, 403)
    }
    if (parts[0] === 'admin' && parts[1] === 'logout') {
      const result = response({ authenticated: false })
      result.cookies.set('himbhumi_admin', '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 0, path: '/' })
      result.cookies.set('himbhumi_session', '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 0, path: '/' })
      return result
    }
    if (parts[0] === 'locations') {
      const authError = requireAdmin(request)
      if (authError) return authError

      let db
      try {
        db = await getDb()
      } catch (databaseError) {
        return databaseUnavailable(databaseError)
      }

      const catalog = await getLocationCatalog(db)
      const collection = db.collection('locations')
      if (parts[1] === 'import') {
        const inputs = body.locations
        if (!Array.isArray(inputs) || inputs.length === 0 || inputs.length > 1000) {
          return response({ error: 'Provide between 1 and 1,000 location records per import.' }, 400)
        }

        const byId = new Map(catalog.map((location) => [location.id, location]))
        const byKey = new Map(catalog.map((location) => [
          `${location.type}:${location.parentLocationId || ''}:${location.nameKey || normalizeLocationName(location.name)}`,
          location,
        ]))
        const importIds = new Set()
        const records = []

        try {
          for (const [index, input] of inputs.entries()) {
            if (!input || typeof input !== 'object' || Array.isArray(input)) {
              throw new Error(`Location ${index + 1} must be a JSON object.`)
            }
            const id = input.id ? String(input.id).trim() : randomUUID()
            if (!id || id.length > 120 || importIds.has(id)) {
              throw new Error(`Location ${index + 1} has an invalid or duplicate ID.`)
            }
            const existingId = byId.get(id)
            const parentId = String(input.parentLocationId || '').trim()
            const type = String(input.type || '').trim().toLowerCase()
            const parent = type === 'state' && !parentId ? null : byId.get(parentId)
            if (type !== 'state' && !parent) throw new Error(`Location ${index + 1} references an unknown parentLocationId.`)

            const record = makeLocationRecord(input, parent, id)
            const key = `${record.type}:${record.parentLocationId}:${record.nameKey}`
            const duplicate = byKey.get(key)
            importIds.add(id)
            if (duplicate) {
              if (existingId && existingId.id !== duplicate.id) {
                throw new Error(`Location ${index + 1} reuses an ID for a different existing location.`)
              }
              byId.set(id, duplicate)
              if (input.id) byId.set(String(input.id).trim(), duplicate)
              continue
            }
            if (existingId) throw new Error(`Location ${index + 1} reuses an existing ID for a different location.`)

            records.push(record)
            byId.set(id, record)
            byKey.set(key, record)
          }
        } catch (error) {
          return response({ error: error.message }, 400)
        }

        const result = records.length ? await collection.bulkWrite(records.map((location) => ({
          updateOne: {
            filter: {
              type: location.type,
              parentLocationId: location.parentLocationId,
              nameKey: location.nameKey,
            },
            update: { $setOnInsert: location },
            upsert: true,
          },
        })), { ordered: false }) : null
        const created = result?.upsertedCount || 0
        return response({ created, existing: inputs.length - created })
      }
      if (parts.length !== 1) return response({ error: 'Route not found' }, 404)

      const parentId = String(body.parentLocationId || '').trim()
      const type = String(body.type || '').trim().toLowerCase()
      const parent = type === 'state' && !parentId
        ? null
        : catalog.find((location) => location.id === parentId)
      let location
      try {
        location = makeLocationRecord(body, parent)
      } catch (error) {
        return response({ error: error.message }, 400)
      }
      const duplicate = await collection.findOne({
        type: location.type,
        parentLocationId: location.parentLocationId,
        nameKey: location.nameKey,
      })
      if (duplicate) return response({ location: presentLocations([...catalog, serialize(duplicate)]).find((item) => item.id === duplicate.id), duplicate: true })
      try {
        await collection.insertOne(location)
      } catch (error) {
        if (error?.code !== 11000) throw error
        const existingLocation = await collection.findOne({
          type: location.type,
          parentLocationId: location.parentLocationId,
          nameKey: location.nameKey,
        })
        if (!existingLocation) throw error
        return response({ location: serialize(existingLocation), duplicate: true })
      }
      return response({
        location: presentLocations([...catalog, location]).find((item) => item.id === location.id),
        duplicate: false,
      }, 201)
    }
    if (parts[0] === 'properties') {
      const authError = requireAdmin(request)
      if (authError) return authError
    }
    const adminWrite = ['messages'].includes(parts[0]) || (parts[0] === 'inquiries' && parts[1])
    if (adminWrite) {
      const authError = requireAdmin(request)
      if (authError) return authError
    }
    let db
    try { db = await getDb() } catch (databaseError) { return databaseUnavailable(databaseError) }
    const locationCatalog = await getLocationCatalog(db)
    if (parts[0] === 'inquiries') {
      if (!body.fullName || !body.mobile || !body.propertyId) return response({ error: 'Name, mobile, and property are required' }, 400)
      const inquiry = { id: randomUUID(), ...body, createdAt: new Date().toISOString(), status: 'new' }
      await db.collection('inquiries').insertOne(inquiry)
      let inboxThreadId = ''
      let inboxError = ''
      const actor = inboxActor(request)
      if (actor) {
        try {
          const property = await db.collection('properties').findOne({ id: String(inquiry.propertyId) })
          if (property) {
            const recipient = await resolvePropertyRecipient(db, property, actor)
            const initialMessage = String(inquiry.message || '').trim().slice(0, 4000) || `I’m interested in ${property.title}. Please share more information.`
            const created = await createInboxThread(db, actor, recipient, {
              subject: `Enquiry: ${String(property.title || 'Property').slice(0, 140)}`,
              body: initialMessage,
              propertyId: property.id,
              propertyTitle: property.title,
              inquiryId: inquiry.id,
            })
            inboxThreadId = created.thread.id
          }
        } catch (error) {
          console.error('Inquiry inbox conversation could not be created:', { name: error?.name || 'DatabaseError', code: error?.code || null })
          inboxError = 'Your enquiry was received, but its private inbox conversation could not be created. Please contact the administrator.'
        }
      }
      const notification = await notifyAdminRecipients(`New property enquiry from ${inquiry.fullName}`, inquiryNotification(inquiry))
      return response({ inquiry: serialize(inquiry), notification, inboxThreadId, inboxError }, 201)
    }
    if (parts[0] === 'messages') {
      if (!body.to || !body.subject || !body.message) return response({ error: 'Recipient, subject, and message are required' }, 400)
      const message = { id: randomUUID(), to: String(body.to).trim(), subject: String(body.subject).trim(), message: String(body.message).trim(), enquiryId: body.enquiryId || null, status: 'stored', createdAt: new Date().toISOString() }
      if (smtpConfigured() && isValidEmail(message.to)) {
        try {
          await sendMessageEmail(message.to, message.subject, message.message)
          message.status = 'sent'
        } catch (error) {
          message.status = 'delivery_failed'
          message.deliveryError = error?.message || 'Email delivery failed'
        }
      }
      try {
        await db.collection('messages').insertOne(message)
      } catch (databaseError) {
        return databaseUnavailable(databaseError)
      }
      const notification = await notifyAdminRecipients(`New HimBhumi message: ${message.subject}`, messageNotification(message))
      return response({ message: serialize(message), notification }, 201)
    }
    if (parts[0] === 'properties') {
      if (!body.title || !body.location || !body.price) return response({ error: 'Title, location, and price are required' }, 400)
      if (!isSupportedTourUrl(body.virtualTourUrl)) return response({ error: 'Use a valid HTTPS Matterport, Kuula, or Pannellum tour URL.' }, 400)
      const location = body.locationId ? locationCatalog.find((item) => item.id === body.locationId) : null
      if (body.locationId && !location) return response({ error: 'Select a location from the location catalog.' }, 400)
      const property = {
        id: randomUUID(),
        ...body,
        ...(location ? propertyLocationFields(location, locationCatalog) : {}),
        gallery: body.gallery || [body.image].filter(Boolean),
        createdAt: new Date().toISOString(),
        status: body.status || 'published',
      }
      await db.collection('properties').insertOne(property)
      return response({ property: serialize(property) }, 201)
    }
    if (parts[0] === 'listings' && parts[1] === 'verify') {
      // Email OTP via SMTP (Nodemailer). When SMTP_* env vars are set, a real email is sent;
      // otherwise the flow falls back to an on-screen demo OTP (devOtp) so it works without SMTP.
      const action = parts[2]
      const value = String(body.value || body.email || '').trim().toLowerCase()
      if (!isValidEmail(value)) return response({ error: 'Please enter a valid email address' }, 400)
      const key = `email:${value}`
      if (action === 'send') {
        const otp = String(Math.floor(100000 + Math.random() * 900000))
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
        if (smtpConfigured()) {
          try {
            await sendOtpEmail(value, otp)
            await db.collection('otps').updateOne({ key }, { $set: { key, channel: 'email', value, provider: 'smtp', otp, expiresAt, verified: false, createdAt: new Date().toISOString() } }, { upsert: true })
            return response({ sent: true, mocked: false })
          } catch (err) {
            // Graceful degradation: if the mail provider rejects the request (e.g. unauthorized IP
            // or unverified sender), keep the listing flow usable with an on-screen code.
            console.error('SMTP send error:', err?.message)
            await db.collection('otps').updateOne({ key }, { $set: { key, channel: 'email', value, provider: 'demo', otp, expiresAt, verified: false, createdAt: new Date().toISOString(), smtpError: err?.message || 'send failed' } }, { upsert: true })
            return response({ sent: true, devOtp: otp, mocked: true, notice: 'Email delivery is temporarily unavailable, so your code is shown on screen.' })
          }
        }
        await db.collection('otps').updateOne({ key }, { $set: { key, channel: 'email', value, provider: 'demo', otp, expiresAt, verified: false, createdAt: new Date().toISOString() } }, { upsert: true })
        return response({ sent: true, devOtp: otp, mocked: true })
      }
      if (action === 'check') {
        const entered = String(body.otp || '').trim()
        const record = await db.collection('otps').findOne({ key })
        if (!record) return response({ error: 'Please request a code first' }, 400)
        if (new Date(record.expiresAt) < new Date()) return response({ error: 'Code expired. Please request a new one.' }, 400)
        if (record.otp !== entered) return response({ error: 'Incorrect code. Please try again.' }, 400)
        await db.collection('otps').updateOne({ key }, { $set: { verified: true } })
        return response({ verified: true, channel: 'email' })
      }
      return response({ error: 'Unknown verification action' }, 404)
    }
    if (parts[0] === 'listings') {
      const required = ['title', 'category', 'listingType', 'price', 'contactName', 'email']
      const missing = required.filter((field) => !String(body[field] || '').trim())
      if (missing.length) return response({ error: `Please fill: ${missing.join(', ')}` }, 400)
      if (!isValidEmail(body.email)) return response({ error: 'A valid email address is required' }, 400)
      if (!body.emailVerified) return response({ error: 'Email verification is required before submitting' }, 400)
      if (!body.authorized) return response({ error: 'Please confirm you are authorized to advertise this property' }, 400)
      let coordinates
      try { coordinates = propertyCoordinates(body) } catch (error) { return response({ error: error.message }, 400) }
      const listingId = `HB-${randomUUID().slice(0, 6).toUpperCase()}`
      const listing = {
        id: randomUUID(),
        listingId,
        ...body,
        ...coordinates,
        status: 'pending_review',
        verified: false,
        featured: false,
        ...(agentSession(request) ? { agentOwnerId: agentOwnerId(request) } : {}),
        createdAt: new Date().toISOString(),
      }
      if (!isSupportedTourUrl(listing.virtualTourUrl)) return response({ error: 'Use a valid HTTPS Matterport, Kuula, or Pannellum tour URL.' }, 400)
      if (body.locationId) {
        const location = locationCatalog.find((item) => item.id === body.locationId)
        if (!location || !['city', 'village'].includes(location.type)) {
          return response({ error: 'Select an existing city, town, or village from the location catalog.' }, 400)
        }
        Object.assign(listing, propertyLocationFields(location, locationCatalog))
      }
      await db.collection('listings').insertOne(listing)
      return response({ listingId, id: listing.id, status: listing.status }, 201)
    }
    return response({ error: 'Route not found' }, 404)
  } catch (error) { return response({ error: error?.message || 'Server error' }, 500) }
}

export async function PUT(request, { params }) {
  try {
    const routeParams = await params
    const parts = routeParams?.path || []
    const body = await request.json()
    if (parts[0] === 'agents') {
      const authError = requireAdmin(request)
      if (authError) return authError
      if (!parts[1]) return response({ error: 'Agent ID is required.' }, 400)
      const status = body.status
      if (!['approved', 'rejected'].includes(status)) return response({ error: 'Agent status must be approved or rejected.' }, 400)
      try {
        const db = await getDb()
        const result = await db.collection('agents').updateOne(
          { id: parts[1], status: 'pending' },
          { $set: { status, reviewedAt: new Date().toISOString() } },
        )
        if (!result.matchedCount) return response({ error: 'Pending agent application not found.' }, 404)
        return response({ updated: true, status })
      } catch (error) {
        return databaseUnavailable(error)
      }
    }
    if (parts[0] === 'user' && parts[1] === 'favorites') {
      const session = accountSession(request)
      if (!session) return response({ error: 'Authentication required' }, 401)
      const favoriteIds = body.favoriteIds
      if (!Array.isArray(favoriteIds) || favoriteIds.length > 500 || favoriteIds.some((id) => typeof id !== 'string')) {
        return response({ error: 'favoriteIds must be an array of up to 500 property IDs.' }, 400)
      }
      const db = await getDb()
      const ids = [...new Set(favoriteIds)]
      const found = await db.collection('properties').find({ id: { $in: ids } }, { projection: { id: 1 } }).toArray()
      const validIds = found.map((property) => property.id)
      const userId = session.userId || session.email || session.username
      await db.collection('user_favorites').updateOne(
        { userId },
        { $set: { userId, favoriteIds: validIds, updatedAt: new Date().toISOString() } },
        { upsert: true },
      )
      return response({ favoriteIds: validIds })
    }
    if (parts[0] === 'agent' && parts[1] === 'listings' && parts[2]) {
      const authError = requireAgent(request)
      if (authError) return authError
      let db
      try { db = await getDb() } catch (databaseError) { return databaseUnavailable(databaseError) }
      const listingCollection = db.collection('listings')
      const ownerIds = agentOwnerIds(request)
      const listing = await listingCollection.findOne({ id: parts[2], agentOwnerId: { $in: ownerIds } })
      if (!listing) return response({ error: 'Listing not found or you do not have permission to edit it.' }, 404)
      const ownerId = listing.agentOwnerId
      const updates = propertyEditFields(body)
      if (Object.hasOwn(body, 'latitude') || Object.hasOwn(body, 'longitude')) {
        try {
          Object.assign(updates, propertyCoordinates({
            latitude: Object.hasOwn(body, 'latitude') ? body.latitude : listing.latitude,
            longitude: Object.hasOwn(body, 'longitude') ? body.longitude : listing.longitude,
          }))
        } catch (error) { return response({ error: error.message }, 400) }
      }
      if (updates.virtualTourUrl && !isSupportedTourUrl(updates.virtualTourUrl)) {
        return response({ error: 'Use a valid HTTPS Matterport, Kuula, or Pannellum tour URL.' }, 400)
      }
      if (updates.locationId) {
        const catalog = await getLocationCatalog(db)
        const location = catalog.find((item) => item.id === updates.locationId)
        if (!location || !['city', 'village'].includes(location.type)) {
          return response({ error: 'Select an existing city, town, or village from the location catalog.' }, 400)
        }
        Object.assign(updates, propertyLocationFields(location, catalog))
      }
      updates.updatedAt = new Date().toISOString()
      await listingCollection.updateOne({ id: listing.id, agentOwnerId: ownerId }, { $set: updates })
      const merged = { ...listing, ...updates }
      if (merged.status === 'approved') {
        const existing = await db.collection('properties').findOne({ id: merged.id })
        await db.collection('properties').updateOne(
          { id: merged.id, agentOwnerId: ownerId },
          { $set: { ...listingToProperty(merged), status: merged.publicationStatus || existing?.status || 'published', agentOwnerId: ownerId, views: existing?.views || 0 } },
          { upsert: true },
        )
      }
      return response({ listing: serialize(merged) })
    }
    const authError = requireAdmin(request)
    if (authError) return authError
    let db
    try { db = await getDb() } catch (databaseError) { return databaseUnavailable(databaseError) }
    const locationCatalog = await getLocationCatalog(db)
    if (parts[0] === 'inquiries' && parts[1]) {
      const allowedStages = ['new', 'contacted', 'qualified', 'viewing_scheduled', 'offer_made', 'closed', 'lost']
      const updates = {}
      if (Object.prototype.hasOwnProperty.call(body, 'status')) {
        if (typeof body.status !== 'string' || !allowedStages.includes(body.status)) {
          return response({ error: 'Choose a valid CRM pipeline stage.' }, 400)
        }
        updates.status = body.status
      }
      if (Object.prototype.hasOwnProperty.call(body, 'notes')) {
        if (typeof body.notes !== 'string' || body.notes.length > 2000) {
          return response({ error: 'CRM notes must be text no longer than 2,000 characters.' }, 400)
        }
        updates.notes = body.notes.trim()
      }
      if (Object.prototype.hasOwnProperty.call(body, 'followUpAt')) {
        const followUpAt = body.followUpAt
        const parsedDate = typeof followUpAt === 'string' && followUpAt
          ? new Date(`${followUpAt}T00:00:00.000Z`)
          : null
        if (
          typeof followUpAt !== 'string'
          || (followUpAt !== '' && (
            !/^\d{4}-\d{2}-\d{2}$/.test(followUpAt)
            || Number.isNaN(parsedDate.getTime())
            || parsedDate.toISOString().slice(0, 10) !== followUpAt
          ))
        ) {
          return response({ error: 'Choose a valid follow-up date.' }, 400)
        }
        updates.followUpAt = followUpAt
      }
      if (!Object.keys(updates).length) return response({ error: 'No CRM updates were provided.' }, 400)
      updates.updatedAt = new Date().toISOString()
      const result = await db.collection('inquiries').updateOne({ id: parts[1] }, { $set: updates })
      return result.matchedCount ? response({ success: true }) : response({ error: 'Enquiry not found' }, 404)
    }
    if (parts[0] === 'messages' && parts[1]) {
      const result = await db.collection('messages').updateOne({ id: parts[1] }, { $set: { ...body, updatedAt: new Date().toISOString() } })
      return result.matchedCount ? response({ success: true }) : response({ error: 'Message not found' }, 404)
    }
    if (parts[0] === 'listings' && parts[1]) {
      const { id, _id, ...updates } = body
      const existing = await db.collection('listings').findOne({ id: parts[1] })
      if (!existing) return response({ error: 'Listing not found' }, 404)
      if (Object.hasOwn(updates, 'latitude') || Object.hasOwn(updates, 'longitude')) {
        try {
          Object.assign(updates, propertyCoordinates({
            latitude: Object.hasOwn(updates, 'latitude') ? updates.latitude : existing.latitude,
            longitude: Object.hasOwn(updates, 'longitude') ? updates.longitude : existing.longitude,
          }))
        } catch (error) { return response({ error: error.message }, 400) }
      }
      if (updates.locationId) {
        const location = locationCatalog.find((item) => item.id === updates.locationId)
        if (!location || !['city', 'village'].includes(location.type)) {
          return response({ error: 'Select an existing city, town, or village from the location catalog.' }, 400)
        }
        Object.assign(updates, propertyLocationFields(location, locationCatalog))
      }
      await db.collection('listings').updateOne({ id: parts[1] }, { $set: { ...updates, updatedAt: new Date().toISOString() } })
      const merged = { ...existing, ...updates }
      // Publish on approve: keep a public property in sync with the approved listing.
      if (merged.status === 'approved') {
        const property = await db.collection('properties').findOne({ id: merged.id })
        const publicationStatus = merged.publicationStatus || property?.status || 'published'
        await db.collection('listings').updateOne(
          { id: merged.id },
          { $set: { publicationStatus, updatedAt: new Date().toISOString() } },
        )
        await db.collection('properties').updateOne(
          { id: merged.id },
          { $set: { ...listingToProperty({ ...merged, publicationStatus }), ...(merged.agentOwnerId ? { agentOwnerId: merged.agentOwnerId } : {}), views: property?.views || 0 } },
          { upsert: true },
        )
      } else {
        await db.collection('properties').deleteOne({ id: merged.id })
      }
      return response({ success: true, published: merged.status === 'approved' })
    }
    if (parts[0] !== 'properties' || !parts[1]) return response({ error: 'Route not found' }, 404)
    const { id, _id, ...updates } = body
    if (Object.hasOwn(updates, 'status') && !['published', 'draft', 'sold'].includes(updates.status)) {
      return response({ error: 'Property status must be published, draft, or sold.' }, 400)
    }
    const existingProperty = await db.collection('properties').findOne({ id: parts[1] })
    if (!existingProperty) return response({ error: 'Property not found' }, 404)
    if (Object.hasOwn(updates, 'latitude') || Object.hasOwn(updates, 'longitude')) {
      try {
        Object.assign(updates, propertyCoordinates({
          latitude: Object.hasOwn(updates, 'latitude') ? updates.latitude : existingProperty.latitude,
          longitude: Object.hasOwn(updates, 'longitude') ? updates.longitude : existingProperty.longitude,
        }))
      } catch (error) { return response({ error: error.message }, 400) }
    }
    if (updates.locationId) {
      const location = locationCatalog.find((item) => item.id === updates.locationId)
      if (!location) return response({ error: 'Select an existing location from the location catalog.' }, 400)
      Object.assign(updates, propertyLocationFields(location, locationCatalog))
    }
    const result = await db.collection('properties').updateOne({ id: parts[1] }, { $set: { ...updates, updatedAt: new Date().toISOString() } })
    if (Object.hasOwn(updates, 'status')) {
      await db.collection('listings').updateOne({ id: parts[1] }, { $set: { publicationStatus: updates.status, updatedAt: new Date().toISOString() } })
    }
    return result.matchedCount ? response({ property: serialize({ ...existingProperty, ...updates, id: parts[1] }) }) : response({ error: 'Property not found' }, 404)
  } catch (error) { return response({ error: error?.message || 'Server error' }, 500) }
}

export async function DELETE(request, { params }) {
  try {
    const authError = requireAdmin(request)
    if (authError) return authError
    const routeParams = await params
    const parts = routeParams?.path || []
    let db
    try { db = await getDb() } catch (databaseError) { return databaseUnavailable(databaseError) }
    if (parts[0] === 'messages' && parts[1]) {
      const result = await db.collection('messages').deleteOne({ id: parts[1] })
      return result.deletedCount ? response({ success: true }) : response({ error: 'Message not found' }, 404)
    }
    if (parts[0] === 'listings' && parts[1]) {
      const result = await db.collection('listings').deleteOne({ id: parts[1] })
      await db.collection('properties').deleteOne({ id: parts[1] })
      return result.deletedCount ? response({ success: true }) : response({ error: 'Listing not found' }, 404)
    }
    if (parts[0] !== 'properties' || !parts[1]) return response({ error: 'Route not found' }, 404)
    const result = await db.collection('properties').deleteOne({ id: parts[1] })
    return result.deletedCount ? response({ success: true }) : response({ error: 'Property not found' }, 404)
  } catch (error) { return response({ error: error?.message || 'Server error' }, 500) }
}