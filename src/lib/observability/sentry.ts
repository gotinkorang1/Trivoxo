import type { Event } from '@sentry/nextjs'

const PRIVATE_REQUEST_HEADERS = new Set([
  'authorization',
  'cookie',
  'proxy-authorization',
  'set-cookie',
  'x-api-key',
])

/** Remove request data that could contain booking or payment details. */
export function sanitizeSentryEvent<T extends Event>(event: T): T {
  if (!event.request) return event

  event.request.cookies = undefined
  event.request.data = undefined

  if (event.request.url) {
    event.request.url = event.request.url.split(/[?#]/, 1)[0]
  }

  if (event.request.headers) {
    event.request.headers = Object.fromEntries(
      Object.entries(event.request.headers).filter(
        ([name]) => !PRIVATE_REQUEST_HEADERS.has(name.toLowerCase()),
      ),
    )
  }

  return event
}
