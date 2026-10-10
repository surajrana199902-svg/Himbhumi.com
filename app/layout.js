import './globals.css'
import 'leaflet/dist/leaflet.css'
import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'], style: ['normal', 'italic'], display: 'swap', variable: '--font-playfair' })

const LOGO = 'https://customer-assets-m6fa6gv7.emergentagent.net/job_himalayan-estates-1/artifacts/eidamywr_HImmm.jpeg'

export const metadata = {
  title: 'HimBhumi | Premium Properties Across India',
  description: 'Discover premium properties across Himachal Pradesh, Punjab, Uttarakhand, Haryana, and Chandigarh with HimBhumi Real Estates.',
  metadataBase: new URL('https://himbhumi.com'),
  applicationName: 'himbhumi.com',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'HimBhumi | Premium Properties Across India',
    description: 'Discover premium properties across India with HimBhumi Real Estates.',
    url: 'https://himbhumi.com',
    siteName: 'himbhumi.com',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HimBhumi | Premium Properties Across India',
    description: 'Discover premium properties across Himachal Pradesh with HimBhumi Real Estates.',
  },
  icons: {
    icon: LOGO,
    shortcut: LOGO,
    apple: LOGO,
  },
}

function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={playfair.variable}>{children}</body>
    </html>
  )
}

export default RootLayout