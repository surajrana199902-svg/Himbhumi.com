'use client'

import { useEffect, useRef, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'

const bhkOptions = ['Studio', '1', '2', '3', '4+']
const typeOptions = [
  'Apartment / Flat',
  'House',
  'Villa',
  'Studio',
  'Commercial property',
  'Agricultural land',
  'Residential plot',
]

function formatLakhs(value, isRental) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return ''
  if (isRental) return `₹${amount.toLocaleString('en-IN')} / month`
  if (amount >= 100) return `₹${(amount / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`
  return `₹${amount.toLocaleString('en-IN')} L`
}

function FilterFields({ value, onChange, isRental }) {
  const toggle = (key, item) => {
    const list = value[key].includes(item)
      ? value[key].filter((entry) => entry !== item)
      : [...value[key], item]
    onChange({ ...value, [key]: list })
  }

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-sm font-semibold">{isRental ? 'Monthly rent range' : 'Price range'}</legend>
        <p className="mt-1 text-xs text-muted-foreground">{isRental ? 'Enter monthly amounts in rupees' : 'Enter amounts in lakhs'}</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="text-xs text-muted-foreground">Minimum
            <input type="number" min="0" max={isRental ? '100000000' : '100000'} value={value.minPrice} onChange={(event) => onChange({ ...value, minPrice: event.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground" placeholder={isRental ? '₹ / month' : '₹ Lakhs'} />
          </label>
          <label className="text-xs text-muted-foreground">Maximum
            <input type="number" min="0" max={isRental ? '100000000' : '100000'} value={value.maxPrice} onChange={(event) => onChange({ ...value, maxPrice: event.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground" placeholder={isRental ? '₹ / month' : '₹ Lakhs'} />
          </label>
        </div>
        {(value.minPrice || value.maxPrice) && <p className="mt-2 text-xs text-teal-800">{formatLakhs(value.minPrice || 0, isRental)} – {value.maxPrice ? formatLakhs(value.maxPrice, isRental) : 'Any'}</p>}
      </fieldset>
      <fieldset>
        <legend className="text-sm font-semibold">Bedrooms</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {bhkOptions.map((bhk) => (
            <button key={bhk} type="button" aria-pressed={value.bhk.includes(bhk)} onClick={() => toggle('bhk', bhk)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${value.bhk.includes(bhk) ? 'border-teal-900 bg-teal-900 text-white' : 'border-border hover:border-teal-700'}`}>{bhk === 'Studio' ? bhk : `${bhk} BHK`}</button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-sm font-semibold">Property type</legend>
        <div className="mt-3 space-y-2">
          {typeOptions.map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={value.types.includes(type)} onChange={() => toggle('types', type)} className="h-4 w-4 accent-teal-800" />
              {type}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

export default function PropertyFilters({ value, onChange, onApply, onReset, listingType = '' }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    const focusableSelector = 'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        return
      }
      if (event.key !== 'Tab') return
      const focusable = [...(panelRef.current?.querySelectorAll(focusableSelector) || [])]
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    panelRef.current?.querySelector(focusableSelector)?.focus()
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      triggerRef.current?.focus()
    }
  }, [open])

  return (
    <>
      <button ref={triggerRef} type="button" aria-expanded={open} aria-controls="property-filter-panel" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-semibold">
        <SlidersHorizontal size={16} /> Filters
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
          <section ref={panelRef} id="property-filter-panel" role="dialog" aria-modal="true" aria-labelledby="property-filter-title" className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 id="property-filter-title" className="font-serif text-2xl">Refine properties</h2>
              <button type="button" aria-label="Close filters" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-muted"><X size={18} /></button>
            </header>
            <div className="flex-1 overflow-y-auto p-5"><FilterFields value={value} onChange={onChange} isRental={listingType.toLowerCase() === 'for rent'} /></div>
            <footer className="flex gap-3 border-t border-border p-4">
              <button type="button" onClick={onReset} className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold">Reset all</button>
              <button type="button" onClick={() => { onApply(); setOpen(false) }} className="flex-1 rounded-xl bg-teal-900 px-4 py-3 text-sm font-semibold text-white">Apply filters</button>
            </footer>
          </section>
        </div>
      )}
    </>
  )
}
