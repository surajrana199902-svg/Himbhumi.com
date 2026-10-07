'use client'

import { useEffect, useState } from 'react'

export default function useLocationCatalog() {
  const [locations, setLocations] = useState([])
  const [locationsError, setLocationsError] = useState('')

  useEffect(() => {
    let active = true

    fetch('/api/locations')
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data?.error || 'Could not load locations')
        return data.locations || []
      })
      .then((data) => {
        if (active) {
          setLocations(data)
          setLocationsError('')
        }
      })
      .catch((error) => {
        if (active) setLocationsError(error.message)
      })

    return () => { active = false }
  }, [])

  return { locations, locationsError }
}
