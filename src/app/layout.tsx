import type { Metadata, Viewport } from 'next'
import { Caveat, Cormorant_Garamond, JetBrains_Mono, Poppins } from 'next/font/google'

import { RootWrapper } from '@/components/layout/root-wrapper'
import { ThemeScript } from '@/components/theme/theme-script'
import { siteConfig } from '@/lib/seo'

import '../index.css'

// Corps de texte — Poppins, lisible et chaleureux
const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

// Titres manuscrits — Caveat (signature handwriting d'ARTI)
const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

// Serif — pour le logo ARTI (capitales fines)
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['300', '400', '500'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      { url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: siteConfig.twitterHandle,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  // Les icônes (favicon, apple-touch-icon) sont générées automatiquement par
  // Next.js à partir de src/app/icon.png, apple-icon.png et favicon.ico (logo ARTI).
  alternates: {
    canonical: '/',
  },
}

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="fr"
      dir="ltr"
      className={`${poppins.variable} ${caveat.variable} ${cormorant.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-dvh flex-col">
        <RootWrapper>{children}</RootWrapper>
      </body>
    </html>
  )
}
