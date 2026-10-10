'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Menu, X } from 'lucide-react'

const BRAND = 'HimBhumi'
const LOGO = 'https://customer-assets-m6fa6gv7.emergentagent.net/job_himalayan-estates-1/artifacts/eidamywr_HImmm.jpeg'

export function Brand({ dark = false }) {
  return <a href="/" aria-label={`${BRAND} home`} className="group flex items-center gap-3.5">
    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f6efe1] shadow-[0_10px_30px_-10px_rgba(10,74,32,.55)] ring-1 ring-[#c9a86a]/80 transition group-hover:ring-[#c9a86a]">
      <img src={LOGO} alt={`${BRAND} Real Estates emblem`} className="h-full w-full object-cover" style={{ transform: 'scale(2.1)', objectPosition: '50% 30%' }} />
      <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/50" />
    </span>
    <span className="flex flex-col leading-none">
      <span className={`font-serif text-[1.55rem] tracking-tight ${dark ? 'text-white' : 'text-foreground'}`}>Him<span className="italic text-[#c9a86a]">Bhumi</span></span>
      <span className="mt-1.5 flex items-center gap-2">
        <span className="h-px w-4 bg-[#c9a86a]/70" />
        <span className={`text-[9.5px] font-semibold uppercase tracking-[0.34em] ${dark ? 'text-white/60' : 'text-muted-foreground'}`}>Real Estates</span>
      </span>
    </span>
  </a>
}

export function SiteHeader({ dark = false }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [account, setAccount] = useState(null)

  useEffect(() => {
    let active = true
    fetch('/api/auth/session')
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data?.error || 'Could not check account status.')
        if (active) setAccount(data.authenticated ? data.user : null)
      })
      .catch(() => {
        if (active) setAccount(null)
      })
    return () => { active = false }
  }, [])

  const accountHref = account?.role === 'admin' ? '/admin' : account?.role === 'agent' ? '/agent' : '/login'
  const accountLabel = account ? (account.name || 'My account') : 'Sign in'
  const linkClass = 'opacity-80 transition hover:opacity-100'

  return <header className={`absolute inset-x-0 top-0 z-30 ${dark ? 'text-white' : 'text-foreground'}`}>
    <div className="container mx-auto flex h-24 items-center justify-between px-5 lg:px-10">
      <Brand dark={dark} />
      <nav aria-label="Main navigation" className="hidden items-center gap-5 text-sm font-medium xl:flex">
        <a href="/properties" className={linkClass}>Properties</a>
        <a href="/rentals" className={linkClass}>Rentals</a>
        <a href="/saved" className={linkClass}>Saved</a>
        <a href="/inbox" className={linkClass}>Inbox</a>
        <a href="/agent" className={linkClass}>Agent portal</a>
        <a href="/#story" className={linkClass}>Our story</a>
        <a href={accountHref} className={linkClass}>{accountLabel}</a>
        <a href="/admin" className={linkClass}>Admin</a>
      </nav>
      <a href="/list-your-property" className="hidden items-center gap-2 rounded-full bg-[#c9a86a] px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-black/15 transition hover:-translate-y-0.5 hover:bg-[#d9bc82] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e6c887] xl:flex">List your property <ArrowRight size={15} /></a>
      <button onClick={() => setMenuOpen((open) => !open)} className="rounded-full border border-current/25 p-2 xl:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
        {menuOpen ? <X size={19} /> : <Menu size={19} />}
      </button>
    </div>
    {menuOpen && <nav aria-label="Mobile navigation" className={`mx-5 rounded-2xl border border-current/20 p-3 shadow-xl backdrop-blur-xl xl:hidden ${dark ? 'bg-slate-950/90 text-white' : 'bg-white/95 text-foreground'}`}>
      <a onClick={() => setMenuOpen(false)} href="/properties" className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-teal-50">Properties</a>
      <a onClick={() => setMenuOpen(false)} href="/rentals" className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-teal-50">Rental properties</a>
      <a onClick={() => setMenuOpen(false)} href="/saved" className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-teal-50">Saved properties</a>
      <a onClick={() => setMenuOpen(false)} href="/inbox" className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-teal-50">Inbox</a>
      <a onClick={() => setMenuOpen(false)} href={accountHref} className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-teal-50">{account ? 'My account' : 'Sign in or create account'}</a>
      <a onClick={() => setMenuOpen(false)} href="/agent" className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-teal-50">Agent portal</a>
      <a onClick={() => setMenuOpen(false)} href="/#story" className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-teal-50">Our story</a>
      <a onClick={() => setMenuOpen(false)} href="/admin" className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-teal-50">Admin</a>
      <a onClick={() => setMenuOpen(false)} href="/list-your-property" className="mt-1 flex items-center justify-between rounded-xl bg-[#c9a86a] px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-[#d9bc82] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800">List your property <ArrowRight size={15} /></a>
    </nav>}
  </header>
}

export function SiteFooter() {
  return <footer className="bg-slate-950 px-5 py-12 text-white lg:px-10">
    <div className="container mx-auto flex flex-col justify-between gap-8 md:flex-row md:items-end">
      <div><Brand dark /><p className="mt-4 max-w-xs text-sm leading-6 text-white/50">Premium property, thoughtfully found across India.</p></div>
      <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-5 text-xs text-white/60">
        <a href="/properties" className="transition hover:text-white">Properties</a>
        <a href="/rentals" className="transition hover:text-white">Rentals</a>
        <a href="/inbox" className="transition hover:text-white">Inbox</a>
        <a href="/login" className="transition hover:text-white">Account</a>
        <a href="/list-your-property" className="transition hover:text-white">List property</a>
        <a href="/track" className="transition hover:text-white">Track listing</a>
        <span>© 2026 {BRAND}</span>
      </nav>
    </div>
  </footer>
}
