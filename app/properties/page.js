import { Suspense } from 'react'
import { Properties, WebsiteChatbot } from '../_views'

export const metadata = {
  title: 'Properties | HimBhumi Real Estates',
  description: 'Browse curated homes, land, and property listings across North India.',
}

export default function PropertiesPage() {
  return <><Suspense fallback={<main className="min-h-screen bg-background" />}><Properties /></Suspense><WebsiteChatbot /></>
}
