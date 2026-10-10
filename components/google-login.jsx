'use client'

import { useEffect, useState } from 'react'
import GoogleSignInButton from './google-sign-in-button'
import { SiteFooter, SiteHeader } from './site-navigation'
import { syncFavorites } from '../hooks/use-favorites'

const authErrors = {
  oauth_state: 'The sign-in request expired or could not be verified. Please try again.',
  oauth_cancelled: 'Google sign-in was cancelled.',
  oauth_not_configured: 'Google sign-in is not configured yet. Please contact the site administrator.',
  oauth_exchange: 'Google could not complete sign-in. Please try again.',
  oauth_profile: 'Google did not return a verified email for this account.',
  admin_not_allowed: 'This Google account is not authorized for the admin workspace.',
  agent_not_allowed: 'This Google account does not have agent approval yet. Request access from the agent portal.',
  agent_application_unavailable: 'Your agent access request could not be saved. Please try again later.',
  account_store_unavailable: 'Your account could not be saved right now. Please try again later.',
}

export default function GoogleLogin() {
  const [account, setAccount] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadAccount = async () => {
    const response = await fetch('/api/auth/session')
    const data = await response.json()
    if (!response.ok || !data.authenticated) {
      setAccount(null)
      return
    }
    setAccount(data.user)
    try {
      await syncFavorites()
    } catch (reason) {
      setError(`Signed in, but saved-property sync failed: ${reason.message}`)
    }
  }

  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    setError(authErrors[query.get('error')] || '')
    loadAccount().catch((reason) => setError(reason.message)).finally(() => setLoading(false))
  }, [])

  const signOut = async () => {
    const response = await fetch('/api/auth/logout', { method: 'POST' })
    if (!response.ok) {
      setError('Could not sign out. Please try again.')
      return
    }
    setAccount(null)
  }

  if (loading) return <><div className="relative h-24 bg-[#edf2ed]"><SiteHeader /></div><main className="mx-auto min-h-[55vh] max-w-lg px-5 py-24 text-center text-sm text-muted-foreground">Checking your account…</main><SiteFooter /></>

  return (
    <>
      <div className="relative h-24 bg-[#edf2ed]"><SiteHeader /></div>
      <main className="mx-auto min-h-[55vh] max-w-lg px-5 py-12 sm:py-16">
        <section className="rounded-3xl border border-border bg-white p-7 shadow-sm sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">HimBhumi account</p>
          <h1 className="mt-3 font-serif text-4xl">{account ? 'Your account' : 'Sign in or create an account'}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {account
              ? `Signed in as ${account.name || account.email} (${account.role}).`
              : 'Browse properties without an account, or use Google to create your HimBhumi account and unlock your inbox and saved-property sync.'}
          </p>
          {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
          {['agent_not_allowed', 'agent_application_unavailable'].includes(new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search).get('error')) && (
            <a href="/agent" className="mt-3 block text-center text-sm font-semibold text-teal-800 underline">Open the agent portal to request access</a>
          )}
          {account
            ? <>
              {account.picture && <img src={account.picture} alt="" className="mt-5 h-14 w-14 rounded-full" />}
              <dl className="mt-5 space-y-2 rounded-xl bg-[#f7f8f5] p-4 text-sm">
                <div className="flex flex-wrap justify-between gap-2"><dt className="text-muted-foreground">Name</dt><dd className="font-medium">{account.name || 'Not provided'}</dd></div>
                <div className="flex flex-wrap justify-between gap-2"><dt className="text-muted-foreground">Email</dt><dd className="break-all font-medium">{account.email}</dd></div>
                <div className="flex flex-wrap justify-between gap-2"><dt className="text-muted-foreground">Account type</dt><dd className="capitalize font-medium">{account.role}</dd></div>
              </dl>
              <a href="/properties" className="mt-5 block w-full rounded-xl bg-teal-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-teal-800">Browse properties</a>
              <a href="/saved" className="mt-3 block w-full rounded-xl border border-teal-900 px-4 py-3 text-center text-sm font-semibold text-teal-900 transition hover:bg-[#edf2ed]">View saved properties</a>
              <a href="/inbox" className="mt-3 block w-full rounded-xl border border-teal-900 px-4 py-3 text-center text-sm font-semibold text-teal-900 transition hover:bg-[#edf2ed]">Open inbox</a>
              <button type="button" onClick={signOut} className="mt-3 w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold text-slate-700">Sign out</button>
            </>
            : <>
              <GoogleSignInButton role="user" label="Create account or sign in with Google" />
              <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">Your verified Google name and email create your account. No separate password is needed.</p>
              <a href="/properties" className="mt-5 block w-full rounded-xl border border-teal-900 px-4 py-3 text-center text-sm font-semibold text-teal-900 transition hover:bg-[#edf2ed]">Continue browsing as a guest</a>
            </>}
          <a href="/" className="mt-6 block text-center text-sm text-muted-foreground hover:text-teal-800">Return home</a>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
