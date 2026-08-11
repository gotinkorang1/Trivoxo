import * as Sentry from '@sentry/nextjs'
import posthog from 'posthog-js'
import { sanitizeSentryEvent } from '@/lib/observability/sentry'

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN
const sentryEnvironment = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    enabled: true,
    environment: sentryEnvironment,
    sendDefaultPii: false,
    tracesSampleRate: sentryEnvironment === 'production' ? 0.1 : 0.02,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    beforeSend: sanitizeSentryEvent,
  })
}

const ANALYTICS_CONSENT_KEY = 'trivoxo-analytics-consent'
const ANALYTICS_CONSENT_EVENT = 'trivoxo:analytics-consent'
const posthogProjectToken =
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || process.env.NEXT_PUBLIC_POSTHOG_KEY
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com'
let posthogInitialized = false

function initializePostHog() {
  if (!posthogProjectToken || posthogInitialized) return

  posthog.init(posthogProjectToken, {
    api_host: posthogHost,
    defaults: '2026-05-30',
    autocapture: false,
    capture_pageview: 'history_change',
    capture_pageleave: true,
    disable_session_recording: true,
    disable_surveys: true,
    disable_web_experiments: true,
    person_profiles: 'identified_only',
    persistence: 'localStorage',
    respect_dnt: true,
  })

  posthogInitialized = true
}

if (window.localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'granted') {
  initializePostHog()
} else {
  window.addEventListener(
    ANALYTICS_CONSENT_EVENT,
    (event) => {
      if (event instanceof CustomEvent && event.detail === 'granted') {
        initializePostHog()
      }
    },
    { once: true },
  )
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
