'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, MapPin, X } from 'lucide-react'
import { locationLabel } from '../lib/location-utils'

function findLocation(value, locations) {
  return locations.find((location) => location.id === value) ||
    locations.find((location) => location.urlPath === value) ||
    locations
      .filter((location) => location.name.toLocaleLowerCase() === String(value).toLocaleLowerCase())
      .sort((a, b) => {
        const priority = { city: 0, village: 1, district: 2, tehsil: 3, state: 4 }
        return priority[a.type] - priority[b.type]
      })[0]
}

export default function LocationSearch({ locations, value, onChange, className = '', label }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const selected = findLocation(value, locations)

  useEffect(() => {
    if (open) return
    setQuery(selected ? locationLabel(selected) : value || '')
  }, [open, selected, value])

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    if (!normalized) return []
    const matching = locations.filter((location) =>
      [location.name, location.state, location.district, location.tehsil, location.city]
        .some((part) => String(part || '').toLocaleLowerCase().includes(normalized)),
    )
    const selectedFirst = matching.sort((a, b) => {
      const exactA = a.name.toLocaleLowerCase() === normalized ? 0 : 1
      const exactB = b.name.toLocaleLowerCase() === normalized ? 0 : 1
      return exactA - exactB || (a.legacyOrder ?? 10000) - (b.legacyOrder ?? 10000)
    })
    return selectedFirst.slice(0, 10)
  }, [locations, query])

  const updateQuery = (nextQuery) => {
    setQuery(nextQuery)
    setOpen(true)
    const match = findLocation(nextQuery, locations)
    onChange(match?.id || nextQuery)
  }

  return (
    <div className={`relative min-w-0 ${className}`}>
      <label className="sr-only" htmlFor="himbhumi-location-search">{label}</label>
      <div className="flex min-w-0 items-center gap-2">
        <MapPin size={17} aria-hidden="true" className="shrink-0 text-teal-700" />
        <input
          id="himbhumi-location-search"
          type="search"
          autoComplete="off"
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          onFocus={() => setOpen(Boolean(query.trim()))}
          aria-label={label}
          aria-expanded={open && suggestions.length > 0}
          aria-controls="himbhumi-location-suggestions"
          placeholder="Search state, district, tehsil, city, or village"
          className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-current/50"
        />
        {query && <button type="button" aria-label="Clear location search" onClick={() => { setQuery(''); setOpen(false); onChange('') }} className="rounded-full p-1 opacity-75 hover:opacity-100"><X size={15} /></button>}
        <ChevronDown size={15} aria-hidden="true" className="shrink-0 opacity-60" />
      </div>
      {open && suggestions.length > 0 && (
        <ul id="himbhumi-location-suggestions" className="absolute left-0 right-0 top-full z-40 mt-3 max-h-72 overflow-y-auto rounded-xl border border-border bg-white p-2 text-foreground shadow-xl" aria-label="Matching locations">
          {suggestions.map((location, index) => (
            <li key={`${location.id}-${index}`}>
              <button
                type="button"
                onClick={() => { setQuery(locationLabel(location)); onChange(location.id); setOpen(false) }}
                className="w-full rounded-lg px-3 py-2 text-left hover:bg-teal-50 focus:bg-teal-50 focus:outline-none"
              >
                <span className="block text-sm font-medium">{location.name}</span>
                <span className="mt-0.5 block text-xs capitalize text-muted-foreground">{location.type} · {[location.tehsil, location.district, location.state].filter((part) => part && part !== location.name).join(', ')}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query.trim() && !suggestions.length && <p className="absolute left-0 right-0 top-full z-40 mt-3 rounded-xl border border-border bg-white p-3 text-sm text-muted-foreground shadow-xl">No matching locations found.</p>}
    </div>
  )
}
