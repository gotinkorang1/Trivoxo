import type { Metadata } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import Script from 'next/script'
import React from 'react'
import { AnalyticsConsent } from '@/components/analytics/analytics-consent'
import { Header } from '@/components/site/header'
import { Footer } from '@/components/site/footer'
import { JsonLd, organizationSchema } from '@/components/seo/structured-data'
import { BRAND } from '@/lib/constants'
import './globals.css'

const themeScript = `
  (function () {
    try {
      var saved = localStorage.getItem('trivoxo-theme');
      var theme = saved === 'light' || saved === 'dark'
        ? saved
        : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
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
  openGraph: {
    title: `${BRAND.name} — ${BRAND.headline}`,
    description: BRAND.description,
    type: 'website',
    siteName: BRAND.name,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-text-primary antialiased">
        <Script id="trivoxo-theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
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
      </body>
    </html>
  )
}
