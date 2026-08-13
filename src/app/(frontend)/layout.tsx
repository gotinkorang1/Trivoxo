import type { Metadata, Viewport } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import Script from 'next/script'
import React from 'react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import { AnalyticsConsent } from '@/components/analytics/analytics-consent'
import { Header } from '@/components/site/header'
import { Footer } from '@/components/site/footer'
import { ThemeFavicon } from '@/components/site/theme-favicon'
import { JsonLd, organizationSchema } from '@/components/seo/structured-data'
import { BRAND } from '@/lib/constants'
import { FAVICON, THEME_STORAGE_KEY } from '@/lib/theme'
import './globals.css'

const themeScript = `
  (function () {
    try {
      var saved = localStorage.getItem('${THEME_STORAGE_KEY}');
      var theme = saved === 'light' || saved === 'dark'
        ? saved
        : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
      var favicon = theme === 'dark' ? '${FAVICON.dark}' : '${FAVICON.light}';
      var links = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
      if (links.length === 0) {
        var link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = favicon;
        document.head.appendChild(link);
      } else {
        links.forEach(function (link) {
          link.removeAttribute('media');
          link.href = favicon;
        });
      }
    } catch (_) {}
  })();
`

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  title: {
    default: `${BRAND.name} — ${BRAND.headline}`,
    template: `%s — ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: FAVICON.light, type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: FAVICON.light,
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  alternates: { canonical: './' },
  formatDetection: { telephone: true, address: false, email: false },
  // Search Console (Google) + Bing Webmaster Tools — set the codes as env vars.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION }
      : {},
  },
  openGraph: {
    title: `${BRAND.name} — ${BRAND.headline}`,
    description: BRAND.description,
    type: 'website',
    siteName: BRAND.name,
    locale: 'en_GH',
    url: './',
    images: [
      {
        url: '/og',
        width: 1200,
        height: 630,
        alt: `${BRAND.name} — ${BRAND.headline}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name} — ${BRAND.headline}`,
    description: BRAND.description,
    images: ['/og'],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f6f8' },
    { media: '(prefers-color-scheme: dark)', color: '#0e1a27' },
  ],
  colorScheme: 'light dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-text-primary antialiased">
        <Script id="trivoxo-theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <ThemeFavicon />
        <a
          href="#main-content"
          className="fixed left-4 top-3 z-[100] -translate-y-24 rounded-full bg-brand-secondary px-5 py-3 font-bold text-brand-navy shadow-lg transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <JsonLd data={organizationSchema()} />
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <AnalyticsConsent />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
