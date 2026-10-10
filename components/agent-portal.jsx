'use client'

import { useEffect, useState } from 'react'
import { Eye, Loader2, Save, ShieldCheck } from 'lucide-react'
import { syncFavorites } from '../hooks/use-favorites'
import AuthPageShell from './auth-page-shell'
import GoogleSignInButton from './google-sign-in-button'
import InboxWorkspace from './inbox-workspace'

const agentAuthErrors = {
  agent_identity_mismatch: 'This application is linked to a different Google account. Please contact an administrator.',
  agent_application_unavailable: 'Your agent request could not be saved. Please try again later.',
}

async function request(path, options) {
  const response = await fetch(path, options)
  const data = await response.json()
  if (!response.ok) throw new Error(data?.error || 'The request failed')
  return data
}

export default function AgentPortal() {
  const [authenticated, setAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [login, setLogin] = useState({ username: '', password: '' })
  const [mode, setMode] = useState('signin')
  const [signup, setSignup] = useState({ name: '', email: '', phone: '', password: '' })
  const [signupSubmitted, setSignupSubmitted] = useState(false)
  const [application, setApplication] = useState(null)
  const [listings, setListings] = useState([])
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState({})
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [checkingApproval, setCheckingApproval] = useState(false)

  const register = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      await request('/api/agent/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signup),
      })
      setSignupSubmitted(true)
      setMode('signin')
      setNotice('Your application has been submitted. You can sign in after an administrator approves it.')
    } catch (reason) {
      setError(reason.message)
    } finally {
      setSaving(false)
    }
  }

  const loadListings = async () => {
    const data = await request('/api/agent/listings')
    setListings(data.listings || [])
  }

  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    setError(agentAuthErrors[query.get('error')] || '')
    request('/api/agent/session')
      .then(async (data) => {
        setAuthenticated(data.authenticated)
        setUsername(data.username || '')
        setApplication(data.application || null)
        if (data.authenticated) {
          try { await syncFavorites() } catch (reason) { setNotice(`Signed in, but saved-property sync failed: ${reason.message}`) }
          await loadListings()
        }
      })
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false))
  }, [])

  const checkApproval = async () => {
    setCheckingApproval(true)
    setError('')
    try {
      const data = await request('/api/agent/session')
      setAuthenticated(data.authenticated)
      setUsername(data.username || '')
      setApplication(data.application || null)
      if (data.authenticated) {
        try {
          await syncFavorites()
        } catch (reason) {
          setNotice(`Approved and signed in, but saved-property sync failed: ${reason.message}`)
        }
        await loadListings()
      } else if (data.application?.status === 'pending') {
        setNotice('Your request is still waiting for administrator approval.')
      }
    } catch (reason) {
      setError(reason.message)
    } finally {
      setCheckingApproval(false)
    }
  }

  const signIn = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const data = await request('/api/agent/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(login),
      })
      setAuthenticated(true)
      setUsername(data.username)
      try {
        await syncFavorites()
      } catch (syncError) {
        setNotice(`Signed in, but saved-property sync failed: ${syncError.message}`)
      }
      await loadListings()
    } catch (reason) {
      setError(reason.message)
    } finally {
      setSaving(false)
    }
  }

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await request(`/api/agent/listings/${encodeURIComponent(editing.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      setEditing(null)
      setNotice('Your listing changes were saved.')
      await loadListings()
    } catch (reason) {
      setError(reason.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="mx-auto max-w-3xl px-5 py-20 text-center text-sm text-muted-foreground">Loading agent portal…</p>

  if (!authenticated) return (
    <AuthPageShell
      eyebrow="Agent portal"
      title="Agent sign in"
      description="Apply for an agent account or sign in after your application has been approved."
      Icon={ShieldCheck}
    >
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
      {application ? (
        <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5" aria-live="polite">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-800">Agent application</p>
          <h2 className="mt-2 font-serif text-2xl text-slate-900">
            {application.status === 'pending' ? 'Your request is with the admin' : 'Your request was not approved'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {application.status === 'pending'
              ? `You requested agent access with ${application.email}. An administrator must approve the request before you can use the agent workspace.`
              : application.status === 'rejected'
                ? `The application for ${application.email} was not approved. You can submit a new request by signing in with Google again.`
                : `The approved application for ${application.email} is linked to a different Google account. Contact an administrator for help.`}
          </p>
          {notice && <p role="status" className="mt-3 text-sm text-teal-900">{notice}</p>}
          <div className="mt-4 flex flex-wrap gap-3">
            {application.status === 'pending'
              ? <button type="button" onClick={checkApproval} disabled={checkingApproval} className="inline-flex items-center gap-2 rounded-full bg-teal-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                {checkingApproval && <Loader2 size={15} className="animate-spin" />} Check approval
              </button>
              : application.status === 'rejected'
                ? <GoogleSignInButton role="agent" label="Request agent access again with Google" />
                : null}
            <a href="/login" className="rounded-full border border-border bg-white px-4 py-2.5 text-sm font-semibold text-teal-900">Continue as a regular user</a>
          </div>
        </section>
      ) : (
        <>
      <div className="mt-5 grid grid-cols-2 rounded-xl bg-[#f2f4f1] p-1" aria-label="Agent account options">
        <button type="button" aria-pressed={mode === 'signin'} onClick={() => { setMode('signin'); setError('') }} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${mode === 'signin' ? 'bg-white text-teal-900 shadow-sm' : 'text-muted-foreground'}`}>Sign in</button>
        <button type="button" aria-pressed={mode === 'signup'} onClick={() => { setMode('signup'); setError('') }} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${mode === 'signup' ? 'bg-white text-teal-900 shadow-sm' : 'text-muted-foreground'}`}>Apply as an agent</button>
      </div>
      {notice && <p role="status" className="mt-4 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-900">{notice}</p>}
      {mode === 'signup' ? (
        <form onSubmit={register} className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-slate-800">Full name
            <input required maxLength={120} autoComplete="name" value={signup.name} onChange={(event) => setSignup({ ...signup, name: event.target.value })} className="mt-2 w-full rounded-xl border border-border bg-[#f7f8f5] px-4 py-3 outline-none transition focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-800/10" />
          </label>
          <label className="block text-sm font-medium text-slate-800">Email address
            <input required type="email" maxLength={254} autoComplete="email" value={signup.email} onChange={(event) => setSignup({ ...signup, email: event.target.value })} className="mt-2 w-full rounded-xl border border-border bg-[#f7f8f5] px-4 py-3 outline-none transition focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-800/10" />
          </label>
          <label className="block text-sm font-medium text-slate-800">Phone number <span className="font-normal text-muted-foreground">(optional)</span>
            <input type="tel" autoComplete="tel" value={signup.phone} onChange={(event) => setSignup({ ...signup, phone: event.target.value })} className="mt-2 w-full rounded-xl border border-border bg-[#f7f8f5] px-4 py-3 outline-none transition focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-800/10" />
          </label>
          <label className="block text-sm font-medium text-slate-800">Password
            <input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={signup.password} onChange={(event) => setSignup({ ...signup, password: event.target.value })} className="mt-2 w-full rounded-xl border border-border bg-[#f7f8f5] px-4 py-3 outline-none transition focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-800/10" />
            <span className="mt-1 block text-xs font-normal text-muted-foreground">Use at least 12 characters. You can sign in after admin approval.</span>
          </label>
          <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-60">
            {saving && <Loader2 size={16} className="animate-spin" />} Submit application
          </button>
        </form>
      ) : (
        <>
          <GoogleSignInButton role="agent" label="Sign in as an agent with Google" />
          <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">Google agent access is limited to accounts already approved by the site administrator.</p>
          <form onSubmit={signIn}>
            <details className="mt-6 border-t border-border pt-4">
              <summary className="cursor-pointer text-sm font-medium text-slate-700 transition hover:text-teal-900">Sign in with email and password</summary>
              <label className="mt-5 block text-sm font-medium text-slate-800">Agent email or username
                <input required autoComplete="username" value={login.username} onChange={(event) => setLogin({ ...login, username: event.target.value })} className="mt-2 w-full rounded-xl border border-border bg-[#f7f8f5] px-4 py-3 outline-none transition focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-800/10" />
              </label>
              <label className="mt-4 block text-sm font-medium text-slate-800">Password
                <input required type="password" autoComplete="current-password" value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} className="mt-2 w-full rounded-xl border border-border bg-[#f7f8f5] px-4 py-3 outline-none transition focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-800/10" />
              </label>
              <button disabled={saving} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-60">
                {saving && <Loader2 size={16} className="animate-spin" />} Sign in
              </button>
            </details>
          </form>
          {signupSubmitted && <p className="mt-4 text-center text-xs text-muted-foreground">Application received. Your agent account will be enabled after review.</p>}
        </>
      )}
        </>
      )}
      <a href="/login" className="mt-6 block text-center text-sm font-medium text-teal-800 transition hover:text-teal-950 hover:underline">Not an agent? Sign in as a user</a>
    </AuthPageShell>
  )

  return (
    <main className="min-h-screen bg-[#f5f7f4] text-foreground">
      <div className="border-b border-border bg-white">
        <div className="container mx-auto flex items-center justify-between px-5 py-5 lg:px-10">
          <a href="/" aria-label="HimBhumi home" className="group flex items-center gap-3">
            <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#f6efe1] shadow-sm ring-1 ring-[#c9a86a]/70">
              <img src="https://customer-assets-m6fa6gv7.emergentagent.net/job_himalayan-estates-1/artifacts/eidamywr_HImmm.jpeg" alt="" className="h-full w-full object-cover" style={{ transform: 'scale(2.1)', objectPosition: '50% 30%' }} />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-serif text-2xl tracking-tight">Him<span className="italic text-[#c9a86a]">Bhumi</span></span>
              <span className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Real Estates</span>
            </span>
          </a>
          <div className="flex items-center gap-4"><a href="/inbox" className="text-sm font-semibold text-teal-800 transition hover:text-teal-950">Inbox</a><a href="/" className="text-sm font-medium text-muted-foreground transition hover:text-teal-900">View website <span aria-hidden="true">→</span></a></div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl space-y-6 px-5 py-10 sm:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Agent workspace</p><h1 className="mt-2 font-serif text-4xl">Your listings</h1><p className="mt-2 text-sm text-muted-foreground">Signed in as {username}. Listing views are counted on public property detail pages.</p></div>
        <button type="button" onClick={async () => { await request('/api/agent/logout', { method: 'POST' }); window.location.reload() }} className="rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold transition hover:border-teal-800 hover:text-teal-900">Sign out</button>
      </header>
      <InboxWorkspace compact />
      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-900">{notice}</p>}
      {editing && (
        <form onSubmit={save} className="space-y-4 rounded-2xl border border-border bg-white p-5">
          <h2 className="font-serif text-2xl">Edit {editing.title}</h2>
          {[
            ['title', 'Title'], ['price', 'Price'], ['description', 'Description'],
            ['virtualTourUrl', 'Virtual tour URL'], ['video', 'Video URL'],
          ].map(([key, label]) => (
            <label key={key} className="block text-sm font-medium">{label}
              {key === 'description'
                ? <textarea rows={4} value={draft[key] || ''} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2" />
                : <input value={draft[key] || ''} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2" />}
            </label>
          ))}
          <div className="flex gap-3"><button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-teal-900 px-4 py-2.5 text-sm font-semibold text-white"><Save size={15} /> Save changes</button><button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-border px-4 py-2.5 text-sm">Cancel</button></div>
        </form>
      )}
      <section className="grid gap-4 sm:grid-cols-2">
        {listings.map((listing) => (
          <article key={listing.id} className="overflow-hidden rounded-2xl border border-border bg-white">
            {listing.image && <img src={listing.image} alt="" className="aspect-[16/9] w-full object-cover" />}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3"><div><h2 className="font-serif text-xl">{listing.title}</h2><p className="mt-1 text-xs capitalize text-muted-foreground">{(listing.status || 'pending_review').replaceAll('_', ' ')} · {listing.city}, {listing.state}</p></div><span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-900"><Eye size={13} /> {listing.views || 0}</span></div>
              <p className="mt-2 text-sm font-semibold text-teal-800">{listing.price}</p>
              <button type="button" onClick={() => { setEditing(listing); setDraft({ title: listing.title || '', price: listing.price || '', description: listing.description || '', virtualTourUrl: listing.virtualTourUrl || '', video: listing.video || '' }) }} className="mt-4 rounded-lg border border-border px-3 py-2 text-xs font-semibold">Edit your listing</button>
            </div>
          </article>
        ))}
      </section>
      {!listings.length && <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No agent-owned listings yet. Submit new listings while signed in to associate them with your account.</p>}
      </div>
    </main>
  )
}
