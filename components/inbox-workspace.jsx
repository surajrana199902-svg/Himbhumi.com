'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, Inbox, Send } from 'lucide-react'
import GoogleSignInButton from './google-sign-in-button'

async function inboxRequest(path, options) {
  const response = await fetch(path, options)
  const data = await response.json()
  if (!response.ok) {
    const error = new Error(data?.error || 'The inbox request failed.')
    error.status = response.status
    throw error
  }
  return data
}

function formatMessageTime(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString()
}

export default function InboxWorkspace({ compact = false }) {
  const [actor, setActor] = useState(null)
  const [threads, setThreads] = useState([])
  const [activeThreadId, setActiveThreadId] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientRole, setRecipientRole] = useState('agent')
  const [subject, setSubject] = useState('')
  const [draft, setDraft] = useState('')
  const [showCompose, setShowCompose] = useState(false)

  const loadInbox = async (preferredThreadId = '') => {
    setLoading(true)
    setError('')
    try {
      const data = await inboxRequest('/api/inbox')
      setActor(data.actor)
      setThreads(data.threads || [])
      const requestedThread = preferredThreadId || new URLSearchParams(window.location.search).get('thread') || ''
      const nextThreadId = requestedThread && (data.threads || []).some((thread) => thread.id === requestedThread)
        ? requestedThread
        : (data.threads || [])[0]?.id || ''
      setActiveThreadId(nextThreadId)
      if (nextThreadId) setShowCompose(false)
    } catch (reason) {
      setError(reason.message)
      setActor(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadInbox() }, [])

  useEffect(() => {
    if (!activeThreadId) {
      setMessages([])
      return
    }
    let active = true
    inboxRequest(`/api/inbox/${encodeURIComponent(activeThreadId)}`)
      .then((data) => { if (active) setMessages(data.messages || []) })
      .catch((reason) => { if (active) setError(reason.message) })
    return () => { active = false }
  }, [activeThreadId])

  const startConversation = async (event) => {
    event.preventDefault()
    setSending(true)
    setError('')
    try {
      const data = await inboxRequest('/api/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail, recipientRole, subject, message: draft }),
      })
      setThreads((current) => [data.thread, ...current.filter((thread) => thread.id !== data.thread.id)])
      setActiveThreadId(data.thread.id)
      setMessages([data.message])
      setRecipientEmail('')
      setSubject('')
      setDraft('')
      setShowCompose(false)
    } catch (reason) {
      setError(reason.message)
    } finally {
      setSending(false)
    }
  }

  const reply = async (event) => {
    event.preventDefault()
    if (!activeThreadId) return
    setSending(true)
    setError('')
    try {
      const data = await inboxRequest(`/api/inbox/${encodeURIComponent(activeThreadId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: draft }),
      })
      setMessages((current) => [...current, data.message])
      setThreads((current) => current.map((thread) => thread.id === activeThreadId
        ? { ...thread, lastMessageAt: data.message.createdAt, lastMessagePreview: data.message.body, lastMessageSenderId: actor.id }
        : thread))
      setDraft('')
    } catch (reason) {
      setError(reason.message)
    } finally {
      setSending(false)
    }
  }

  const activeThread = threads.find((thread) => thread.id === activeThreadId)
  const recipientRoles = actor?.role === 'admin'
    ? ['user', 'agent']
    : actor?.role === 'user'
      ? ['agent', 'admin']
      : ['admin', 'agent']

  return (
    <section className={`rounded-2xl border border-border bg-white shadow-sm ${compact ? 'p-4 sm:p-5' : 'p-5 sm:p-8'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700"><Inbox size={15} /> HimBhumi inbox</p>
          {!compact && <h1 className="mt-2 font-serif text-3xl">Conversations</h1>}
        </div>
        {actor && <div className="flex items-center gap-3">
          <span className="text-xs capitalize text-muted-foreground">Signed in as {actor.role}</span>
          <button type="button" onClick={() => loadInbox(activeThreadId)} disabled={loading} className="rounded-full border border-border px-3 py-2.5 text-xs font-semibold text-teal-900 disabled:opacity-50">{loading ? 'Refreshing…' : 'Refresh'}</button>
          <button type="button" onClick={() => { setError(''); setShowCompose((visible) => !visible); setActiveThreadId('') }} className="inline-flex items-center gap-2 rounded-full bg-teal-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-teal-800">
            {showCompose ? 'Cancel' : 'New message'} <ArrowUpRight size={14} />
          </button>
        </div>}
      </div>

      {error && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error}
        {error.includes('verified account') && <span className="ml-2 inline-flex gap-3"><a href="/login" className="font-semibold underline">User sign in</a><a href="/agent" className="font-semibold underline">Agent sign in</a></span>}
      </div>}

      {!actor && !loading && error.includes('verified account') && <div className="mt-5 rounded-xl border border-border bg-[#f7f8f5] p-5 sm:p-6">
        <h2 className="font-serif text-2xl">Your messages, all in one place</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Create a HimBhumi account or sign in with Google to contact property advisors and continue conversations. You can browse the property collection without signing in.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:max-w-sm"><GoogleSignInButton role="user" label="Create account or sign in with Google" /></div>
          <a href="/properties" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-teal-900 px-4 py-3 text-sm font-semibold text-teal-900 transition hover:bg-white">Browse properties as a guest</a>
        </div>
      </div>}
      {!actor && !loading && error && !error.includes('verified account') && <div className="mt-5 rounded-xl border border-border bg-[#f7f8f5] p-5">
        <p className="text-sm leading-6 text-muted-foreground">You can continue browsing while the inbox is unavailable.</p>
        <a href="/properties" className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-teal-900 px-4 py-2.5 text-sm font-semibold text-teal-900 transition hover:bg-white">Browse properties</a>
      </div>}

      {actor && showCompose ? (
        <form onSubmit={startConversation} className="mt-5 grid gap-4 rounded-xl bg-[#f7f8f5] p-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-800">Recipient role
            <select value={recipientRole} onChange={(event) => setRecipientRole(event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2.5">
              {recipientRoles.map((role) => <option key={role} value={role}>{role === 'admin' ? 'Administrator' : role === 'agent' ? 'Approved agent' : 'Verified user'}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-800">Recipient email
            <input required type="email" autoComplete="email" maxLength={254} value={recipientEmail} onChange={(event) => setRecipientEmail(event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2.5" />
          </label>
          <label className="text-sm font-medium text-slate-800 sm:col-span-2">Subject
            <input required maxLength={160} value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2.5" />
          </label>
          <label className="text-sm font-medium text-slate-800 sm:col-span-2">Message
            <textarea required maxLength={4000} rows={4} value={draft} onChange={(event) => setDraft(event.target.value)} className="mt-1.5 w-full resize-y rounded-lg border border-border bg-white px-3 py-2.5" />
          </label>
          <button disabled={sending} className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2"><Send size={15} /> {sending ? 'Sending…' : 'Send message'}</button>
        </form>
      ) : actor ? (
        <div className="mt-5 grid min-h-[300px] gap-4 md:grid-cols-[minmax(220px,.75fr)_1.5fr]">
          <nav aria-label="Conversations" className="max-h-[440px] space-y-2 overflow-y-auto">
            {loading && threads.length === 0 ? <p className="p-4 text-sm text-muted-foreground">Loading conversations…</p>
              : threads.length ? threads.map((thread) => {
                const other = thread.participants?.find((participant) => participant.id !== actor.id) || thread.participants?.[0]
                return <button key={thread.id} type="button" onClick={() => setActiveThreadId(thread.id)} aria-current={thread.id === activeThreadId ? 'true' : undefined} className={`w-full rounded-xl border p-3 text-left transition ${thread.id === activeThreadId ? 'border-teal-800 bg-[#edf2ed]' : 'border-border hover:border-teal-700'}`}>
                  <span className="block truncate font-semibold">{thread.subject}</span>
                  <span className="mt-1 block text-xs capitalize text-teal-800">{other?.name || other?.email || 'Conversation'} · {other?.role}</span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">{thread.lastMessagePreview}</span>
                  {thread.propertyTitle && <span className="mt-1 block truncate text-[11px] text-muted-foreground">Property: {thread.propertyTitle}</span>}
                </button>
              }) : <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">No conversations yet. Start a new message or contact an advisor from a property page.</p>}
          </nav>
          <div className="flex min-h-[300px] flex-col rounded-xl border border-border bg-[#fbfcfa]">
            {activeThread ? <>
              <header className="border-b border-border px-4 py-3">
                <h2 className="font-serif text-xl">{activeThread.subject}</h2>
                {activeThread.propertyTitle && <p className="mt-1 text-xs text-muted-foreground">{activeThread.propertyTitle}</p>}
              </header>
              <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
                {messages.map((message) => <article key={message.id} className={`max-w-[90%] rounded-xl px-3 py-2.5 ${message.senderId === actor.id ? 'ml-auto bg-teal-900 text-white' : 'bg-[#edf2ed] text-slate-900'}`}>
                  <p className="text-[11px] font-semibold capitalize opacity-75">{message.senderName} · {message.senderRole}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{message.body}</p>
                  <time className="mt-1 block text-[10px] opacity-65">{formatMessageTime(message.createdAt)}</time>
                </article>)}
                {!messages.length && <p className="text-sm text-muted-foreground">Loading messages…</p>}
              </div>
              <form onSubmit={reply} className="border-t border-border p-3">
                <label className="sr-only" htmlFor="inbox-reply">Reply</label>
                <div className="flex items-end gap-2">
                  <textarea id="inbox-reply" required maxLength={4000} rows={2} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a reply…" className="min-w-0 flex-1 resize-y rounded-lg border border-border bg-white px-3 py-2.5 text-sm" />
                  <button disabled={sending} aria-label="Send reply" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-900 text-white disabled:opacity-60"><Send size={16} /></button>
                </div>
              </form>
            </> : <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">{threads.length ? 'Choose a conversation to read and reply.' : 'Your messages will appear here.'}</div>}
          </div>
        </div>
      ) : loading ? <p role="status" className="mt-5 text-sm text-muted-foreground">Loading inbox…</p> : null}
    </section>
  )
}
