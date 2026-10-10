'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, MapPin, Plus } from 'lucide-react'
import { locationLabel } from '../lib/location-utils'

const parentTypes = {
  state: null,
  district: 'state',
  tehsil: 'district',
  city: 'tehsil',
  village: 'city',
}

const emptyForm = { name: '', type: 'city', parentLocationId: '', latitude: '', longitude: '' }

async function request(path, options) {
  const response = await fetch(path, options)
  const data = await response.json()
  if (!response.ok) throw new Error(data?.error || 'The location request failed')
  return data
}

export default function LocationManager() {
  const [locations, setLocations] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const data = await request('/api/locations')
      setLocations(data.locations || [])
      setError('')
    } catch (reason) {
      setError(reason.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const availableParents = useMemo(() => locations.filter(
    (location) => location.type === parentTypes[form.type],
  ), [locations, form.type])

  const visibleLocations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    if (!query) return locations.slice(0, 30)
    return locations.filter((location) =>
      `${location.name} ${location.type} ${location.district} ${location.tehsil} ${location.state}`
        .toLocaleLowerCase()
        .includes(query),
    ).slice(0, 30)
  }, [locations, search])

  const addLocation = async (event) => {
    event.preventDefault()
    setSaving(true)
    setNotice('')
    setError('')
    try {
      const data = await request('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          latitude: form.latitude || undefined,
          longitude: form.longitude || undefined,
        }),
      })
      setForm(emptyForm)
      setNotice(data.duplicate ? 'This location already exists; no duplicate was added.' : `${data.location.name} added to the location catalog.`)
      await load()
    } catch (reason) {
      setError(reason.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700"><MapPin size={15} /> Location catalog</p>
        <h2 className="mt-2 font-serif text-2xl">Cities, towns & villages</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Add and search locations directly. Build the hierarchy from a district through a tehsil and city to a village.
        </p>
      </div>

      {(notice || error) && <p role={error ? 'alert' : 'status'} aria-live="polite" className={`mt-4 rounded-lg px-4 py-3 text-sm ${error ? 'bg-red-50 text-red-800' : 'bg-teal-50 text-teal-900'}`}>{error || notice}</p>}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
        <form onSubmit={addLocation} className="space-y-4 rounded-2xl border border-border bg-[#f8faf8] p-5">
          <h3 className="font-semibold">Add one location</h3>
          <label className="block text-sm font-medium">
            Name
            <input required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm" placeholder="e.g. Dattowal" />
          </label>
          <label className="block text-sm font-medium">
            Location type
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value, parentLocationId: '' })} className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm">
              <option value="state">State / Union Territory</option>
              <option value="district">District</option>
              <option value="tehsil">Tehsil / Sub-Division</option>
              <option value="city">City / Town</option>
              <option value="village">Village / Locality</option>
            </select>
          </label>
          {form.type !== 'state' && <label className="block text-sm font-medium">
            Parent {parentTypes[form.type]}
            <select required value={form.parentLocationId} onChange={(event) => setForm({ ...form, parentLocationId: event.target.value })} className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm">
              <option value="">Choose the parent location</option>
              {availableParents.map((location, index) => <option key={`${location.id}-${index}`} value={location.id}>{locationLabel(location)}</option>)}
            </select>
          </label>}
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium">Latitude (optional)<input type="number" min="-90" max="90" step="any" value={form.latitude} onChange={(event) => setForm({ ...form, latitude: event.target.value })} className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm" /></label>
            <label className="block text-sm font-medium">Longitude (optional)<input type="number" min="-180" max="180" step="any" value={form.longitude} onChange={(event) => setForm({ ...form, longitude: event.target.value })} className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm" /></label>
          </div>
          <button disabled={saving || loading} className="inline-flex items-center gap-2 rounded-lg bg-teal-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Add location
          </button>
        </form>

        <div className="rounded-2xl border border-border p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">Location directory</h3>
              <p className="mt-1 text-xs text-muted-foreground">{locations.length} locations available</p>
            </div>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search names or districts" aria-label="Search locations" className="w-full rounded-lg border border-border px-3 py-2 text-sm sm:w-auto" />
          </div>
          {loading ? <p className="mt-4 text-sm text-muted-foreground">Loading locations…</p> : (
            <ul className="mt-4 grid max-h-[420px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {visibleLocations.map((location, index) => (
                <li key={`${location.id}-${index}`} className="rounded-xl border border-border bg-[#fbfcfb] px-3 py-2.5">
                  <p className="text-sm font-medium">{location.name}</p>
                  <p className="mt-0.5 text-xs capitalize text-muted-foreground">{location.type} · {location.district || location.state || 'Himachal Pradesh'}</p>
                </li>
              ))}
            </ul>
          )}
          {!loading && !visibleLocations.length && <p className="mt-4 text-sm text-muted-foreground">No locations match that search.</p>}
          {!search && locations.length > visibleLocations.length && <p className="mt-3 text-xs text-muted-foreground">Showing the first {visibleLocations.length}. Search to find more.</p>}
        </div>
      </div>
    </section>
  )
}
