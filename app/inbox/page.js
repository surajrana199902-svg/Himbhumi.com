import InboxWorkspace from '../../components/inbox-workspace'
import { SiteFooter, SiteHeader } from '../../components/site-navigation'

export const metadata = {
  title: 'Inbox | HimBhumi Real Estates',
  description: 'Message HimBhumi administrators, approved agents, and verified users.',
}

export default function InboxPage() {
  return <div className="min-h-screen bg-[#f5f7f4] text-foreground">
    <div className="relative h-24 border-b border-border bg-[#edf2ed]"><SiteHeader /></div>
    <main className="px-5 py-10 sm:py-14"><div className="mx-auto max-w-6xl"><InboxWorkspace /></div></main>
    <SiteFooter />
  </div>
}
