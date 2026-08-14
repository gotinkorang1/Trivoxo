'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { Container } from '@/components/ui/container'
import { Button, ButtonLink } from '@/components/ui/button'

/**
 * Route-level error boundary for the public site. Catches render/runtime errors
 * within the (frontend) layout while keeping the header and footer, and reports
 * them to Sentry. The root global-error.tsx remains the last-resort fallback.
 */
export default function FrontendError({
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
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-link">
        Something went wrong
      </p>
      <h1 className="mt-3 max-w-xl font-display text-3xl font-semibold sm:text-4xl">
        We hit a snag loading this page
      </h1>
      <p className="mt-4 max-w-md text-text-secondary">
        The problem has been recorded. Try again, or head back to the homepage if it keeps
        happening.
      </p>
      {error.digest ? (
        <p className="mt-3 text-xs text-text-muted">Support reference: {error.digest}</p>
      ) : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="outline">
          Return home
        </ButtonLink>
      </div>
    </Container>
  )
}
