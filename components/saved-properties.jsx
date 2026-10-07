'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Heart } from 'lucide-react'
import FavoriteButton from './favorite-button'
import useFavorites from '../hooks/use-favorites'

export default function SavedProperties() {
  const { savedIds, ready } = useFavorites()
  const [properties, setProperties] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/properties')
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data?.error || 'Could not load properties')
        return data.properties || []
      })
      .then(setProperties)
      .catch((reason) => setError(reason.message))
  }, [])

  const saved = properties.filter((property) => savedIds.includes(property.id))

  return (
    <main className="mx-auto max-w-6xl px-5 py-14">
      <header className="mb-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Your shortlist</p><h1 className="mt-2 font-serif text-4xl">Saved properties</h1><p className="mt-2 text-sm text-muted-foreground">Saved on this device. Sign in with a verified account to sync your shortlist across devices.</p></header>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {!ready ? <p className="text-sm text-muted-foreground">Loading saved properties…</p> : saved.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((property) => (
            <article key={property.id} className="overflow-hidden rounded-2xl border border-border bg-white">
              <a href={`/properties/${property.id}`} className="block"><img src={property.image} alt={property.title} className="aspect-[4/3] w-full object-cover" /><div className="p-4"><h2 className="font-serif text-xl">{property.title}</h2><p className="mt-1 text-sm text-muted-foreground">{property.location} · {property.price}</p></div></a>
              <div className="flex items-center justify-between border-t border-border px-4 py-3"><a href={`/properties/${property.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800">View details <ArrowRight size={13} /></a><FavoriteButton propertyId={property.id} /></div>
            </article>
          ))}
        </div>
      ) : <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center"><Heart size={26} className="mx-auto text-rose-500" /><p className="mt-4 font-serif text-2xl">Nothing saved yet</p><p className="mt-2 text-sm text-muted-foreground">Tap the heart on a property to keep it here.</p><a href="/properties" className="mt-5 inline-flex rounded-full bg-teal-900 px-5 py-2.5 text-sm font-semibold text-white">Browse properties</a></div>}
    </main>
  )
}
