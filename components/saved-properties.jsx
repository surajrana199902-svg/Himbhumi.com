'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, Heart, RefreshCw } from 'lucide-react'
import FavoriteButton from './favorite-button'
import useFavorites from '../hooks/use-favorites'

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(date)
}

export default function SavedProperties() {
  const { savedIds, ready, accountAuthenticated, syncError } = useFavorites()
  const [properties, setProperties] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshedAt, setRefreshedAt] = useState(null)

  const refreshProperties = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/properties', { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Could not load properties')
      setProperties(Array.isArray(data.properties) ? data.properties : [])
      setRefreshedAt(new Date())
    } catch (reason) {
      setError(reason.message || 'Could not load properties')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshProperties()
  }, [refreshProperties])

  const saved = properties.filter((property) => savedIds.includes(property.id))
  const checkedTime = refreshedAt
    ? new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(refreshedAt)
    : ''

  return (
    <main className="mx-auto max-w-6xl px-5 py-14">
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Your shortlist</p>
          <h1 className="mt-2 font-serif text-4xl">Saved properties</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {accountAuthenticated
              ? 'Signed in. Your favorites sync with your account; refresh to check the latest listing details.'
              : 'Saved on this device. Sign in with a verified account to sync your shortlist across devices.'}
          </p>
          {checkedTime && <p className="mt-1 text-xs text-muted-foreground">Listings checked at {checkedTime}</p>}
        </div>
        <button
          type="button"
          onClick={refreshProperties}
          disabled={loading}
          aria-busy={loading}
          className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-full border border-border px-4 text-sm font-semibold text-teal-900 transition hover:bg-teal-50 disabled:cursor-wait disabled:opacity-60 sm:self-auto"
        >
          <RefreshCw size={15} aria-hidden="true" className={loading ? 'animate-spin motion-reduce:animate-none' : ''} />
          {loading ? 'Refreshing…' : 'Refresh updates'}
        </button>
      </header>
      {error && <p role="alert" className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {syncError && <p role="alert" className="mb-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Your saved list could not sync to your account: {syncError}</p>}
      {!ready || (loading && !properties.length) ? (
        <p className="text-sm text-muted-foreground">Loading saved properties…</p>
      ) : saved.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((property) => {
            const updatedDate = formatDate(property.updatedAt || property.createdAt)
            return (
              <article key={property.id} className="overflow-hidden rounded-2xl border border-border bg-white">
                <a href={`/properties/${property.id}`} className="block">
                  <img src={property.image} alt={property.title} className="aspect-[4/3] w-full object-cover" />
                  <div className="p-4">
                    <h2 className="font-serif text-xl">{property.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{property.location} · {property.price}</p>
                    {updatedDate && <p className="mt-2 text-xs text-muted-foreground">Listing updated {updatedDate}</p>}
                  </div>
                </a>
                <div className="flex items-center justify-between border-t border-border px-4 py-3">
                  <a href={`/properties/${property.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800">View details <ArrowRight size={13} /></a>
                  <FavoriteButton propertyId={property.id} />
                </div>
              </article>
            )
          })}
        </div>
      ) : savedIds.length ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <Heart size={26} className="mx-auto text-rose-500" />
          <p className="mt-4 font-serif text-2xl">No saved listings are currently available</p>
          <p className="mt-2 text-sm text-muted-foreground">Refresh later or browse current properties.</p>
          <a href="/properties" className="mt-5 inline-flex rounded-full bg-teal-900 px-5 py-2.5 text-sm font-semibold text-white">Browse properties</a>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <Heart size={26} className="mx-auto text-rose-500" />
          <p className="mt-4 font-serif text-2xl">Nothing saved yet</p>
          <p className="mt-2 text-sm text-muted-foreground">Tap the heart on a property to keep it here.</p>
          <a href="/properties" className="mt-5 inline-flex rounded-full bg-teal-900 px-5 py-2.5 text-sm font-semibold text-white">Browse properties</a>
        </div>
      )}
    </main>
  )
}
