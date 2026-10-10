'use client'

import { useEffect, useMemo, useState } from 'react'
import { Download, Mail, MessageSquareText, Phone, RefreshCw, Search } from 'lucide-react'

const STAGES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'viewing_scheduled', label: 'Viewing scheduled' },
  { value: 'offer_made', label: 'Offer made' },
  { value: 'closed', label: 'Closed' },
  { value: 'lost', label: 'Lost' },
]

const CLOSED_STAGES = new Set(['closed', 'lost'])

function localDateValue(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function displayDate(value) {
  if (!value) return 'Not set'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Not set' : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(date)
}

function csvValue(value) {
  const safe = String(value ?? '').replace(/^[\t\r ]*[=+\-@]/, "'$&")
  return `"${safe.replace(/"/g, '""')}"`
}

function exportLeads(leads) {
  const columns = [
    ['Name', (lead) => lead.fullName],
    ['Email', (lead) => lead.email],
    ['Phone', (lead) => lead.mobile],
    ['Property', (lead) => lead.propertyTitle || lead.propertyId],
    ['Stage', (lead) => STAGES.find((stage) => stage.value === lead.status)?.label || lead.status || 'New'],
    ['Intent', (lead) => lead.intent],
    ['Follow-up', (lead) => lead.followUpAt],
    ['Internal notes', (lead) => lead.notes],
    ['Enquiry', (lead) => lead.message],
    ['Received', (lead) => lead.createdAt],
  ]
  const csv = [
    columns.map(([label]) => csvValue(label)).join(','),
    ...leads.map((lead) => columns.map(([, value]) => csvValue(value(lead))).join(',')),
  ].join('\r\n')
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `himbhumi-leads-${localDateValue(new Date())}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default function AdminCrm({ inquiries, onUpdate, onMessage, onRefresh, refreshing = false }) {
  const [query, setQuery] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')
  const [noteDrafts, setNoteDrafts] = useState({})
  const [followUpDrafts, setFollowUpDrafts] = useState({})
  const [savingIds, setSavingIds] = useState({})
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    setNoteDrafts((current) => {
      const next = { ...current }
      for (const lead of inquiries) {
        if (!Object.prototype.hasOwnProperty.call(next, lead.id)) next[lead.id] = lead.notes || ''
      }
      return next
    })
    setFollowUpDrafts((current) => {
      const next = { ...current }
      for (const lead of inquiries) {
        if (!Object.prototype.hasOwnProperty.call(next, lead.id)) next[lead.id] = localDateValue(lead.followUpAt)
      }
      return next
    })
  }, [inquiries])

  const today = localDateValue(new Date())
  const newCount = inquiries.filter((lead) => (lead.status || 'new') === 'new').length
  const openLeads = inquiries.filter((lead) => !CLOSED_STAGES.has(lead.status))
  const dueCount = openLeads.filter((lead) => {
    const followUp = localDateValue(lead.followUpAt)
    return followUp && followUp <= today
  }).length
  const closedCount = inquiries.filter((lead) => lead.status === 'closed').length
  const qualifiedCount = inquiries.filter((lead) => ['qualified', 'viewing_scheduled', 'offer_made', 'closed'].includes(lead.status)).length
  const conversionRate = inquiries.length ? Math.round((closedCount / inquiries.length) * 100) : 0

  const visibleLeads = useMemo(() => {
    const term = query.trim().toLocaleLowerCase()
    return inquiries
      .filter((lead) => {
        const matchesStage = stageFilter === 'all' || (lead.status || 'new') === stageFilter
        const matchesQuery = !term || [
          lead.fullName, lead.email, lead.mobile, lead.propertyTitle, lead.propertyId, lead.message, lead.notes,
        ].some((value) => String(value || '').toLocaleLowerCase().includes(term))
        return matchesStage && matchesQuery
      })
      .sort((first, second) => {
        const firstDate = new Date(first.createdAt || 0).getTime()
        const secondDate = new Date(second.createdAt || 0).getTime()
        return sortOrder === 'oldest' ? firstDate - secondDate : secondDate - firstDate
      })
  }, [inquiries, query, sortOrder, stageFilter])

  const saveLead = async (lead, updates) => {
    setSavingIds((current) => ({ ...current, [lead.id]: true }))
    setError('')
    setNotice('')
    try {
      await onUpdate(lead.id, updates)
      if (Object.prototype.hasOwnProperty.call(updates, 'notes')) {
        setNoteDrafts((current) => ({ ...current, [lead.id]: updates.notes }))
      }
      if (Object.prototype.hasOwnProperty.call(updates, 'followUpAt')) {
        setFollowUpDrafts((current) => ({ ...current, [lead.id]: localDateValue(updates.followUpAt) }))
      }
      setNotice('Lead updated.')
    } catch (reason) {
      setError(reason.message || 'Could not update this lead.')
    } finally {
      setSavingIds((current) => ({ ...current, [lead.id]: false }))
    }
  }

  const stageLabel = (status) => STAGES.find((stage) => stage.value === status)?.label || status || 'New'
  const badgeClass = (status) => status === 'new'
    ? 'bg-amber-100 text-amber-900'
    : CLOSED_STAGES.has(status)
      ? 'bg-slate-100 text-slate-700'
      : status === 'offer_made'
        ? 'bg-violet-100 text-violet-800'
        : 'bg-teal-100 text-teal-900'

  return (
    <section aria-labelledby="crm-heading" className="scroll-mt-6 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Customer relationship management</p>
          <h2 id="crm-heading" className="mt-2 font-serif text-3xl">Lead pipeline</h2>
          <p className="mt-1 text-sm text-muted-foreground">Track enquiry progress, capture private context, and plan the next follow-up.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => exportLeads(visibleLeads)} disabled={!visibleLeads.length} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-teal-900 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50">
            <Download size={15} aria-hidden="true" /> Export filtered leads
          </button>
          <button type="button" onClick={onRefresh} disabled={refreshing} aria-busy={refreshing} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-teal-900 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60">
            <RefreshCw size={15} aria-hidden="true" className={refreshing ? 'animate-spin motion-reduce:animate-none' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh CRM'}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-[#f5f7f4] p-4"><p className="text-xs font-medium text-muted-foreground">Total enquiries</p><p className="mt-2 font-serif text-3xl">{inquiries.length}</p></div>
        <div className="rounded-xl bg-amber-50 p-4"><p className="text-xs font-medium text-amber-900">New leads</p><p className="mt-2 font-serif text-3xl text-amber-950">{newCount}</p></div>
        <div className={`rounded-xl p-4 ${dueCount ? 'bg-red-50' : 'bg-[#f5f7f4]'}`}><p className={`text-xs font-medium ${dueCount ? 'text-red-800' : 'text-muted-foreground'}`}>Follow-ups due</p><p className={`mt-2 font-serif text-3xl ${dueCount ? 'text-red-900' : ''}`}>{dueCount}</p></div>
        <div className="rounded-xl bg-teal-50 p-4"><p className="text-xs font-medium text-teal-900">Qualified · {conversionRate}% closed</p><p className="mt-2 font-serif text-3xl text-teal-950">{qualifiedCount}</p></div>
      </div>

      {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" aria-live="polite" className="mt-5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">{notice}</p>}

      <div className="mt-6 grid gap-3 md:grid-cols-[minmax(220px,1fr)_auto_auto]">
        <label className="relative block">
          <span className="sr-only">Search leads</span>
          <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, phone, email, property…" className="min-h-11 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-800/10" />
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="sr-only">Filter leads by stage</span>
          <select value={stageFilter} onChange={(event) => setStageFilter(event.target.value)} className="min-h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-slate-800 md:w-52">
            <option value="all">All stages ({inquiries.length})</option>
            {STAGES.map((stage) => <option key={stage.value} value={stage.value}>{stage.label} ({inquiries.filter((lead) => (lead.status || 'new') === stage.value).length})</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="sr-only">Sort leads</span>
          <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="min-h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-slate-800 md:w-40">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2" aria-label="Lead pipeline stages">
        <button type="button" onClick={() => setStageFilter('all')} aria-pressed={stageFilter === 'all'} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${stageFilter === 'all' ? 'border-teal-900 bg-teal-900 text-white' : 'border-border text-slate-700 hover:bg-teal-50'}`}>All · {inquiries.length}</button>
        {STAGES.map((stage) => {
          const count = inquiries.filter((lead) => (lead.status || 'new') === stage.value).length
          return <button key={stage.value} type="button" onClick={() => setStageFilter(stage.value)} aria-pressed={stageFilter === stage.value} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${stageFilter === stage.value ? 'border-teal-900 bg-teal-900 text-white' : 'border-border text-slate-700 hover:bg-teal-50'}`}>{stage.label} · {count}</button>
        })}
      </div>

      <div className="mt-3 space-y-4">
        {visibleLeads.map((lead) => {
          const status = lead.status || 'new'
          const followUp = followUpDrafts[lead.id] ?? localDateValue(lead.followUpAt)
          const isDue = followUp && followUp <= today && !CLOSED_STAGES.has(status)
          const isSaving = !!savingIds[lead.id]
          return (
            <article key={lead.id} className={`rounded-xl border p-4 sm:p-5 ${isDue ? 'border-red-200 bg-red-50/40' : 'border-border bg-white'}`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-950">{lead.fullName || 'Unknown contact'}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass(status)}`}>{stageLabel(status)}</span>
                    {isDue && <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">Follow-up due</span>}
                  </div>
                  <p className="mt-1 text-sm text-teal-900">{lead.propertyTitle || (lead.propertyId ? `Property ${lead.propertyId}` : 'General enquiry')}</p>
                  {lead.message && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{lead.message}</p>}
                  <p className="mt-2 text-xs text-muted-foreground">Received {displayDate(lead.createdAt)}{lead.intent ? ` · ${lead.intent}` : ''}</p>
                </div>
                <label className="flex shrink-0 flex-col gap-1 text-xs font-medium text-slate-700 lg:w-52">
                  Pipeline stage
                  <select value={STAGES.some((stage) => stage.value === status) ? status : 'new'} onChange={(event) => saveLead(lead, { status: event.target.value })} disabled={isSaving} className="min-h-10 rounded-lg border border-border bg-white px-3 text-sm">
                    {!STAGES.some((stage) => stage.value === status) && <option value="new">{status}</option>}
                    {STAGES.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}
                  </select>
                </label>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {lead.mobile && <a href={`tel:${String(lead.mobile).replace(/[^\d+*#]/g, '')}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"><Phone size={15} aria-hidden="true" /> Call</a>}
                {lead.email && <a href={`mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent(`Re: ${lead.propertyTitle || 'Your HimBhumi enquiry'}`)}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"><Mail size={15} aria-hidden="true" /> Email</a>}
                {lead.email && <button type="button" onClick={() => onMessage(lead)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-teal-900 px-3 text-sm font-semibold text-white transition hover:bg-teal-800"><MessageSquareText size={15} aria-hidden="true" /> Compose message</button>}
                {!lead.mobile && !lead.email && <p className="text-sm text-muted-foreground">No phone or email was provided for this enquiry.</p>}
              </div>

              <div className="mt-4 grid gap-4 border-t border-border pt-4 md:grid-cols-[minmax(220px,0.7fr)_minmax(260px,1.3fr)]">
                <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-700">
                  Next follow-up
                  <input type="date" value={followUp} onChange={(event) => setFollowUpDrafts((current) => ({ ...current, [lead.id]: event.target.value }))} className="min-h-10 rounded-lg border border-border bg-white px-3 text-sm" />
                  <span className={`text-xs font-normal ${isDue ? 'text-red-800' : 'text-muted-foreground'}`}>{followUp ? `${isDue ? 'Due' : 'Scheduled'} ${displayDate(followUp)}` : 'No follow-up scheduled'}</span>
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-700">
                  Private CRM notes
                  <textarea rows="2" maxLength={2000} value={noteDrafts[lead.id] ?? lead.notes ?? ''} onChange={(event) => setNoteDrafts((current) => ({ ...current, [lead.id]: event.target.value }))} placeholder="Add qualification notes, viewing preferences, or next steps…" className="w-full resize-y rounded-lg border border-border bg-white px-3 py-2.5 text-sm font-normal outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-800/10" />
                </label>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">Notes are visible only to administrators.</p>
                <button type="button" onClick={() => saveLead(lead, { notes: noteDrafts[lead.id] ?? '', followUpAt: followUp || '' })} disabled={isSaving} className="min-h-10 rounded-lg border border-teal-900 px-4 text-sm font-semibold text-teal-900 transition hover:bg-teal-50 disabled:cursor-wait disabled:opacity-50">{isSaving ? 'Saving…' : 'Save CRM details'}</button>
              </div>
            </article>
          )
        })}
        {!visibleLeads.length && <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center"><p className="font-serif text-xl">{inquiries.length ? 'No leads match these filters' : 'No enquiries yet'}</p><p className="mt-2 text-sm text-muted-foreground">{inquiries.length ? 'Clear the search or choose another pipeline stage.' : 'New property enquiries will appear here for your team to manage.'}</p></div>}
      </div>
    </section>
  )
}
