'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import useFavorites from '../hooks/use-favorites'

export default function FavoriteButton({ propertyId, className = '' }) {
  const { savedIds, ready, toggle, accountAuthenticated } = useFavorites()
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const saved = savedIds.includes(propertyId)

  const onClick = async (event) => {
    event.preventDefault()
    event.stopPropagation()
    setError('')
    setNotice('')
    try {
      await toggle(propertyId)
      setNotice(saved
        ? 'Removed from your saved properties.'
        : accountAuthenticated
          ? 'Saved to your account.'
          : 'Saved on this device. Sign in to sync across devices.')
    } catch (reason) {
      setError(`Saved on this device, but account sync failed: ${reason.message}`)
    }
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={saved ? 'Remove from saved properties' : 'Save property'}
        aria-pressed={saved}
        disabled={!ready}
        onClick={onClick}
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-sm transition hover:scale-105 hover:text-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 motion-reduce:transition-none ${className}`}
      >
        <Heart
          size={19}
          aria-hidden="true"
          className={`transition-transform duration-200 motion-reduce:transition-none ${saved ? 'scale-110 fill-rose-500 text-rose-500' : ''}`}
        />
      </button>
      {(error || notice) && (
        <span
          role={error ? 'alert' : 'status'}
          className={`absolute right-0 top-11 z-20 w-56 rounded-lg p-2 text-xs shadow-lg ${error ? 'bg-red-800 text-white' : 'bg-slate-900 text-white'}`}
        >
          {error || notice}
        </span>
      )}
    </span>
  )
}
