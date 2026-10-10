'use client'

import { useEffect, useRef, useState } from 'react'
import { Crosshair, MapPin, RotateCcw } from 'lucide-react'

const DEFAULT_CENTER = [22.9734, 78.6569]

function coordinatesFrom(latitude, longitude) {
  if (String(latitude ?? '').trim() === '' || String(longitude ?? '').trim() === '') return null
  const lat = Number(latitude)
  const lng = Number(longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  return [lat, lng]
}

export default function PropertyLocationPicker({ latitude, longitude, onChange }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const onChangeRef = useRef(onChange)
  const [mapReady, setMapReady] = useState(false)
  const [locating, setLocating] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  onChangeRef.current = onChange

  useEffect(() => {
    let active = true
    let map

    import('leaflet').then(({ default: L }) => {
      if (!active || !containerRef.current) return

      const initialPoint = coordinatesFrom(latitude, longitude)
      map = L.map(containerRef.current, { scrollWheelZoom: false })
      map.setView(initialPoint || DEFAULT_CENTER, initialPoint ? 16 : 5)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      }).addTo(map)

      const pinIcon = L.divIcon({
        className: 'property-map-marker',
        html: '<span></span>',
        iconSize: [30, 40],
        iconAnchor: [15, 38],
      })
      const selectPoint = (point) => {
        const selected = [Number(point.lat.toFixed(6)), Number(point.lng.toFixed(6))]
        if (!markerRef.current) {
          markerRef.current = L.marker(selected, { draggable: true, icon: pinIcon }).addTo(map)
          markerRef.current.on('dragend', (event) => selectPoint(event.target.getLatLng()))
        } else {
          markerRef.current.setLatLng(selected)
        }
        setMessage('Pin location selected. Drag the marker to fine-tune it.')
        setError('')
        onChangeRef.current(selected[0].toFixed(6), selected[1].toFixed(6))
      }

      if (initialPoint) {
        markerRef.current = L.marker(initialPoint, { draggable: true, icon: pinIcon }).addTo(map)
        markerRef.current.on('dragend', (event) => selectPoint(event.target.getLatLng()))
      }
      map.on('click', (event) => selectPoint(event.latlng))
      map.on('locationfound', (event) => {
        setLocating(false)
        selectPoint(event.latlng)
        map.setZoom(16)
      })
      map.on('locationerror', () => {
        setLocating(false)
        setError('Your location could not be detected. You can still place the pin manually on the map.')
      })

      mapRef.current = map
      setMapReady(true)
      requestAnimationFrame(() => map.invalidateSize())
    }).catch(() => {
      if (active) setError('The map could not be loaded. Check your connection and try again.')
    })

    return () => {
      active = false
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const point = coordinatesFrom(latitude, longitude)
    if (!point) {
      markerRef.current?.remove()
      markerRef.current = null
      return
    }

    const currentPoint = markerRef.current?.getLatLng()
    if (currentPoint && Math.abs(currentPoint.lat - point[0]) < 0.000001 && Math.abs(currentPoint.lng - point[1]) < 0.000001) return
    if (markerRef.current) markerRef.current.setLatLng(point)
    else {
      import('leaflet').then(({ default: L }) => {
        if (mapRef.current !== map || markerRef.current) return
        const pinIcon = L.divIcon({
          className: 'property-map-marker',
          html: '<span></span>',
          iconSize: [30, 40],
          iconAnchor: [15, 38],
        })
        markerRef.current = L.marker(point, { draggable: true, icon: pinIcon }).addTo(map)
        markerRef.current.on('dragend', (event) => {
          const selected = [Number(event.target.getLatLng().lat.toFixed(6)), Number(event.target.getLatLng().lng.toFixed(6))]
          onChangeRef.current(selected[0].toFixed(6), selected[1].toFixed(6))
        })
      }).catch(() => setError('The map pin could not be placed. Try selecting the location on the map.'))
    }
    map.setView(point, Math.max(map.getZoom(), 16), { animate: false })
  }, [latitude, longitude])

  const useCurrentLocation = () => {
    if (!mapRef.current) return
    setLocating(true)
    setError('')
    mapRef.current.locate({ setView: true, maxZoom: 16 })
  }

  const clearPin = () => {
    markerRef.current?.remove()
    markerRef.current = null
    setMessage('Pin removed.')
    setError('')
    onChangeRef.current('', '')
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900"><MapPin size={16} className="text-teal-800" /> Pin-drop property location</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Click the map to place a pin, or drag it to the exact property entrance.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={useCurrentLocation} disabled={!mapReady || locating} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-teal-900 transition hover:border-teal-700 disabled:opacity-50">
            <Crosshair size={14} /> {locating ? 'Locating…' : 'Use my location'}
          </button>
          {coordinatesFrom(latitude, longitude) && <button type="button" onClick={clearPin} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-red-300 hover:text-red-700">
            <RotateCcw size={14} /> Clear pin
          </button>}
        </div>
      </div>
      <div ref={containerRef} role="region" aria-label="Interactive OpenStreetMap property location map" tabIndex={0} className="property-location-map overflow-hidden rounded-xl border border-border bg-[#e7eee8]" />
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{error}</p>}
      {message && !error && <p role="status" className="text-xs text-teal-800">{message}</p>}
      <p className="text-xs text-muted-foreground">Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline underline-offset-2">OpenStreetMap contributors</a>.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-medium text-slate-700">
          Latitude
          <input name="latitude" type="number" inputMode="decimal" min="-90" max="90" step="any" value={latitude} onChange={(event) => onChange(event.target.value, longitude)} className={`${fieldClass} mt-1.5`} />
        </label>
        <label className="block text-xs font-medium text-slate-700">
          Longitude
          <input name="longitude" type="number" inputMode="decimal" min="-180" max="180" step="any" value={longitude} onChange={(event) => onChange(latitude, event.target.value)} className={`${fieldClass} mt-1.5`} />
        </label>
      </div>
    </div>
  )
}

const fieldClass = 'w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-700'
