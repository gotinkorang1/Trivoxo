import type { Metadata } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import Script from 'next/script'
import React from 'react'
import { SpeedInsights } from '@vercel/speed-insights/next'
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
  icons: {
    icon: [{ url: FAVICON.light, type: 'image/png' }],
    shortcut: FAVICON.light,
    apple: FAVICON.light,
  },
  alternates: { canonical: './' },
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
      </body>
    </html>
  )
}
