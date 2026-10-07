export function locationPath(location, locations) {
  const byId = new Map(locations.map((item) => [item.id, item]))
  const segments = []
  let current = location
  while (current) {
    segments.unshift(current.slug)
    current = current.parentLocationId ? byId.get(current.parentLocationId) : null
  }
  return segments.join('/')
}

export function locationLabel(location) {
  if (location.type === 'state') return location.name
  const parts = [
    location.name,
    location.tehsil && location.tehsil !== location.name ? location.tehsil : '',
    location.district && location.district !== location.name ? location.district : '',
    location.state && location.state !== location.name ? location.state : '',
  ].filter(Boolean)
  const context = [...new Set(parts.slice(1))]
  return `${location.name} · ${context.length ? context.join(', ') : location.type}`
}
