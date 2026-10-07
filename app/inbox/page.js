import InboxWorkspace from '../../components/inbox-workspace'

export const metadata = {
  title: 'Inbox | HimBhumi Real Estates',
  description: 'Message HimBhumi administrators, approved agents, and verified users.',
}

export default function InboxPage() {
  return <main className="min-h-screen bg-[#f5f7f4] px-5 py-10 text-foreground sm:py-14"><div className="mx-auto max-w-6xl"><InboxWorkspace /></div></main>
}
