'use client'

import { useEffect, useRef, useState } from 'react'
import { Expand, Minimize, Play, X } from 'lucide-react'

export function isSupportedTourUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && (
      url.hostname === 'my.matterport.com' ||
      url.hostname === 'matterport.com' ||
      url.hostname.endsWith('.matterport.com') ||
      url.hostname === 'kuula.co' ||
      url.hostname.endsWith('.kuula.co') ||
      url.hostname === 'pannellum.org' ||
      url.hostname.endsWith('.pannellum.org')
    )
  } catch {
    return false
  }
}

export default function VirtualTourViewer({ url, onClose }) {
  const [started, setStarted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [fullscreenError, setFullscreenError] = useState('')
  const containerRef = useRef(null)

  useEffect(() => {
    const updateFullscreen = () => setFullscreen(document.fullscreenElement === containerRef.current)
    document.addEventListener('fullscreenchange', updateFullscreen)
    return () => document.removeEventListener('fullscreenchange', updateFullscreen)
  }, [])

  if (!isSupportedTourUrl(url)) {
    return <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">This tour link is invalid or uses an unsupported provider.</p>
  }

  const toggleFullscreen = async () => {
    setFullscreenError('')
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch {
      setFullscreenError('Fullscreen is unavailable in this browser or context.')
    }
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden rounded-2xl bg-slate-950 ${fullscreen ? 'h-screen w-screen rounded-none' : 'aspect-video'}`}>
      {!started ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-900 to-teal-950 p-6 text-center text-white">
          <p className="font-serif text-3xl">Explore every angle</p>
          <button type="button" onClick={() => setStarted(true)} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950"><Play size={16} fill="currentColor" /> Start 360° tour</button>
        </div>
      ) : (
        <iframe title="360-degree property virtual tour" src={url} loading="lazy" allow="fullscreen; gyroscope; accelerometer; xr-spatial-tracking" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-forms allow-presentation" className="absolute inset-0 h-full w-full border-0" />
      )}
      {fullscreenError && <p role="status" className="absolute bottom-3 left-3 rounded-lg bg-black/75 px-3 py-2 text-xs text-white">{fullscreenError}</p>}
      <div className="absolute right-3 top-3 flex gap-2">
        {started && <button type="button" aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} onClick={toggleFullscreen} className="rounded-full bg-black/60 p-2 text-white">{fullscreen ? <Minimize size={17} /> : <Expand size={17} />}</button>}
        {onClose && <button type="button" aria-label="Close virtual tour" onClick={onClose} className="rounded-full bg-black/60 p-2 text-white"><X size={17} /></button>}
      </div>
    </div>
  )
}
