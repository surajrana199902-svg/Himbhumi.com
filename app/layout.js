import './globals.css'

const LOGO = 'https://customer-assets-m6fa6gv7.emergentagent.net/job_himalayan-estates-1/artifacts/eidamywr_HImmm.jpeg'

export const metadata = {
  title: 'HimBhumi | Premium Properties in Himachal Pradesh',
  description: 'Discover premium properties across Himachal Pradesh with HimBhumi Real Estates.',
  metadataBase: new URL('https://himbhumi.com'),
  applicationName: 'himbhumi.com',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'HimBhumi | Premium Properties in Himachal Pradesh',
    description: 'Discover premium properties across Himachal Pradesh with HimBhumi Real Estates.',
    url: 'https://himbhumi.com',
    siteName: 'himbhumi.com',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HimBhumi | Premium Properties in Himachal Pradesh',
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
      <body>{children}</body>
    </html>
  )
}

export default RootLayout