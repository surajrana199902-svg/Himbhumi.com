import { Suspense } from 'react'
import { Properties, WebsiteChatbot } from '../../_views'

function locationTitle(slug = []) {
  return slug.at(-1)
    ?.split('-')
    .map((word) => word.charAt(0).toLocaleUpperCase() + word.slice(1))
    .join(' ') || 'Himachal Pradesh'
}

export async function generateMetadata({ params }) {
  const { slug = [] } = await params
  const name = locationTitle(slug)
  return {
    title: `${name} Properties | HimBhumi Real Estates`,
    description: `Browse homes, land, and property listings in ${name} and nearby areas across North India.`,
    alternates: { canonical: `/locations/${slug.join('/')}` },
  }
}

export default async function LocationPage({ params }) {
  const { slug = [] } = await params
  return <><Suspense fallback={<main className="min-h-screen bg-background" />}><Properties initialLocation={slug.join('/')} /></Suspense><WebsiteChatbot /></>
}
