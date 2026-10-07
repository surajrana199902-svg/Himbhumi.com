'use client'

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'himbhumi:saved-properties'
let agentSessionPromise

function readSavedIds() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(stored) ? [...new Set(stored.filter((id) => typeof id === 'string'))] : []
  } catch {
    return []
  }
}

export async function syncFavorites() {
  const saved = readSavedIds()
  const response = await fetch('/api/user/favorites')
  const data = await response.json()
  if (!response.ok) throw new Error(data?.error || 'Could not load saved properties')
  const merged = [...new Set([...saved, ...(Array.isArray(data.favoriteIds) ? data.favoriteIds : [])])]
  const syncResponse = await fetch('/api/user/favorites', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ favoriteIds: merged }),
  })
  const syncData = await syncResponse.json()
  if (!syncResponse.ok) throw new Error(syncData?.error || 'Could not sync saved properties')
  const validIds = Array.isArray(syncData.favoriteIds) ? syncData.favoriteIds : merged
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(validIds))
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }))
  return validIds
}

export default function useFavorites() {
  const [savedIds, setSavedIds] = useState([])
  const [ready, setReady] = useState(false)
  const [accountAuthenticated, setAccountAuthenticated] = useState(false)

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
        return syncFavorites()
      })
      .then((merged) => { if (active && merged) setSavedIds(merged) })
      .catch((error) => console.error('Saved property sync failed:', error.message))

    return () => {
      active = false
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const toggle = useCallback(async (propertyId) => {
    const next = savedIds.includes(propertyId)
      ? savedIds.filter((id) => id !== propertyId)
      : [...savedIds, propertyId]
    setSavedIds(next)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }))

    if (!accountAuthenticated) return

    try {
      const response = await fetch('/api/user/favorites', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favoriteIds: next }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Could not sync saved properties')
    } catch (error) {
      setSavedIds(savedIds)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds))
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }))
      throw error
    }
  }, [accountAuthenticated, savedIds])

  return { savedIds, ready, toggle }
}
