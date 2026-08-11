'use client'

import * as Sentry from '@sentry/nextjs'
import Link from 'next/link'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body className="grid min-h-dvh place-items-center bg-background p-6 text-text-primary antialiased">
        <main className="w-full max-w-xl rounded-3xl border border-border bg-surface-elevated p-8 text-center shadow-2xl sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-link">
            Trivoxo support
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Something went wrong</h1>
          <p className="mt-4 leading-7 text-text-secondary">
            We have recorded the problem. Please try again, or return to the homepage if it
            continues.
          </p>
          {error.digest ? (
            <p className="mt-3 text-xs text-text-muted">Support reference: {error.digest}</p>
          ) : null}
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              className="min-h-12 rounded-full bg-brand-primary px-6 font-bold text-brand-navy transition hover:-translate-y-0.5 hover:bg-brand-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              onClick={reset}
            >
              Try again
            </button>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-border-strong px-6 font-bold text-text-primary transition hover:border-brand-primary hover:text-brand-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              href="/"
            >
              Return home
            </Link>
          </div>
        </main>
      </body>
    </html>
  )
}
