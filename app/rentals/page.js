import { Suspense } from 'react'
import { Properties, WebsiteChatbot } from '../_views'

export const metadata = {
  title: 'Rental Properties | HimBhumi Real Estates',
  description: 'Find houses, flats, apartments, villas, studios, and commercial properties for rent across India.',
}

export default function RentalsPage() {
  return <><Suspense fallback={<main className="min-h-screen bg-background" />}><Properties initialListingType="For rent" /></Suspense><WebsiteChatbot /></>
}
