'use client'

import { useEffect, useState } from 'react'
import GoogleSignInButton from './google-sign-in-button'
import { syncFavorites } from '../hooks/use-favorites'

const authErrors = {
  oauth_state: 'The sign-in request expired or could not be verified. Please try again.',
  oauth_cancelled: 'Google sign-in was cancelled.',
  oauth_not_configured: 'Google sign-in is not configured yet. Please contact the site administrator.',
  oauth_exchange: 'Google could not complete sign-in. Please try again.',
  oauth_profile: 'Google did not return a verified email for this account.',
  admin_not_allowed: 'This Google account is not authorized for the admin workspace.',
  agent_not_allowed: 'This Google account is not authorized for the agent workspace.',
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

  if (loading) return <main className="mx-auto max-w-lg px-5 py-24 text-center text-sm text-muted-foreground">Checking your account…</main>

  return (
    <main className="mx-auto max-w-lg px-5 py-24">
      <section className="rounded-3xl border border-border bg-white p-7 shadow-sm sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">HimBhumi account</p>
        <h1 className="mt-3 font-serif text-4xl">{account ? 'You’re signed in' : 'Sign in or create an account'}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {account
            ? `Signed in as ${account.name || account.email} (${account.role}).`
            : 'Use your Google account to save properties and manage your HimBhumi account.'}
        </p>
        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
        {account
          ? <><a href="/inbox" className="mt-6 block w-full rounded-xl border border-teal-900 px-4 py-3 text-center text-sm font-semibold text-teal-900 transition hover:bg-[#edf2ed]">Open inbox</a><button type="button" onClick={signOut} className="mt-3 w-full rounded-xl bg-teal-900 px-4 py-3 text-sm font-semibold text-white">Sign out</button></>
          : <GoogleSignInButton role="user" />}
        <a href="/" className="mt-6 block text-center text-sm text-muted-foreground hover:text-teal-800">Return to website</a>
      </section>
    </main>
  )
}
