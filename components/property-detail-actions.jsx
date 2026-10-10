'use client'

import { useEffect, useRef, useState } from 'react'
import { Compass, Eye, MessageCircle, Send, X } from 'lucide-react'
import FavoriteButton from './favorite-button'
import VirtualTourViewer from './virtual-tour-viewer'

export default function PropertyDetailActions({ propertyId }) {
  const [tourUrl, setTourUrl] = useState('')
  const [propertyTitle, setPropertyTitle] = useState('')
  const [views, setViews] = useState(0)
  const [tourOpen, setTourOpen] = useState(false)
  const [messageOpen, setMessageOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messageError, setMessageError] = useState('')
  const [inquiryThreadId, setInquiryThreadId] = useState('')
  const [inquiryInboxError, setInquiryInboxError] = useState('')
  const [sending, setSending] = useState(false)
  const tourTriggerRef = useRef(null)
  const tourDialogRef = useRef(null)
  const messageTriggerRef = useRef(null)
  const messageDialogRef = useRef(null)

  useEffect(() => {
    if (!tourOpen) return
    const previousOverflow = document.body.style.overflow
    const focusableSelector = 'button:not([disabled]), iframe, [href], [tabindex]:not([tabindex="-1"])'
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setTourOpen(false)
        return
      }
      if (event.key !== 'Tab') return
      const focusable = [...(tourDialogRef.current?.querySelectorAll(focusableSelector) || [])]
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
    tourDialogRef.current?.querySelector(focusableSelector)?.focus()
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      tourTriggerRef.current?.focus()
    }
  }, [tourOpen])

  useEffect(() => {
    if (!messageOpen) return
    const previousOverflow = document.body.style.overflow
    const focusableSelector = 'button:not([disabled]), textarea, [href], [tabindex]:not([tabindex="-1"])'
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMessageOpen(false)
        return
      }
      if (event.key !== 'Tab') return
      const focusable = [...(messageDialogRef.current?.querySelectorAll(focusableSelector) || [])]
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
    messageDialogRef.current?.querySelector(focusableSelector)?.focus()
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      messageTriggerRef.current?.focus()
    }
  }, [messageOpen])

  useEffect(() => {
    let active = true
    fetch(`/api/properties/${encodeURIComponent(propertyId)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load property details')
        return response.json()
      })
      .then((property) => {
        if (!active) return
        setTourUrl(property.virtualTourUrl || '')
        setPropertyTitle(property.title || 'this property')
        setViews(Number(property.views) || 0)
      })
      .catch((error) => console.error('Property tour link unavailable:', error.message))

    try {
      const key = `himbhumi:viewed:${propertyId}`
      if (!window.sessionStorage.getItem(key)) {
        window.sessionStorage.setItem(key, '1')
        fetch(`/api/properties/${encodeURIComponent(propertyId)}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
          .then(async (response) => {
            const data = await response.json()
            if (!response.ok) throw new Error(data?.error || 'Could not record property view')
            if (active) setViews(Number(data.views) || 0)
          })
          .catch((error) => {
            console.error('Property view tracking failed:', error.message)
            try { window.sessionStorage.removeItem(key) } catch (storageError) {
              console.error('Property view retry marker could not be cleared:', storageError.message)
            }
          })
      }
    } catch (error) {
      console.error('Property view tracking unavailable:', error.message)
    }

    return () => { active = false }
  }, [propertyId])

  useEffect(() => {
    const onInquiryThread = (event) => {
      if (event.detail?.propertyId !== propertyId) return
      setInquiryThreadId(event.detail.threadId || '')
      setInquiryInboxError(event.detail.error || '')
    }
    window.addEventListener('himbhumi:inbox-thread', onInquiryThread)
    return () => window.removeEventListener('himbhumi:inbox-thread', onInquiryThread)
  }, [propertyId])

  const sendPropertyMessage = async (event) => {
    event.preventDefault()
    setSending(true)
    setMessageError('')
    try {
      const response = await fetch('/api/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          subject: `Question about ${propertyTitle}`,
          message: message.trim(),
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Could not send your message')
      window.location.href = `/inbox?thread=${encodeURIComponent(data.thread.id)}`
    } catch (error) {
      setMessageError(error.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-border bg-white/95 p-2 shadow-xl backdrop-blur sm:inset-x-auto sm:bottom-5 sm:right-5 sm:flex-nowrap sm:gap-2 sm:rounded-full sm:p-1.5">
        {inquiryThreadId && <a href={`/inbox?thread=${encodeURIComponent(inquiryThreadId)}`} className="rounded-full bg-[#edf2ed] px-3 py-2 text-xs font-semibold text-teal-900">Continue enquiry</a>}
        <span className="inline-flex items-center gap-1 px-2 text-xs font-medium text-slate-700" aria-label={`${views} property views`}><Eye size={14} /> {views}</span>
        <button ref={messageTriggerRef} type="button" onClick={() => setMessageOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2.5 text-xs font-semibold text-teal-900 transition hover:border-teal-800"><MessageCircle size={15} /> Message</button>
        {tourUrl && <button ref={tourTriggerRef} type="button" onClick={() => setTourOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-teal-900 px-4 py-2.5 text-xs font-semibold text-white"><Compass size={15} /> 360° Tour</button>}
        <FavoriteButton propertyId={propertyId} />
      </div>
      {inquiryInboxError && <p role="status" className="fixed bottom-20 right-5 z-40 max-w-sm rounded-xl border border-amber-200 bg-white px-4 py-3 text-xs text-amber-900 shadow-lg">{inquiryInboxError}</p>}
      {messageOpen && (
        <div className="fixed inset-0 z-[59] flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setMessageOpen(false) }}>
          <section ref={messageDialogRef} role="dialog" aria-modal="true" aria-labelledby="property-message-title" className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Private conversation</p><h2 id="property-message-title" className="mt-2 font-serif text-3xl">Ask about this property</h2><p className="mt-2 text-sm text-muted-foreground">{propertyTitle}</p></div>
              <button type="button" onClick={() => setMessageOpen(false)} aria-label="Close message form" className="rounded-full p-2 text-muted-foreground hover:bg-[#edf2ed]"><X size={18} /></button>
            </div>
            <form onSubmit={sendPropertyMessage} className="mt-6 space-y-4">
              <label htmlFor="property-inbox-message" className="block text-sm font-medium text-slate-800">Your question
                <textarea id="property-inbox-message" required minLength={1} maxLength={4000} rows={5} value={message} onChange={(event) => setMessage(event.target.value)} className="mt-2 w-full resize-y rounded-xl border border-border bg-[#f7f8f5] px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-800/10" placeholder="Ask about availability, pricing, or a viewing…" />
              </label>
              {messageError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{messageError}{messageError.includes('verified account') && <> <a href="/login" className="font-semibold underline">Sign in</a></>}</p>}
              <p className="text-xs leading-5 text-muted-foreground">Your message will go to the listing agent or HimBhumi administrator and continue in your inbox. Sign in with a verified account to send.</p>
              <button disabled={sending} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60"><Send size={15} /> {sending ? 'Sending…' : 'Send private message'}</button>
            </form>
          </section>
        </div>
      )}
      {tourOpen && (
        <div ref={tourDialogRef} className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 p-3 sm:p-8" role="dialog" aria-modal="true" aria-label="Property virtual tour">
          <div className="w-full max-w-6xl">
            <div className="mb-3 flex justify-end"><button type="button" onClick={() => setTourOpen(false)} aria-label="Close virtual tour" className="rounded-full bg-white/10 p-2 text-white"><X size={20} /></button></div>
            <VirtualTourViewer url={tourUrl} onClose={() => setTourOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
