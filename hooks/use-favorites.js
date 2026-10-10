'use client'

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'himbhumi:saved-properties'
let agentSessionPromise
let favoriteWriteQueue = Promise.resolve()
let favoriteSyncPromise

function readSavedIds() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(stored) ? [...new Set(stored.filter((id) => typeof id === 'string'))] : []
  } catch {
    return []
  }
}

function writeSavedIds(ids) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }))
}

function sameIds(first, second) {
  return first.length === second.length && first.every((id, index) => id === second[index])
}

function queueFavoriteWrite(operation) {
  const result = favoriteWriteQueue.then(operation)
  favoriteWriteQueue = result.catch(() => {})
  return result
}

async function persistLocalFavorites() {
  const favoriteIds = readSavedIds()
  const response = await fetch('/api/user/favorites', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ favoriteIds }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data?.error || 'Could not sync saved properties')
  const validIds = Array.isArray(data.favoriteIds) ? data.favoriteIds : favoriteIds
  const currentIds = readSavedIds()
  if (sameIds(currentIds, favoriteIds)) writeSavedIds(validIds)
  return sameIds(currentIds, favoriteIds) ? validIds : currentIds
}

export function syncFavorites() {
  if (!favoriteSyncPromise) {
    favoriteSyncPromise = queueFavoriteWrite(async () => {
      const response = await fetch('/api/user/favorites')
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Could not load saved properties')

      const merged = [...new Set([...readSavedIds(), ...(Array.isArray(data.favoriteIds) ? data.favoriteIds : [])])]
      writeSavedIds(merged)
      return persistLocalFavorites()
    }).finally(() => {
      favoriteSyncPromise = null
    })
  }
  return favoriteSyncPromise
}

export default function useFavorites() {
  const [savedIds, setSavedIds] = useState([])
  const [ready, setReady] = useState(false)
  const [accountAuthenticated, setAccountAuthenticated] = useState(false)
  const [syncError, setSyncError] = useState('')

  useEffect(() => {
    const saved = readSavedIds()
    setSavedIds(saved)
    setReady(true)

    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) setSavedIds(readSavedIds())
    }
    window.addEventListener('storage', onStorage)

    let active = true
    if (!agentSessionPromise) {
      agentSessionPromise = fetch('/api/auth/session')
        .then(async (response) => {
          const data = await response.json()
          if (!response.ok) throw new Error(data?.error || 'Could not check agent session')
          return data
        })
        .catch((error) => {
          agentSessionPromise = null
          throw error
        })
    }
    agentSessionPromise
      .then((session) => {
        if (!active || !session.authenticated) return null
        setAccountAuthenticated(true)
        setSyncError('')
        return syncFavorites()
      })
      .then((merged) => { if (active && merged) setSavedIds(merged) })
      .catch((error) => {
        if (active) setSyncError(error.message || 'Could not sync saved properties')
        console.error('Saved property sync failed:', error.message)
      })

    return () => {
      active = false
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const toggle = useCallback(async (propertyId) => {
    const currentIds = readSavedIds()
    const next = currentIds.includes(propertyId)
      ? currentIds.filter((id) => id !== propertyId)
      : [...currentIds, propertyId]
    setSavedIds(next)
    writeSavedIds(next)

    if (!accountAuthenticated) return

    try {
      await queueFavoriteWrite(persistLocalFavorites)
      setSyncError('')
    } catch (error) {
      setSyncError(error.message || 'Could not sync saved properties')
      throw error
    }
  }, [accountAuthenticated])

  return { savedIds, ready, toggle, accountAuthenticated, syncError }
}
