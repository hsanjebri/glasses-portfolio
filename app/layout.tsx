import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import { Suspense } from 'react'

import { Footer } from '@/components/sections/Footer'
import { Nav } from '@/components/sections/Nav'
import { LensCursor } from '@/components/motion/LensCursor'
import { RouteAperture } from '@/components/motion/RouteAperture'
import { SmoothScroll } from '@/components/motion/SmoothScroll'
import { ThemeProvider } from '@/components/motion/ThemeProvider'
import { a11y } from '@/content/copy'
import { brandWord, site } from '@/content/site'
import { PRELOADER_SEEN_KEY } from '@/lib/motion'

import './globals.css'

const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument',
  display: 'swap',
  adjustFontFallback: true,
})

const sans = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${brandWord} — ${site.tagline}`,
    template: `%s — ${brandWord}`,
  },
  description: site.summary,
  applicationName: brandWord,
  keywords: [brandWord, 'opticien', 'lunettes', 'lunettes de soleil', 'La Marsa', 'Tunis', 'Ray-Ban', 'Persol'],
  authors: [{ name: brandWord }],
  openGraph: {
    type: 'website',
    siteName: brandWord,
    title: `${brandWord} — ${site.tagline}`,
    description: site.summary,
    url: site.url,
    locale: 'fr_TN',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${brandWord} — ${site.tagline}`,
    description: site.summary,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0A0A0A' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      data-theme="day"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Before first paint: skip the preloader on repeat visits in this session. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('${PRELOADER_SEEN_KEY}')==='1')document.documentElement.dataset.preloaded='1'}catch(e){}`,
          }}
        />
        <noscript>
          <style>{`[data-preloader]{display:none}.focus-hidden{opacity:1;filter:none;transform:none}.line-mask>span{transform:none}`}</style>
        </noscript>
      </head>
      <body>
        <a
          href="#main"
          className="sr-only-focusable label absolute left-4 top-4 z-[200] rounded-full bg-ink px-5 py-3 text-bg"
        >
          {a11y.skipToContent}
        </a>

        <ThemeProvider>
          <SmoothScroll>
            <LensCursor />
            <RouteAperture />
            <Nav />
            <main id="main" aria-label={a11y.mainLabel}>
              {children}
            </main>
            <Suspense>
              <Footer />
            </Suspense>
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  )
}
