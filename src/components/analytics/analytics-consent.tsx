'use client'

import { GoogleAnalytics } from '@next/third-parties/google'
import Link from 'next/link'
import { useSyncExternalStore } from 'react'

const ANALYTICS_CONSENT_KEY = 'trivoxo-analytics-consent'
const ANALYTICS_CONSENT_EVENT = 'trivoxo:analytics-consent'

type AnalyticsConsentChoice = 'granted' | 'denied'
type AnalyticsConsentState = AnalyticsConsentChoice | 'pending' | null

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID
const posthogProjectToken =
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || process.env.NEXT_PUBLIC_POSTHOG_KEY
const analyticsConfigured = Boolean(gaMeasurementId || posthogProjectToken)

function getConsentSnapshot(): AnalyticsConsentState {
  const storedChoice = window.localStorage.getItem(ANALYTICS_CONSENT_KEY)
  return storedChoice === 'granted' || storedChoice === 'denied' ? storedChoice : 'pending'
}

function subscribeToConsent(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange)
  window.addEventListener(ANALYTICS_CONSENT_EVENT, onStoreChange)

  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener(ANALYTICS_CONSENT_EVENT, onStoreChange)
  }
}

export function AnalyticsConsent() {
  const consent = useSyncExternalStore(subscribeToConsent, getConsentSnapshot, () => null)

  if (!analyticsConfigured) return null

  const saveChoice = (choice: AnalyticsConsentChoice) => {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, choice)
    window.dispatchEvent(
      new CustomEvent(ANALYTICS_CONSENT_EVENT, {
        detail: choice,
      }),
    )
  }

  return (
    <>
      {consent === 'granted' && gaMeasurementId ? <GoogleAnalytics gaId={gaMeasurementId} /> : null}

      {consent === 'pending' ? (
        <aside
          aria-label="Analytics privacy choices"
          aria-live="polite"
          className="fixed inset-x-3 bottom-3 z-[110] mx-auto max-w-3xl rounded-3xl border border-border bg-surface-elevated/95 p-4 text-text-primary shadow-2xl backdrop-blur-xl sm:inset-x-6 sm:bottom-6 sm:p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="font-bold">Help us improve your Trivoxo experience</p>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                With your permission, privacy-conscious analytics help us improve tour discovery and
                booking journeys. We do not enable session recordings. Read our{' '}
                <Link
                  className="font-semibold text-brand-link underline-offset-4 hover:underline"
                  href="/privacy-policy"
                >
                  privacy policy
                </Link>
                .
              </p>
            </div>
            <div className="flex shrink-0 flex-col-reverse gap-2 min-[420px]:flex-row">
              <button
                type="button"
                className="min-h-11 rounded-full border border-border-strong px-5 text-sm font-bold text-text-primary transition hover:border-brand-primary hover:text-brand-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                onClick={() => saveChoice('denied')}
              >
                Essential only
              </button>
              <button
                type="button"
                className="min-h-11 rounded-full bg-brand-primary px-5 text-sm font-bold text-brand-navy shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                onClick={() => saveChoice('granted')}
              >
                Allow analytics
              </button>
            </div>
          </div>
        </aside>
      ) : null}
    </>
  )
}
