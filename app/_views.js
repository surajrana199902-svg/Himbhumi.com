'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Building2, Check, ChevronDown, ChevronLeft, ChevronRight, Compass, Eye, EyeOff, Instagram, Mail, MapPin, Menu, MessageCircle, Phone, Play, Share2, Sparkles, Trees, X, Upload, Trash2, ShieldCheck, Star, Loader2, FileText, Video, Camera, BadgeCheck, Home as HomeIcon, Copy } from 'lucide-react'

const CATEGORIES = ['Residential plot', 'Commercial plot', 'House', 'Apartment / Flat', 'Villa', 'Commercial property', 'Shop', 'Office', 'Warehouse', 'Agricultural land', 'Other']
const LISTING_TYPES = ['For sale', 'For rent', 'For lease']
const AREA_UNITS = ['sq. ft.', 'sq. yards', 'marla', 'kanal', 'bigha', 'acre']
const HP_DISTRICTS = ['Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur', 'Kullu', 'Lahaul & Spiti', 'Mandi', 'Shimla', 'Sirmaur', 'Solan', 'Una']

const BRAND = 'HimBhumi'
const LOGO = 'https://customer-assets-m6fa6gv7.emergentagent.net/job_himalayan-estates-1/artifacts/eidamywr_HImmm.jpeg'
const HERO_IMAGE = 'https://images.unsplash.com/photo-1531932594968-e5e5e9dee95a?auto=format&fit=crop&w=2200&q=90'
const locations = ['Nalagarh', 'Baddi', 'Solan', 'Shimla', 'Kasauli', 'Parwanoo', 'Dharamshala', 'Kangra', 'Palampur', 'Manali', 'Kullu', 'Mandi', 'Hamirpur', 'Bilaspur', 'Una', 'Chamba', 'Nahan', 'Narkanda']

const api = async (path, options) => {
  const response = await fetch(`/api/${path}`, options)
  const data = await response.json()
  if (!response.ok) throw new Error(data?.error || 'Something went wrong')
  return data
}

function Brand({ dark = false }) {
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

function Header({ dark = false }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return <header className={`absolute inset-x-0 top-0 z-30 ${dark ? 'text-white' : 'text-foreground'}`}>
    <div className="container mx-auto flex h-24 items-center justify-between px-5 lg:px-10">
      <Brand dark={dark} />
      <nav className="hidden items-center gap-8 text-sm font-medium md:flex"><a href="/properties" className="opacity-80 transition hover:opacity-100">Properties</a><a href="/list-your-property" className="opacity-80 transition hover:opacity-100">List property</a><a href="/#story" className="opacity-80 transition hover:opacity-100">Our story</a><a href="/admin" className="opacity-80 transition hover:opacity-100">Admin</a></nav>
      <a href="/list-your-property" className="hidden items-center gap-2 rounded-full border border-current/25 px-5 py-2.5 text-sm transition hover:bg-white/10 md:flex">List your property <ArrowRight size={15} /></a>
      <button onClick={() => setMenuOpen((open) => !open)} className="rounded-full border border-current/25 p-2 md:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}><Menu size={19} /></button>
    </div>
    {menuOpen && <nav className={`mx-5 rounded-2xl border border-current/20 p-3 shadow-xl backdrop-blur-xl md:hidden ${dark ? 'bg-slate-950/90 text-white' : 'bg-white/95 text-foreground'}`}>
      <a onClick={() => setMenuOpen(false)} href="/properties" className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-teal-50">Properties</a>
      <a onClick={() => setMenuOpen(false)} href="/list-your-property" className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-teal-50">List property</a>
      <a onClick={() => setMenuOpen(false)} href="/#story" className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-teal-50">Our story</a>
      <a onClick={() => setMenuOpen(false)} href="/admin" className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-teal-50">Admin login</a>
    </nav>}
  </header>
}

function Home() {
  const [location, setLocation] = useState('Nalagarh')
  return <main className="bg-background text-foreground">
    <section className="relative flex min-h-[760px] items-end overflow-hidden bg-slate-900 pb-20 text-white lg:min-h-screen lg:items-center lg:pb-0">
      <div className="absolute inset-0"><img src={HERO_IMAGE} alt="Himachal mountain valley" className="h-full w-full object-cover opacity-80" /></div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,23,29,.82),rgba(6,23,29,.32),rgba(6,23,29,.24))]" />
      <Header dark />
      <div className="container relative z-10 mx-auto w-full px-5 lg:px-10"><div className="max-w-3xl"><div className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-teal-200"><span className="h-px w-12 bg-teal-300" /> Himachal Pradesh / curated living</div><h1 className="max-w-3xl font-serif text-5xl leading-[0.98] tracking-[-0.04em] sm:text-7xl lg:text-[7.2rem]">Find your dream property <span className="italic text-teal-200">with {BRAND}.</span></h1><p className="mt-7 max-w-lg text-base leading-7 text-white/75 lg:text-lg">Discover premium properties across Himachal Pradesh.</p></div>
        <div className="mt-12 flex max-w-2xl flex-col gap-3 rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-xl sm:flex-row sm:items-center"><div className="flex flex-1 items-center gap-3 rounded-xl bg-black/10 px-4 py-3"><MapPin size={18} className="text-teal-200" /><select value={location} onChange={(event) => setLocation(event.target.value)} className="w-full appearance-none bg-transparent text-sm font-medium text-white outline-none"><option className="text-slate-900">Nalagarh</option>{locations.slice(1).map((item) => <option key={item} className="text-slate-900">{item}</option>)}</select><ChevronDown size={17} className="text-white/60" /></div><a href={`/properties?location=${encodeURIComponent(location)}`} className="flex items-center justify-center gap-3 rounded-xl bg-teal-300 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-200">View properties <ArrowRight size={16} /></a></div>
      </div>
    </section>
    <section id="story" className="container mx-auto grid gap-12 px-5 py-24 lg:grid-cols-[.9fr_1.1fr] lg:px-10 lg:py-32"><div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">A higher standard</p><h2 className="mt-5 max-w-xl font-serif text-4xl leading-tight tracking-tight sm:text-6xl">Rooted in the <span className="italic text-teal-700">extraordinary.</span></h2></div><div className="max-w-xl self-end"><p className="text-lg leading-8 text-muted-foreground">{BRAND} brings a more thoughtful way to find a home in the hills. From first light over the Dhauladhar to the quiet of a cedar forest, we curate spaces that belong here.</p><a href="/properties" className="mt-8 inline-flex items-center gap-3 border-b border-teal-700 pb-2 text-sm font-semibold text-teal-800">Explore the collection <ArrowRight size={16} /></a></div></section>
    <section className="bg-[#edf2ed] py-20"><div className="container mx-auto grid gap-5 px-5 sm:grid-cols-3 lg:px-10"><div className="rounded-2xl bg-white p-7"><Trees className="text-teal-700" /><p className="mt-12 font-serif text-3xl">The right place</p><p className="mt-3 text-sm leading-6 text-muted-foreground">A location-led collection across Himachal’s most sought-after valleys.</p></div><div className="rounded-2xl bg-teal-900 p-7 text-white"><Sparkles className="text-teal-200" /><p className="mt-12 font-serif text-3xl">The considered choice</p><p className="mt-3 text-sm leading-6 text-white/65">Homes selected for their character, setting, and lasting value.</p></div><div className="rounded-2xl bg-[#d6e3dc] p-7"><Compass className="text-teal-700" /><p className="mt-12 font-serif text-3xl">The {BRAND} way</p><p className="mt-3 text-sm leading-6 text-muted-foreground">Personal guidance from first viewing to the moment you arrive.</p></div></div></section>
    <section className="container mx-auto px-5 py-20 lg:px-10"><div className="relative overflow-hidden rounded-3xl bg-teal-950 px-7 py-14 text-white sm:px-14"><div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-teal-800/40 blur-3xl" /><div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between"><div className="max-w-xl"><p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#e6c887]">Have a property to sell or rent?</p><h2 className="mt-4 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">List your property <span className="italic text-teal-200">with {BRAND}.</span></h2><p className="mt-4 text-base leading-7 text-white/70">Owners, agents and builders — reach thousands of buyers and tenants across Himachal. Free to list, reviewed by our team, live in no time.</p></div><a href="/list-your-property" className="flex shrink-0 items-center gap-3 rounded-full bg-[#c9a86a] px-7 py-4 text-sm font-semibold text-slate-950 transition hover:bg-[#d9bc82]">List your property <ArrowRight size={16} /></a></div></div></section>
    <Footer />
  </main>
}

function Footer() { return <footer className="bg-slate-950 px-5 py-12 text-white lg:px-10"><div className="container mx-auto flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><Brand dark /><p className="mt-4 max-w-xs text-sm leading-6 text-white/50">Premium property, thoughtfully found in Himachal Pradesh.</p></div><div className="flex items-center gap-5 text-white/50"><a href="/list-your-property" className="text-xs transition hover:text-white">List property</a><a href="/track" className="text-xs transition hover:text-white">Track listing</a><Instagram size={18} /><Mail size={18} /><span className="text-xs">© 2026 {BRAND}</span></div></div></footer> }

function PropertyCard({ property }) { return <a href={`/properties/${property.id}`} className="group block"><div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted"><img src={property.image} alt={property.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" /><span className="absolute left-4 top-4 rounded-full border border-white/30 bg-black/15 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">{property.type}</span>{property.featured && <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[#c9a86a] px-2.5 py-1 text-[10px] font-semibold text-slate-900"><Star size={11} /> Featured</span>}<span className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs text-white/85"><MapPin size={12} /> {property.location}</span></div><div className="flex items-start justify-between gap-4 pt-4"><div><h3 className="flex items-center gap-1.5 font-serif text-2xl tracking-tight">{property.title}{property.verified && <BadgeCheck size={16} className="text-teal-700" />}</h3><p className="mt-1 text-sm text-muted-foreground">{property.area} · {property.address?.split(',')[0]}</p></div><p className="whitespace-nowrap text-sm font-semibold text-teal-800">{property.price}</p></div></a> }

function Properties() {
  const [properties, setProperties] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [location, setLocation] = useState('All locations')
  useEffect(() => { const selected = new URLSearchParams(window.location.search).get('location'); if (selected) setLocation(selected) }, [])
  useEffect(() => { setLoading(true); api(`properties${location !== 'All locations' ? `?location=${encodeURIComponent(location)}` : ''}`).then((data) => setProperties(data.properties || [])).catch((reason) => setError(reason.message)).finally(() => setLoading(false)) }, [location])
  return <main className="min-h-screen bg-background text-foreground"><div className="border-b border-border bg-[#edf2ed]"><div className="container mx-auto px-5 lg:px-10"><Header /><div className="relative flex min-h-[380px] items-end pb-12 pt-28"><div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">The collection</p><h1 className="mt-4 font-serif text-5xl tracking-tight sm:text-7xl">Properties <span className="italic text-teal-700">available in</span></h1><div className="relative mt-7 inline-flex items-center gap-3 rounded-full border border-border bg-white px-4 py-2.5"><MapPin size={16} className="text-teal-700" /><select value={location} onChange={(event) => setLocation(event.target.value)} className="appearance-none bg-transparent pr-8 text-sm font-medium outline-none"><option>All locations</option>{locations.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={15} className="pointer-events-none absolute right-4 text-muted-foreground" /></div></div></div></div></div><div className="container mx-auto px-5 py-14 lg:px-10"><div className="mb-8 flex items-center justify-between"><p className="text-sm text-muted-foreground">{loading ? 'Finding your next address...' : `${properties.length} curated ${properties.length === 1 ? 'property' : 'properties'}`}</p><a href="/" className="text-sm font-medium text-teal-800">Back home</a></div>{error ? <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">{error}</div> : loading ? <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3"><div className="aspect-[4/3] animate-pulse rounded-2xl bg-muted" /><div className="aspect-[4/3] animate-pulse rounded-2xl bg-muted" /><div className="aspect-[4/3] animate-pulse rounded-2xl bg-muted" /></div> : properties.length ? <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">{properties.map((property) => <PropertyCard key={property.id} property={property} />)}</div> : <div className="rounded-2xl border border-dashed border-border py-24 text-center"><p className="font-serif text-3xl">A quieter corner awaits.</p><p className="mt-2 text-sm text-muted-foreground">We are curating new properties in this location.</p></div>}</div></main>
}

function Detail({ id }) {
  const [property, setProperty] = useState(null); const [activeImage, setActiveImage] = useState(0); const [form, setForm] = useState({ fullName: '', mobile: '', email: '', message: '', intent: 'buy' }); const [status, setStatus] = useState('')
  useEffect(() => { api(`properties/${id}`).then((data) => setProperty(data)).catch(() => setProperty({ error: true })) }, [id])
  const gallery = property?.gallery?.length ? property.gallery : property?.image ? [property.image] : []
  const submit = async (event) => { event.preventDefault(); setStatus('sending'); try { await api('inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, propertyId: id, propertyTitle: property.title }) }); setStatus('sent'); setForm({ fullName: '', mobile: '', email: '', message: '', intent: 'buy' }) } catch (reason) { setStatus(reason.message) } }
  if (!property) return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" /></div>
  if (property.error) return <div className="flex min-h-screen flex-col items-center justify-center gap-4"><p className="font-serif text-3xl">Property not found</p><a href="/properties" className="text-teal-800">Return to collection</a></div>
  return <main className="bg-background text-foreground"><div className="container mx-auto px-5 lg:px-10"><div className="relative pt-24"><a href="/properties" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"><ChevronLeft size={16} /> Back to collection</a><div className="grid gap-2 overflow-hidden rounded-2xl md:grid-cols-[1.35fr_.65fr]"><div className="relative aspect-[4/3] md:aspect-auto md:min-h-[580px]"><img src={gallery[activeImage]} alt={property.title} className="h-full w-full object-cover" /><button onClick={() => setActiveImage((activeImage + gallery.length - 1) % gallery.length)} className="absolute left-4 top-1/2 rounded-full bg-white/85 p-2 backdrop-blur" aria-label="Previous image"><ChevronLeft size={18} /></button><button onClick={() => setActiveImage((activeImage + 1) % gallery.length)} className="absolute right-4 top-1/2 rounded-full bg-white/85 p-2 backdrop-blur" aria-label="Next image"><ChevronRight size={18} /></button></div><div className="grid grid-cols-2 gap-2 md:grid-cols-1">{gallery.slice(1, 3).map((image, index) => <button key={image} onClick={() => setActiveImage(index + 1)} className="min-h-[180px] overflow-hidden"><img src={image} alt={`${property.title} view ${index + 2}`} className="h-full w-full object-cover transition hover:scale-105" /></button>)}</div></div><div className="grid gap-10 py-12 lg:grid-cols-[1fr_360px]"><div><div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-teal-700"><span>{property.type}</span><span className="h-1 w-1 rounded-full bg-teal-700" /><span>{property.location}</span></div><div className="mt-5 flex flex-wrap items-end justify-between gap-5"><div><h1 className="font-serif text-5xl tracking-tight sm:text-7xl">{property.title}</h1><p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><MapPin size={15} /> {property.address}</p></div><p className="font-serif text-3xl text-teal-800">{property.price}</p></div><p className="mt-10 max-w-2xl text-lg leading-8 text-muted-foreground">{property.description}</p><div className="mt-12 grid grid-cols-2 gap-4 border-y border-border py-6 sm:grid-cols-4">{property.specs?.map((spec) => <div key={spec.label}><p className="text-xs uppercase tracking-wider text-muted-foreground">{spec.label}</p><p className="mt-2 font-serif text-xl">{spec.value}</p></div>)}</div><div className="mt-12"><h2 className="font-serif text-3xl">Amenities</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{property.amenities?.map((amenity) => <div key={amenity} className="flex items-center gap-3 text-sm"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#dbe9e0] text-teal-800"><Check size={13} /></span>{amenity}</div>)}</div></div><div className="mt-12 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-[#edf2ed] p-6"><h3 className="font-serif text-2xl">Around you</h3><div className="mt-5 space-y-3">{property.nearby?.map((item) => <p key={item} className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin size={14} className="text-teal-700" /> {item}</p>)}</div></div><div className="rounded-2xl bg-slate-900 p-6 text-white"><h3 className="font-serif text-2xl">Find your way here</h3><p className="mt-3 text-sm leading-6 text-white/60">Explore the exact area, nearby essentials, and the landscape around this property.</p><a className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal-300 px-4 py-2.5 text-sm font-semibold text-slate-950" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address)}`} target="_blank" rel="noreferrer">Open in Google Maps <ArrowRight size={14} /></a></div></div>{property.video && <div className="mt-12 overflow-hidden rounded-2xl bg-slate-950"><div className="flex items-center gap-3 p-5 text-white"><Play size={16} className="text-teal-200" /> A sense of the setting</div><video controls muted playsInline poster={property.image} className="aspect-video w-full object-cover" src={property.video} /></div>}</div><div className="lg:pt-2"><div className="sticky top-8 rounded-2xl border border-border bg-white p-6 shadow-[0_20px_60px_rgba(16,54,48,.08)]"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Make it yours</p><h2 className="mt-3 font-serif text-3xl">Interested in this property?</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Tell us a little about what you are looking for. Our property advisors will be in touch.</p><form onSubmit={submit} className="mt-7 space-y-3"><input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} placeholder="Full name" className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-700" /><input required value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} placeholder="Mobile number" className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-700" /><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email address" className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-700" /><div className="grid grid-cols-3 gap-2">{['buy', 'rent', 'agent'].map((intent) => <button type="button" key={intent} onClick={() => setForm({ ...form, intent })} className={`rounded-lg border px-2 py-2.5 text-xs capitalize transition ${form.intent === intent ? 'border-teal-700 bg-teal-900 text-white' : 'border-border text-muted-foreground hover:border-teal-700'}`}>{intent}</button>)}</div><textarea rows="4" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Tell us what you have in mind" className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-700" /><button disabled={status === 'sending'} className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60">{status === 'sending' ? 'Sending...' : 'Send enquiry'} <ArrowRight size={15} /></button>{status === 'sent' && <p className="flex items-center gap-2 text-sm text-teal-800"><Check size={15} /> Thank you. We’ll be in touch shortly.</p>}{status && status !== 'sending' && status !== 'sent' && <p className="text-sm text-red-700">{status}</p>}</form><div className="mt-6 flex gap-2"><a href="tel:+911800123456" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border py-3 text-xs font-semibold"><Phone size={14} /> Call</a><a href="https://wa.me/911800123456" target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border py-3 text-xs font-semibold"><MessageCircle size={14} /> WhatsApp</a><button onClick={() => navigator.share?.({ title: property.title, url: window.location.href })} className="flex items-center justify-center rounded-lg border border-border px-3" aria-label="Share property"><Share2 size={14} /></button></div></div></div></div></div></div></main>
}

function AdminDashboard() {
  const blank = { title: '', location: 'Nalagarh', price: '', type: 'Villa', area: '', address: '', image: '', description: '', amenities: '', gallery: '' }
  const [properties, setProperties] = useState([]); const [inquiries, setInquiries] = useState([]); const [listings, setListings] = useState([]); const [listingEdit, setListingEdit] = useState(null); const [form, setForm] = useState(blank); const [editing, setEditing] = useState(null); const [notice, setNotice] = useState('')
  const load = () => Promise.all([api('properties'), api('inquiries'), api('listings')]).then(([propertyData, inquiryData, listingData]) => { setProperties(propertyData.properties || []); setInquiries(inquiryData.inquiries || []); setListings(listingData.listings || []) }).catch((reason) => setNotice(reason.message))
  const patchListing = async (id, patch) => { await api(`listings/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) }); load() }
  const saveListingEdit = async () => { const { id, listingId, _id, createdAt, ...rest } = listingEdit; await api(`listings/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rest) }); setListingEdit(null); load() }
  const removeListing = async (id) => { if (!window.confirm('Delete this listing permanently?')) return; await api(`listings/${id}`, { method: 'DELETE' }); load() }
  useEffect(() => { load() }, [])
  const save = async (event) => { event.preventDefault(); setNotice('Saving...'); const body = { ...form, amenities: form.amenities.split(',').map((item) => item.trim()).filter(Boolean), gallery: form.gallery.split(',').map((item) => item.trim()).filter(Boolean) }; try { await api(editing ? `properties/${editing}` : 'properties', { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); setForm(blank); setEditing(null); setNotice('Property saved'); load() } catch (reason) { setNotice(reason.message) } }
  const edit = (property) => { setEditing(property.id); setForm({ ...blank, ...property, amenities: (property.amenities || []).join(', '), gallery: (property.gallery || []).join(', ') }) }
  const remove = async (id) => { if (!window.confirm('Delete this property?')) return; await api(`properties/${id}`, { method: 'DELETE' }); load() }
  return <main className="min-h-screen bg-[#f5f7f4] text-foreground"><div className="border-b border-border bg-white"><div className="container mx-auto flex items-center justify-between px-5 py-5 lg:px-10"><Brand /><a href="/" className="text-sm text-muted-foreground">View site <ArrowRight size={14} className="ml-1 inline" /></a></div></div><div className="container mx-auto px-5 py-12 lg:px-10"><div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Workspace</p><h1 className="mt-3 font-serif text-5xl">Admin dashboard</h1><p className="mt-3 text-muted-foreground">Manage the collection and keep up with every enquiry.</p></div><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-2xl bg-teal-900 p-6 text-white"><Building2 size={19} className="text-teal-200" /><p className="mt-8 font-serif text-4xl">{properties.length}</p><p className="mt-1 text-sm text-white/60">Listed properties</p></div><div className="rounded-2xl bg-[#c9a86a] p-6 text-slate-900"><Building2 size={19} className="text-slate-800/70" /><p className="mt-8 font-serif text-4xl">{listings.filter((l) => l.status === 'pending_review').length}</p><p className="mt-1 text-sm text-slate-800/70">Pending submissions</p></div><div className="rounded-2xl bg-white p-6"><Mail size={19} className="text-teal-700" /><p className="mt-8 font-serif text-4xl">{inquiries.length}</p><p className="mt-1 text-sm text-muted-foreground">Total enquiries</p></div><div className="rounded-2xl bg-white p-6"><Sparkles size={19} className="text-teal-700" /><p className="mt-8 font-serif text-4xl">{inquiries.filter((item) => item.intent === 'buy').length}</p><p className="mt-1 text-sm text-muted-foreground">Buyers interested</p></div></div><div className="mt-12 grid gap-8 lg:grid-cols-[360px_1fr]"><form onSubmit={save} className="min-w-0 rounded-2xl bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl">{editing ? 'Edit property' : 'Add property'}</h2>{editing && <button type="button" onClick={() => { setEditing(null); setForm(blank) }} className="text-xs text-muted-foreground">Cancel</button>}</div><div className="mt-6 space-y-3">{[['title', 'Title'], ['price', 'Price'], ['area', 'Area'], ['address', 'Full address'], ['image', 'Cover image URL']].map(([key, label]) => <input required={['title', 'price', 'address'].includes(key)} key={key} value={form[key] || ''} onChange={(event) => setForm({ ...form, [key]: event.target.value })} placeholder={label} className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-teal-700" />)}<div className="grid grid-cols-2 gap-3"><select value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className="rounded-lg border border-border px-3 py-2.5 text-sm outline-none"><option disabled>Location</option>{locations.map((item) => <option key={item}>{item}</option>)}</select><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="rounded-lg border border-border px-3 py-2.5 text-sm outline-none"><option>Villa</option><option>Estate</option><option>Home</option><option>Land</option><option>Farmhouse</option></select></div><input value={form.gallery || ''} onChange={(event) => setForm({ ...form, gallery: event.target.value })} placeholder="Gallery image URLs, comma separated" className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-teal-700" /><input value={form.amenities || ''} onChange={(event) => setForm({ ...form, amenities: event.target.value })} placeholder="Amenities, comma separated" className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-teal-700" /><textarea rows="4" value={form.description || ''} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" className="w-full resize-none rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-teal-700" /><button className="w-full rounded-lg bg-teal-900 py-3 text-sm font-semibold text-white transition hover:bg-teal-800">{editing ? 'Update property' : 'Add property'}</button>{notice && <p className="text-xs text-muted-foreground">{notice}</p>}</div></form><div className="min-w-0 space-y-8"><section className="rounded-2xl bg-white p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><h2 className="font-serif text-2xl">Listing submissions</h2>{listings.filter((l) => l.status === 'pending_review').length > 0 && <span className="rounded-full bg-[#c9a86a]/20 px-3 py-1 text-xs font-semibold text-[#8a6d33]">{listings.filter((l) => l.status === 'pending_review').length} pending review</span>}</div><span className="text-xs text-muted-foreground">{listings.length} total</span></div><div className="mt-5 space-y-4">{listings.length ? listings.map((listing) => <div key={listing.id} className={`rounded-2xl border p-4 ${listing.status === 'pending_review' ? 'border-[#c9a86a]/40 bg-[#fbf8f0]' : 'border-border bg-white'}`}><div className="flex flex-wrap gap-4"><img src={listing.image || listing.photos?.[0] || LOGO} alt="" className="h-24 w-32 shrink-0 rounded-lg border border-border object-cover" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-serif text-xl">{listing.title}</h3>{listing.verified && <span className="flex items-center gap-1 rounded-full bg-[#dbe9e0] px-2 py-0.5 text-[10px] font-semibold text-teal-800"><BadgeCheck size={11} /> Verified</span>}{listing.featured && <span className="flex items-center gap-1 rounded-full bg-[#c9a86a]/20 px-2 py-0.5 text-[10px] font-semibold text-[#8a6d33]"><Star size={11} /> Featured</span>}<span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${listing.status === 'approved' ? 'bg-green-100 text-green-800' : listing.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>{(listing.status || 'pending_review').replace('_', ' ')}</span></div><p className="mt-1 text-xs text-muted-foreground">{listing.listingId} · {listing.category} · {listing.listingType}</p><p className="mt-1 text-sm"><span className="font-semibold text-teal-800">{listing.price}</span>{listing.negotiable && <span className="text-xs text-muted-foreground"> · Negotiable</span>} · {listing.area} {listing.areaUnit}</p><p className="mt-1 text-xs text-muted-foreground">{[listing.locality, listing.city, listing.district].filter(Boolean).join(', ')}</p><p className="mt-1 text-xs text-muted-foreground">{listing.contactName} · {listing.contactMobile}{listing.whatsapp ? ` · WA ${listing.whatsapp}` : ''}{listing.email ? ` · ${listing.email}` : ''}</p>{listing.mapsLink && <a href={listing.mapsLink} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-teal-800"><MapPin size={11} /> Map pin</a>}{listing.photos?.length > 1 && <div className="mt-2 flex gap-1.5">{listing.photos.slice(0, 6).map((src, i) => <img key={i} src={src} alt="" className="h-9 w-9 rounded object-cover" />)}</div>}</div></div>{listingEdit?.id === listing.id ? <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2"><input value={listingEdit.title} onChange={(e) => setListingEdit({ ...listingEdit, title: e.target.value })} placeholder="Title" className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal-700" /><input value={listingEdit.price} onChange={(e) => setListingEdit({ ...listingEdit, price: e.target.value })} placeholder="Price" className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal-700" /><input value={listingEdit.category} onChange={(e) => setListingEdit({ ...listingEdit, category: e.target.value })} placeholder="Category" className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal-700" /><input value={listingEdit.city} onChange={(e) => setListingEdit({ ...listingEdit, city: e.target.value })} placeholder="City" className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal-700" /><textarea rows="2" value={listingEdit.description || ''} onChange={(e) => setListingEdit({ ...listingEdit, description: e.target.value })} placeholder="Description" className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal-700 sm:col-span-2" /><div className="flex gap-2 sm:col-span-2"><button onClick={saveListingEdit} className="rounded-lg bg-teal-900 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800">Save changes</button><button onClick={() => setListingEdit(null)} className="rounded-lg border border-border px-4 py-2 text-xs font-medium">Cancel</button></div></div> : <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">{listing.status !== 'approved' && <button onClick={() => patchListing(listing.id, { status: 'approved' })} className="rounded-full bg-teal-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-800">Approve</button>}{listing.status !== 'rejected' && <button onClick={() => patchListing(listing.id, { status: 'rejected' })} className="rounded-full border border-red-300 px-3.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">Reject</button>}<button onClick={() => patchListing(listing.id, { verified: !listing.verified })} className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold hover:border-teal-700">{listing.verified ? 'Unverify' : 'Mark verified'}</button><button onClick={() => patchListing(listing.id, { featured: !listing.featured })} className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold hover:border-teal-700">{listing.featured ? 'Unfeature' : 'Feature'}</button><button onClick={() => setListingEdit({ ...listing })} className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-teal-800 hover:border-teal-700">Edit</button><button onClick={() => removeListing(listing.id)} className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-red-700 hover:border-red-300">Delete</button></div>}</div>) : <p className="py-8 text-center text-sm text-muted-foreground">Property submissions from owners and agents will appear here for review.</p>}</div></section><section className="rounded-2xl bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl">Properties</h2><span className="text-xs text-muted-foreground">{properties.length} total</span></div><div className="mt-5 divide-y divide-border">{properties.map((property) => <div key={property.id} className="flex items-center gap-4 py-4"><img src={property.image} alt="" className="h-14 w-20 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="truncate font-medium">{property.title}</p><p className="mt-1 text-xs text-muted-foreground">{property.location} · {property.price}</p></div><button onClick={() => edit(property)} className="text-xs font-medium text-teal-800">Edit</button><button onClick={() => remove(property.id)} className="text-xs font-medium text-red-700">Delete</button></div>)}</div></section><section className="rounded-2xl bg-white p-6 shadow-sm"><h2 className="font-serif text-2xl">Latest enquiries</h2><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground"><th className="pb-3">Name</th><th className="pb-3">Property</th><th className="pb-3">Interest</th><th className="pb-3">Contact</th></tr></thead><tbody>{inquiries.map((inquiry) => <tr key={inquiry.id} className="border-b border-border last:border-0"><td className="py-4 font-medium">{inquiry.fullName}</td><td className="py-4 text-muted-foreground">{inquiry.propertyTitle}</td><td className="py-4 capitalize text-muted-foreground">{inquiry.intent}</td><td className="py-4 text-muted-foreground">{inquiry.mobile}</td></tr>)}</tbody></table>{!inquiries.length && <p className="py-8 text-center text-sm text-muted-foreground">New enquiries will appear here.</p>}</div></section></div></div></div></main>
}

function AdminWorkspace() {
  const [properties, setProperties] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [messages, setMessages] = useState([])
  const [notice, setNotice] = useState('')
  const [compose, setCompose] = useState({ to: '', subject: '', message: '', enquiryId: '' })
  const [filter, setFilter] = useState('all')
  const load = async () => {
    try {
      const [propertyData, enquiryData, messageData] = await Promise.all([api('properties'), api('inquiries'), api('messages')])
      setProperties(propertyData.properties || [])
      setInquiries(enquiryData.inquiries || [])
      setMessages(messageData.messages || [])
    } catch (error) { setNotice(error.message) }
  }
  useEffect(() => { load() }, [])
  const updateProperty = async (id, status) => {
    try { await api(`properties/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); setNotice(`Property marked ${status}`); load() } catch (error) { setNotice(error.message) }
  }
  const updateInquiry = async (id, status) => {
    try { await api(`inquiries/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); load() } catch (error) { setNotice(error.message) }
  }
  const sendMessage = async (event) => {
    event.preventDefault()
    try { await api('messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(compose) }); setCompose({ to: '', subject: '', message: '', enquiryId: '' }); setNotice('Message stored and sent when SMTP is configured'); load() } catch (error) { setNotice(error.message) }
  }
  const messageEnquiry = (item) => setCompose({ to: item.email || '', subject: `Re: ${item.propertyTitle || 'Your HimBhumi enquiry'}`, message: `Hello ${item.fullName},\n\nThank you for your enquiry.`, enquiryId: item.id })
  const visibleInquiries = inquiries.filter((item) => filter === 'all' || item.status === filter)
  return <main className="min-h-screen bg-[#f5f7f4] text-foreground"><div className="border-b border-border bg-white"><div className="container mx-auto flex items-center justify-between px-5 py-5 lg:px-10"><Brand /><div className="flex items-center gap-4"><a href="/" className="text-sm text-muted-foreground">View site</a><button onClick={async () => { await api('admin/logout', { method: 'POST' }); window.location.href = '/admin' }} className="text-sm font-semibold text-red-700">Log out</button></div></div></div><div className="container mx-auto space-y-8 px-5 py-12 lg:px-10"><div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Workspace</p><h1 className="mt-3 font-serif text-5xl">Admin dashboard</h1><p className="mt-3 text-muted-foreground">Publish, sell, and follow up every HimBhumi property enquiry.</p></div>{notice && <p className="rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-900">{notice}</p>}<section className="rounded-2xl bg-white p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-serif text-2xl">Properties</h2><span className="text-sm text-muted-foreground">{properties.length} total</span></div><div className="mt-5 space-y-3">{properties.length ? properties.map((property) => <div key={property.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-border p-4"><img src={property.image || LOGO} alt="" className="h-16 w-24 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="font-serif text-xl">{property.title}</p><p className="text-sm text-muted-foreground">{property.location} · {property.price}</p><span className="text-xs font-semibold uppercase text-teal-700">{property.status || 'published'}</span></div><div className="flex flex-wrap gap-2"><button onClick={() => updateProperty(property.id, property.status === 'sold' ? 'published' : 'sold')} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold">{property.status === 'sold' ? 'Restore' : 'Mark sold'}</button><button onClick={() => updateProperty(property.id, property.status === 'published' ? 'draft' : 'published')} className="rounded-lg bg-teal-900 px-3 py-2 text-xs font-semibold text-white">{property.status === 'published' ? 'Unpublish' : 'Publish'}</button></div></div>) : <p className="text-sm text-muted-foreground">No properties found.</p>}</div></section><section className="rounded-2xl bg-white p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-serif text-2xl">Enquiries</h2><select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm"><option value="all">All statuses</option><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></div><div className="mt-5 space-y-3">{visibleInquiries.length ? visibleInquiries.map((item) => <div key={item.id} className="rounded-xl border border-border p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{item.fullName} · {item.mobile}</p><p className="text-sm text-teal-800">{item.propertyTitle || item.propertyId}</p><p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{item.message || 'No message provided.'}</p>{item.email && <p className="mt-2 text-xs text-muted-foreground">{item.email}</p>}</div><div className="flex flex-wrap gap-2"><select value={item.status || 'new'} onChange={(event) => updateInquiry(item.id, event.target.value)} className="rounded-lg border border-border px-2 py-2 text-xs"><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select>{item.email && <button onClick={() => messageEnquiry(item)} className="rounded-lg bg-teal-900 px-3 py-2 text-xs font-semibold text-white">Message</button>}</div></div></div>) : <p className="text-sm text-muted-foreground">No enquiries yet.</p>}</div></section><section className="grid gap-8 lg:grid-cols-[1fr_1fr]"><form onSubmit={sendMessage} className="rounded-2xl bg-white p-6 shadow-sm"><h2 className="font-serif text-2xl">Inbox · compose</h2><div className="mt-5 space-y-3"><input required type="email" value={compose.to} onChange={(event) => setCompose({ ...compose, to: event.target.value })} placeholder="Recipient email" className="w-full rounded-lg border border-border px-3 py-2.5 text-sm" /><input required value={compose.subject} onChange={(event) => setCompose({ ...compose, subject: event.target.value })} placeholder="Subject" className="w-full rounded-lg border border-border px-3 py-2.5 text-sm" /><textarea required rows="7" value={compose.message} onChange={(event) => setCompose({ ...compose, message: event.target.value })} placeholder="Message" className="w-full resize-none rounded-lg border border-border px-3 py-2.5 text-sm" /><button className="rounded-lg bg-teal-900 px-5 py-3 text-sm font-semibold text-white">Send and store message</button></div></form><div className="rounded-2xl bg-white p-6 shadow-sm"><h2 className="font-serif text-2xl">Sent messages</h2><div className="mt-5 space-y-3">{messages.length ? messages.map((item) => <div key={item.id} className="rounded-xl border border-border p-4"><div className="flex justify-between gap-3"><p className="font-semibold">{item.subject}</p><span className="text-xs uppercase text-teal-700">{item.status}</span></div><p className="mt-1 text-xs text-muted-foreground">To: {item.to} · {new Date(item.createdAt).toLocaleString()}</p><p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">{item.message}</p></div>) : <p className="text-sm text-muted-foreground">No messages stored yet.</p>}</div></div></section></div></main>
}

function Admin() {
  const [authenticated, setAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('admin/session').then(() => setAuthenticated(true)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const login = async (event) => {
    event.preventDefault()
    setError('')
    try {
      await api('admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim().toLowerCase(), password }) })
      setAuthenticated(true)
      setPassword('')
    } catch (reason) {
      setError(reason.message)
    }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#f5f7f4]"><Loader2 className="animate-spin text-teal-800" /></div>
  if (authenticated) return <AdminWorkspace />
  return <main className="flex min-h-screen items-center justify-center bg-[#edf2ed] px-5"><form onSubmit={login} className="w-full max-w-md rounded-3xl border border-border bg-white p-8 shadow-xl"><p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Restricted workspace</p><h1 className="mt-3 font-serif text-4xl">Admin login</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Only the HimBhumi administrator can access listings, enquiries, and property management.</p><div className="mt-7 space-y-4"><label className="block"><span className="mb-1.5 block text-sm font-medium text-foreground">Admin email</span><input required autoComplete="username" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Admin email" className="w-full rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-teal-700" /></label><label className="block"><span className="mb-1.5 block text-sm font-medium text-foreground">Password</span><span className="relative block"><input required autoComplete="current-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-sm outline-none focus:border-teal-700" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-muted-foreground transition hover:text-teal-800">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>{error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<button className="w-full rounded-lg bg-teal-900 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-800">Sign in</button></div><a href="/" className="mt-6 block text-center text-sm text-muted-foreground hover:text-teal-800">Return to website</a></form></main>
}

function WebsiteChatbot() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [properties, setProperties] = useState(null)
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'Namaste! I can help you explore HimBhumi properties, locations, prices, listing your property, or tracking a submission. What are you looking for?' }])

  const loadProperties = async () => {
    if (properties) return properties
    let available = []
    try {
      const data = await api('properties')
      available = data.properties || []
    } catch {
      // General site guidance remains available if the property database is temporarily offline.
    }
    setProperties(available)
    return available
  }

  const answer = async (question) => {
    const text = question.toLowerCase()
    const catalog = await loadProperties()
    const location = locations.find((item) => text.includes(item.toLowerCase()))
    const matches = catalog.filter((property) => {
      const haystack = [property.title, property.location, property.type, property.price, property.area, property.address, property.description, ...(property.amenities || [])].join(' ').toLowerCase()
      return (!location || property.location.toLowerCase() === location.toLowerCase()) && text.split(/\s+/).some((word) => word.length > 2 && haystack.includes(word))
    }).slice(0, 3)
    if (/list|sell|rent out|advertis|owner|builder/.test(text)) return { text: 'Owners, agents, and builders can submit a property for free. Our team reviews every submission before it goes live. Start here: /list-your-property' }
    if (/track|status|listing id|submission/.test(text)) return { text: 'You can check a submitted property using its Listing ID here: /track. Approved listings are published after our review.' }
    if (/contact|call|whatsapp|enquir|visit|viewing/.test(text)) return { text: 'For a viewing or enquiry, open any property and use its enquiry form. Browse the full collection here: /properties.' }
    if (matches.length) return { text: location ? `Here are the best matches I found in ${location}:` : 'Here are a few matches from the HimBhumi collection:', properties: matches }
    if (location) return { text: `I do not see a published property matching that request in ${location} yet. Try another Himachal location or browse all properties: /properties.` }
    if (/where|location|place|district|himachal/.test(text)) return { text: `HimBhumi currently covers ${locations.join(', ')}. Tell me a location, property type, or budget and I will narrow the collection for you.` }
    if (/price|budget|cost|crore|cr|lakh|cheap|expensive/.test(text)) return { text: 'Prices vary by location, land size, property type, and views. Tell me your budget and preferred location, or browse the published collection: /properties.' }
    return { text: 'I can help with published properties, locations, prices, viewing enquiries, listing a property, and tracking a submission. Try “show villas in Kasauli” or “how do I list my property?”' }
  }

  const send = async (event) => {
    event.preventDefault()
    const question = input.trim()
    if (!question || busy) return
    setMessages((current) => [...current, { role: 'user', text: question }])
    setInput('')
    setBusy(true)
    try {
      const result = await answer(question)
      setMessages((current) => [...current, { role: 'assistant', ...result }])
    } catch {
      setMessages((current) => [...current, { role: 'assistant', text: 'I could not load the property collection right now. Please try again or browse /properties.' }])
    } finally { setBusy(false) }
  }

  const linkify = (text) => text.split(/(\/(?:properties|list-your-property|track)(?:\/[^ ]*)?)/g).map((part, index) => part.startsWith('/') ? <a key={index} href={part} className="font-semibold text-teal-800 underline">{part}</a> : part)
  return <>
    <button onClick={() => setOpen(true)} aria-label="Open HimBhumi property assistant" className={`fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full bg-teal-900 py-3 pl-4 pr-5 text-white shadow-[0_20px_50px_-15px_rgba(10,74,32,.7)] ring-1 ring-[#c9a86a]/60 transition hover:bg-teal-800 ${open ? 'pointer-events-none opacity-0' : 'opacity-100'}`}><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c9a86a]/20 ring-1 ring-[#c9a86a]"><MessageCircle size={16} className="text-[#e6c887]" /></span><span className="text-left leading-tight"><span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e6c887]">Ask HimBhumi</span><span className="block text-sm font-medium">Property assistant</span></span></button>
    {open && <div className="fixed inset-0 z-50 flex items-end justify-end p-3 sm:p-6" role="dialog" aria-label="HimBhumi property assistant"><button aria-label="Close" onClick={() => setOpen(false)} className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" /><div className="relative flex h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-[#c9a86a]/25 bg-white shadow-2xl sm:h-[650px]"><div className="flex items-center gap-3 bg-teal-950 px-5 py-4 text-white"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 ring-1 ring-[#c9a86a]/70"><MessageCircle size={18} className="text-[#e6c887]" /></span><div className="flex-1 leading-tight"><p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#e6c887]">HimBhumi</p><p className="font-serif text-xl">Property assistant</p></div><button onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button></div><div className="flex-1 space-y-4 overflow-y-auto bg-[#f7f4ec] px-4 py-5">{messages.map((message, index) => <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${message.role === 'user' ? 'bg-teal-900 text-white' : 'border border-[#c9a86a]/25 bg-white text-slate-800 shadow-sm'}`}><p className="whitespace-pre-wrap">{linkify(message.text)}</p>{message.properties?.map((property) => <a key={property.id} href={`/properties/${property.id}`} className="mt-3 block rounded-xl border border-border bg-[#f7f4ec] p-3 transition hover:border-teal-700"><p className="font-serif text-lg text-slate-900">{property.title}</p><p className="text-xs text-muted-foreground">{property.location} · {property.type}</p><p className="mt-1 text-sm font-semibold text-teal-900">{property.price}</p></a>)}</div></div>)}{busy && <div className="flex justify-start"><div className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-muted-foreground">Searching the HimBhumi collection...</div></div>}</div><form onSubmit={send} className="flex items-center gap-2 border-t border-border bg-white px-3 py-3"><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about a property or location..." className="flex-1 rounded-full border border-border bg-[#f7f4ec] px-4 py-2.5 text-sm outline-none focus:border-teal-700" /><button disabled={busy || !input.trim()} className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-900 text-white disabled:opacity-50" aria-label="Send"><ArrowRight size={16} /></button></form></div></div>}
  </>
}

function Field({ label, required, children, hint }) {
  return <label className="block">
    <span className="mb-1.5 flex items-center gap-1 text-sm font-medium text-foreground">{label}{required && <span className="text-red-600">*</span>}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
  </label>
}

const fieldClass = 'w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm outline-none transition focus:border-teal-700'

const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
const cloudinaryEnabled = () => Boolean(CLOUDINARY_CLOUD && CLOUDINARY_PRESET)

async function cloudinaryUpload(file, resourceType = 'image') {
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/${resourceType}/upload`
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', CLOUDINARY_PRESET)
  const res = await fetch(endpoint, { method: 'POST', body: fd })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || 'Upload failed')
  return data.secure_url
}

const compressImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => {
    const img = new window.Image()
    img.onload = () => {
      const maxW = 1280
      const scale = Math.min(1, maxW / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.72))
    }
    img.onerror = reject
    img.src = reader.result
  }
  reader.onerror = reject
  reader.readAsDataURL(file)
})

const readFile = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsDataURL(file)
})

function ListProperty() {
  const blank = {
    title: '', category: '', listingType: 'For sale', price: '', negotiable: false,
    area: '', areaUnit: 'sq. ft.', bedrooms: '', bathrooms: '', propertyAge: '', description: '',
    state: 'Himachal Pradesh', district: '', city: '', locality: '', landmark: '', mapsLink: '',
    contactName: '', contactMobile: '', whatsapp: '', email: '', showPhone: true,
  }
  const [form, setForm] = useState(blank)
  const [photos, setPhotos] = useState([])
  const [floorPlan, setFloorPlan] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoData, setVideoData] = useState('')
  const [uploading, setUploading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpInput, setOtpInput] = useState('')
  const [devOtp, setDevOtp] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verifyMsg, setVerifyMsg] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const onPhotos = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    setUploading(true); setError('')
    try {
      const remaining = 10 - photos.length
      const processed = await Promise.all(files.slice(0, remaining).map((file) => cloudinaryEnabled() ? cloudinaryUpload(file, 'image') : compressImage(file)))
      setPhotos((prev) => [...prev, ...processed])
    } catch { setError('Could not process one of the images. Please try another file.') }
    finally { setUploading(false); event.target.value = '' }
  }
  const onFloorPlan = async (event) => {
    const file = event.target.files?.[0]; if (!file) return
    setUploading(true); try { setFloorPlan(cloudinaryEnabled() ? await cloudinaryUpload(file, 'image') : await compressImage(file)) } catch { setError('Could not process the floor plan.') } finally { setUploading(false); event.target.value = '' }
  }
  const onVideo = async (event) => {
    const file = event.target.files?.[0]; if (!file) return
    if (!cloudinaryEnabled() && file.size > 8 * 1024 * 1024) { setError('Video is larger than 8 MB. Please upload a shorter clip or paste a video link below.'); event.target.value = ''; return }
    setUploading(true); try { setVideoData(cloudinaryEnabled() ? await cloudinaryUpload(file, 'video') : await readFile(file)) } catch { setError('Could not process the video.') } finally { setUploading(false); event.target.value = '' }
  }

  const sendOtp = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setVerifyMsg('Enter a valid email address first'); return }
    setVerifying(true); setVerifyMsg('')
    try {
      const res = await api('listings/verify/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ channel: 'email', value: form.email.trim() }) })
      setOtpSent(true); setDevOtp(res.devOtp || ''); setVerifyMsg('')
    } catch (reason) { setVerifyMsg(reason.message) } finally { setVerifying(false) }
  }
  const checkOtp = async () => {
    setVerifying(true); setVerifyMsg('')
    try {
      await api('listings/verify/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ channel: 'email', value: form.email.trim(), otp: otpInput.trim() }) })
      setEmailVerified(true); setVerifyMsg('')
    } catch (reason) { setVerifyMsg(reason.message) } finally { setVerifying(false) }
  }

  const submit = async (event) => {
    event.preventDefault(); setError('')
    if (!emailVerified) { setError('Please verify your email address before submitting.'); return }
    if (!authorized) { setError('Please confirm you are authorized to advertise this property.'); return }
    if (!photos.length) { setError('Please add at least one photo of the property.'); return }
    setStatus('sending')
    try {
      const payload = { ...form, photos, image: photos[0], floorPlan, video: videoUrl || videoData, emailVerified: true, authorized: true }
      const res = await api('listings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      setResult(res); window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (reason) { setError(reason.message); setStatus('') }
  }

  const needsRooms = ['House', 'Apartment / Flat', 'Villa'].includes(form.category)

  if (result) return <main className="min-h-screen bg-[#edf2ed] text-foreground"><div className="container mx-auto px-5 lg:px-10"><Header /><div className="flex min-h-screen items-center justify-center py-32">
    <div className="w-full max-w-lg rounded-3xl border border-[#c9a86a]/30 bg-white p-8 text-center shadow-[0_30px_80px_-30px_rgba(10,74,32,.4)] sm:p-12">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#dbe9e0] text-teal-800"><Check size={30} /></span>
      <h1 className="mt-6 font-serif text-4xl tracking-tight">Listing submitted</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">Thank you. Your property has been received and is now with our team for review. It will go live once approved.</p>
      <div className="mt-7 rounded-2xl bg-[#f7f4ec] p-5"><p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Your listing ID</p><div className="mt-2 flex items-center justify-center gap-3"><span className="font-serif text-3xl text-teal-900">{result.listingId}</span><button onClick={() => { navigator.clipboard?.writeText(result.listingId); setCopied(true); setTimeout(() => setCopied(false), 1500) }} className="rounded-full border border-border p-2 text-muted-foreground transition hover:text-teal-800" aria-label="Copy listing ID">{copied ? <Check size={15} /> : <Copy size={15} />}</button></div><p className="mt-2 text-xs text-muted-foreground">Save this ID to track your listing status with us.</p></div>
      <a href={`/track?id=${result.listingId}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-800 hover:text-teal-900">Track this listing <ArrowRight size={14} /></a>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row"><a href="/properties" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-teal-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800">Browse properties</a><button onClick={() => { setForm(blank); setPhotos([]); setFloorPlan(''); setVideoUrl(''); setVideoData(''); setEmailVerified(false); setOtpSent(false); setOtpInput(''); setAuthorized(false); setStatus(''); setResult(null) }} className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold transition hover:border-teal-700">List another</button></div>
    </div></div></div></main>

  return <main className="min-h-screen bg-[#edf2ed] text-foreground">
    <div className="border-b border-border bg-[#edf2ed]"><div className="container mx-auto px-5 lg:px-10"><Header /><div className="relative flex min-h-[320px] items-end pb-12 pt-28"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">Owners · Agents · Builders</p><h1 className="mt-4 font-serif text-5xl tracking-tight sm:text-6xl">List your <span className="italic text-teal-700">property</span></h1><p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">Share your property with thousands of buyers and tenants across Himachal Pradesh. It only takes a few minutes — our team reviews every listing before it goes live.</p></div></div></div></div>

    <form onSubmit={submit} className="container mx-auto grid gap-6 px-5 py-12 lg:grid-cols-[1fr_340px] lg:px-10">
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8"><div className="mb-6 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-900 text-white"><HomeIcon size={17} /></span><h2 className="font-serif text-2xl">Property details</h2></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Field label="Property title" required><input required value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. 3 BHK villa with valley views" className={fieldClass} /></Field></div>
            <Field label="Category" required><select required value={form.category} onChange={(e) => set('category', e.target.value)} className={fieldClass}><option value="" disabled>Select a category</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Listing type" required><select value={form.listingType} onChange={(e) => set('listingType', e.target.value)} className={fieldClass}>{LISTING_TYPES.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label={form.listingType === 'For sale' ? 'Price' : 'Expected rent / lease'} required><input required value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="e.g. ₹ 85,00,000 or ₹ 25,000 / month" className={fieldClass} /></Field>
            <div className="flex items-end pb-2"><label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={form.negotiable} onChange={(e) => set('negotiable', e.target.checked)} className="h-4 w-4 rounded border-border accent-teal-800" /> Price is negotiable</label></div>
            <Field label="Area" required><input required value={form.area} onChange={(e) => set('area', e.target.value)} placeholder="e.g. 2400" className={fieldClass} /></Field>
            <Field label="Area unit" required><select value={form.areaUnit} onChange={(e) => set('areaUnit', e.target.value)} className={fieldClass}>{AREA_UNITS.map((c) => <option key={c}>{c}</option>)}</select></Field>
            {needsRooms && <><Field label="Bedrooms"><input value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} placeholder="e.g. 3" className={fieldClass} /></Field>
            <Field label="Bathrooms"><input value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} placeholder="e.g. 2" className={fieldClass} /></Field></>}
            <Field label="Property age"><input value={form.propertyAge} onChange={(e) => set('propertyAge', e.target.value)} placeholder="e.g. New / 5 years" className={fieldClass} /></Field>
            <div className="sm:col-span-2"><Field label="Description"><textarea rows="4" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe the property, its highlights, surroundings and anything a buyer should know." className={`${fieldClass} resize-none`} /></Field></div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8"><div className="mb-6 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-900 text-white"><MapPin size={17} /></span><h2 className="font-serif text-2xl">Location</h2></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="State" required><input required value={form.state} onChange={(e) => set('state', e.target.value)} className={fieldClass} /></Field>
            <Field label="District" required><select required value={form.district} onChange={(e) => set('district', e.target.value)} className={fieldClass}><option value="" disabled>Select district</option>{HP_DISTRICTS.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="City / Town / Village" required><input required value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="e.g. Kasauli" className={fieldClass} /></Field>
            <Field label="Locality / Area"><input value={form.locality} onChange={(e) => set('locality', e.target.value)} placeholder="e.g. Garkhal" className={fieldClass} /></Field>
            <Field label="Nearby landmark"><input value={form.landmark} onChange={(e) => set('landmark', e.target.value)} placeholder="e.g. Near Kasauli Club" className={fieldClass} /></Field>
            <Field label="Google Maps pin (link)" hint="Open Google Maps, tap Share, and paste the link here."><input value={form.mapsLink} onChange={(e) => set('mapsLink', e.target.value)} placeholder="https://maps.google.com/..." className={fieldClass} /></Field>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8"><div className="mb-2 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-900 text-white"><Camera size={17} /></span><h2 className="font-serif text-2xl">Photos & media</h2></div>
          <p className="mb-6 text-sm text-muted-foreground">Add clear photos to help your listing stand out. You can add up to 10 photos.</p>
          <div className="space-y-6">
            <div><span className="mb-2 flex items-center gap-1 text-sm font-medium">Photos <span className="text-red-600">*</span> <span className="ml-1 text-xs font-normal text-muted-foreground">({photos.length}/10)</span></span>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {photos.map((src, index) => <div key={index} className="group relative aspect-square overflow-hidden rounded-xl border border-border"><img src={src} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />{index === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-teal-900 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">Cover</span>}<button type="button" onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))} className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100" aria-label="Remove photo"><X size={13} /></button></div>)}
                {photos.length < 10 && <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border text-muted-foreground transition hover:border-teal-700 hover:text-teal-800"><Upload size={20} /><span className="text-[11px] font-medium">Add photos</span><input type="file" accept="image/*" multiple onChange={onPhotos} className="hidden" /></label>}
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div><span className="mb-2 flex items-center gap-1 text-sm font-medium"><FileText size={15} className="text-teal-700" /> Floor plan <span className="text-xs font-normal text-muted-foreground">(optional)</span></span>
                {floorPlan ? <div className="relative aspect-video overflow-hidden rounded-xl border border-border"><img src={floorPlan} alt="Floor plan" className="h-full w-full object-contain bg-[#f7f4ec]" /><button type="button" onClick={() => setFloorPlan('')} className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white" aria-label="Remove floor plan"><X size={13} /></button></div>
                : <label className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border text-muted-foreground transition hover:border-teal-700 hover:text-teal-800"><Upload size={18} /><span className="text-[11px] font-medium">Upload floor plan</span><input type="file" accept="image/*" onChange={onFloorPlan} className="hidden" /></label>}
              </div>
              <div><span className="mb-2 flex items-center gap-1 text-sm font-medium"><Video size={15} className="text-teal-700" /> Video <span className="text-xs font-normal text-muted-foreground">(optional)</span></span>
                {videoData ? <div className="relative aspect-video overflow-hidden rounded-xl border border-border"><video src={videoData} controls className="h-full w-full bg-black object-cover" /><button type="button" onClick={() => setVideoData('')} className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white" aria-label="Remove video"><X size={13} /></button></div>
                : <label className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border text-muted-foreground transition hover:border-teal-700 hover:text-teal-800"><Upload size={18} /><span className="text-[11px] font-medium">Upload video (max 8 MB)</span><input type="file" accept="video/*" onChange={onVideo} className="hidden" /></label>}
                <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="or paste a video link (YouTube / Drive)" className={`${fieldClass} mt-2`} />
              </div>
            </div>
            {uploading && <p className="flex items-center gap-2 text-sm text-teal-800"><Loader2 size={15} className="animate-spin" /> Processing media...</p>}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8"><div className="mb-6 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-900 text-white"><Phone size={16} /></span><h2 className="font-serif text-2xl">Contact details</h2></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required><input required value={form.contactName} onChange={(e) => set('contactName', e.target.value)} placeholder="Your name" className={fieldClass} /></Field>
            <Field label="Mobile number" required><input required value={form.contactMobile} onChange={(e) => set('contactMobile', e.target.value)} placeholder="e.g. 98xxxxxxxx" className={fieldClass} /></Field>
            <div className="sm:col-span-2">
              <Field label="Email address" required hint="A verification code will be sent to this email.">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input required type="email" value={form.email} disabled={emailVerified} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" className={`${fieldClass} flex-1 disabled:opacity-70`} />
                  {emailVerified ? <span className="flex items-center justify-center gap-2 rounded-lg bg-[#dbe9e0] px-4 py-2.5 text-sm font-semibold text-teal-800"><BadgeCheck size={16} /> Verified</span>
                  : <button type="button" onClick={sendOtp} disabled={verifying} className="flex items-center justify-center gap-2 rounded-lg bg-teal-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60">{verifying ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />} {otpSent ? 'Resend code' : 'Send code'}</button>}
                </div>
              </Field>
              {otpSent && !emailVerified && <div className="mt-3 rounded-xl border border-[#c9a86a]/30 bg-[#f7f4ec] p-4">
                {devOtp && <p className="mb-3 text-xs text-muted-foreground">Demo mode: your verification code is <span className="font-semibold text-teal-900">{devOtp}</span> <span className="italic">(email gateway not connected)</span></p>}
                {!devOtp && <p className="mb-3 text-xs text-muted-foreground">We&apos;ve sent a 6-digit code to <span className="font-semibold text-teal-900">{form.email}</span>. Please check your inbox (and spam folder).</p>}
                <div className="flex flex-col gap-2 sm:flex-row"><input value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder="Enter 6-digit code" maxLength={6} className={`${fieldClass} flex-1`} /><button type="button" onClick={checkOtp} disabled={verifying || !otpInput.trim()} className="rounded-lg bg-[#c9a86a] px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-[#b9975a] disabled:opacity-60">Verify</button></div>
              </div>}
              {verifyMsg && <p className="mt-2 text-sm text-red-700">{verifyMsg}</p>}
            </div>
            <Field label="WhatsApp number"><input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="e.g. 98xxxxxxxx" className={fieldClass} /></Field>
            <div className="flex items-end pb-2"><label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={form.showPhone} onChange={(e) => set('showPhone', e.target.checked)} className="h-4 w-4 rounded border-border accent-teal-800" /> Show my phone number on the listing</label></div>
          </div>
        </section>
      </div>

      <aside className="lg:pt-0"><div className="sticky top-6 space-y-4 rounded-2xl border border-border bg-white p-6 shadow-[0_20px_60px_rgba(16,54,48,.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Almost there</p>
        <h2 className="font-serif text-2xl">Review & submit</h2>
        <ul className="space-y-2.5 text-sm">
          <li className="flex items-center gap-2 text-muted-foreground"><span className={`flex h-5 w-5 items-center justify-center rounded-full ${form.title && form.category && form.price ? 'bg-[#dbe9e0] text-teal-800' : 'bg-muted text-muted-foreground'}`}><Check size={12} /></span> Property details</li>
          <li className="flex items-center gap-2 text-muted-foreground"><span className={`flex h-5 w-5 items-center justify-center rounded-full ${photos.length ? 'bg-[#dbe9e0] text-teal-800' : 'bg-muted text-muted-foreground'}`}><Check size={12} /></span> At least one photo</li>
          <li className="flex items-center gap-2 text-muted-foreground"><span className={`flex h-5 w-5 items-center justify-center rounded-full ${emailVerified ? 'bg-[#dbe9e0] text-teal-800' : 'bg-muted text-muted-foreground'}`}><Check size={12} /></span> Email verified</li>
        </ul>
        <label className="flex items-start gap-2.5 rounded-xl bg-[#f7f4ec] p-3.5 text-xs leading-5 text-muted-foreground"><input type="checkbox" checked={authorized} onChange={(e) => setAuthorized(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-teal-800" /> I confirm that I am the owner or an authorized person to advertise this property, and the details provided are accurate.</label>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button disabled={status === 'sending'} className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60">{status === 'sending' ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <>Submit listing <ArrowRight size={15} /></>}</button>
        <p className="text-center text-[11px] leading-4 text-muted-foreground">Your listing is not published immediately. Our team reviews every submission before it goes live.</p>
      </div></aside>
    </form>
    <Footer />
  </main>
}

function Tracker() {
  const [listingId, setListingId] = useState('')
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const submit = async (event) => {
    event.preventDefault()
    const value = listingId.trim().toUpperCase()
    if (!value) return
    setStatus('loading'); setResult(null)
    try {
      const data = await api(`listings?listingId=${encodeURIComponent(value)}`)
      setResult(data.listing); setStatus('')
    } catch (reason) { setStatus(reason.message) }
  }
  useEffect(() => { const q = new URLSearchParams(window.location.search).get('id'); if (q) { setListingId(q); setTimeout(() => { const v = q.trim().toUpperCase(); setStatus('loading'); api(`listings?listingId=${encodeURIComponent(v)}`).then((d) => { setResult(d.listing); setStatus('') }).catch((r) => setStatus(r.message)) }, 0) } }, [])
  const steps = [
    { key: 'pending_review', label: 'Under review', desc: 'Our team is reviewing your submission.' },
    { key: 'approved', label: 'Approved & live', desc: 'Your property is now published on HimBhumi.' },
  ]
  const statusMeta = (s) => s === 'approved' ? { text: 'Approved & Live', cls: 'bg-green-100 text-green-800' } : s === 'rejected' ? { text: 'Not approved', cls: 'bg-red-100 text-red-700' } : { text: 'Under review', cls: 'bg-amber-100 text-amber-800' }
  return <main className="min-h-screen bg-[#edf2ed] text-foreground">
    <div className="border-b border-border bg-[#edf2ed]"><div className="container mx-auto px-5 lg:px-10"><Header /><div className="relative flex min-h-[300px] items-end pb-12 pt-28"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">Track your submission</p><h1 className="mt-4 font-serif text-5xl tracking-tight sm:text-6xl">My <span className="italic text-teal-700">listing</span></h1><p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">Enter the listing ID you received after submitting your property to see its current status.</p></div></div></div></div>
    <div className="container mx-auto px-5 py-12 lg:px-10"><div className="mx-auto max-w-xl">
      <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row"><input value={listingId} onChange={(e) => setListingId(e.target.value)} placeholder="e.g. HB-A1B2C3" className={`${fieldClass} flex-1 uppercase`} /><button disabled={status === 'loading'} className="flex items-center justify-center gap-2 rounded-lg bg-teal-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60">{status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Compass size={16} />} Track</button></form>
      {status && status !== 'loading' && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{status}</p>}
      {result && <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex items-center gap-4 border-b border-border p-5">{result.image && <img src={result.image} alt="" className="h-16 w-24 rounded-lg object-cover" />}<div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-serif text-2xl">{result.title}</h2>{result.verified && <span className="flex items-center gap-1 rounded-full bg-[#dbe9e0] px-2 py-0.5 text-[10px] font-semibold text-teal-800"><BadgeCheck size={11} /> Verified</span>}{result.featured && <span className="flex items-center gap-1 rounded-full bg-[#c9a86a]/20 px-2 py-0.5 text-[10px] font-semibold text-[#8a6d33]"><Star size={11} /> Featured</span>}</div><p className="mt-1 text-xs text-muted-foreground">{result.listingId} · {result.category} · {result.listingType} · {[result.city, result.district].filter(Boolean).join(', ')}</p></div><span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusMeta(result.status).cls}`}>{statusMeta(result.status).text}</span></div>
        <div className="p-5">
          {result.status === 'rejected' ? <p className="text-sm leading-6 text-muted-foreground">Unfortunately this listing was not approved. Please review the details and feel free to submit again, or contact our team for help.</p>
          : <div className="space-y-4">{steps.map((step, index) => { const done = step.key === 'approved' ? result.status === 'approved' : true; const active = result.status === step.key; return <div key={step.key} className="flex gap-3"><div className="flex flex-col items-center"><span className={`flex h-7 w-7 items-center justify-center rounded-full ${done ? 'bg-teal-900 text-white' : 'border-2 border-border bg-white text-muted-foreground'}`}>{done ? <Check size={14} /> : index + 1}</span>{index < steps.length - 1 && <span className={`mt-1 h-8 w-px ${result.status === 'approved' ? 'bg-teal-900' : 'bg-border'}`} />}</div><div className="pb-2"><p className={`text-sm font-semibold ${active || done ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p><p className="mt-0.5 text-xs text-muted-foreground">{step.desc}</p></div></div> })}</div>}
          {result.status === 'approved' && result.propertyId && <a href={`/properties/${result.propertyId}`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-teal-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800">View live listing <ArrowRight size={15} /></a>}
        </div>
      </div>}
    </div></div>
    <Footer />
  </main>
}

// Views are exported by name and mounted by the real Next.js route files
// (app/page.js, app/properties/page.js, app/admin/page.js, ...) so that the
// server-rendered markup always matches what the client hydrates.
export { Home, Properties, Detail, Admin, ListProperty, Tracker, WebsiteChatbot }