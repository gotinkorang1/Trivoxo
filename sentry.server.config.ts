import * as Sentry from '@sentry/nextjs'
import { sanitizeSentryEvent } from './src/lib/observability/sentry'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
const environment = process.env.VERCEL_ENV || process.env.NODE_ENV

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment,
  sendDefaultPii: false,
  tracesSampleRate: environment === 'production' ? 0.1 : 0.02,
  beforeSend: sanitizeSentryEvent,
})
