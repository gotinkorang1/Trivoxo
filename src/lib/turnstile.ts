import { randomUUID } from 'node:crypto'

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const TOKEN_FIELD = 'cf-turnstile-response'

export const TURNSTILE_ACTIONS = [
  'booking_create',
  'corporate_enquiry',
  'custom_trip',
  'event_order',
  'newsletter_subscribe',
  'service_request',
  'trip_lookup',
] as const

export type TurnstileAction = (typeof TURNSTILE_ACTIONS)[number]

type HeadersLike = Pick<Headers, 'get'>
type FetchLike = typeof fetch

type SiteverifyResponse = {
  success?: boolean
  hostname?: string
  action?: string
  'error-codes'?: string[]
}

export type TurnstileVerification = {
  success: boolean
  error?: string
  bypassed?: boolean
}

function isProduction(): boolean {
  return process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production'
}

function requestIP(headers: HeadersLike): string | undefined {
  return (
    headers.get('cf-connecting-ip')?.trim() ||
    headers.get('x-real-ip')?.trim() ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    undefined
  )
}

function allowedHostnames(headers: HeadersLike): Set<string> {
  const values = new Set<string>()
  const requestHost = headers.get('host')?.split(':')[0]?.trim().toLowerCase()
  if (requestHost) values.add(requestHost)

  const configuredURL = process.env.NEXT_PUBLIC_SERVER_URL
  if (configuredURL) {
    try {
      values.add(new URL(configuredURL).hostname.toLowerCase())
    } catch {
      // Configuration is reported by the verification failure below.
    }
  }
  return values
}

/**
 * Verify a single-use Cloudflare Turnstile token for a public mutation.
 * Production fails closed when configuration, Cloudflare, action, or hostname
 * validation is unavailable. Local development and tests may run without keys.
 */
export async function verifyTurnstile(
  formData: FormData,
  expectedAction: TurnstileAction,
  headers: HeadersLike,
  options: { fetch?: FetchLike } = {},
): Promise<TurnstileVerification> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim()
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()

  if (!secret && !siteKey && !isProduction()) {
    return { success: true, bypassed: true }
  }
  if (!secret || !siteKey) {
    console.error('Turnstile is not fully configured for this environment.')
    return {
      success: false,
      error: 'Security verification is temporarily unavailable. Please try again shortly.',
    }
  }

  const token = String(formData.get(TOKEN_FIELD) ?? '').trim()
  if (!token) {
    return { success: false, error: 'Complete the security check before continuing.' }
  }

  const body = new URLSearchParams({
    secret,
    response: token,
    idempotency_key: randomUUID(),
  })
  const remoteIP = requestIP(headers)
  if (remoteIP) body.set('remoteip', remoteIP)

  let result: SiteverifyResponse
  try {
    const response = await (options.fetch ?? fetch)(SITEVERIFY_URL, {
      method: 'POST',
      body,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(7_000),
      cache: 'no-store',
    })
    if (!response.ok) throw new Error(`Cloudflare returned HTTP ${response.status}.`)
    result = (await response.json()) as SiteverifyResponse
  } catch (error) {
    console.error(
      'Turnstile verification request failed.',
      error instanceof Error ? error.message : 'Unknown verification error.',
    )
    return {
      success: false,
      error: 'Security verification could not be completed. Please try again.',
    }
  }

  if (!result.success) {
    console.warn('Turnstile rejected a public form.', {
      action: expectedAction,
      errorCodes: result['error-codes'] ?? [],
    })
    return {
      success: false,
      error: 'The security check expired or was not accepted. Please try it again.',
    }
  }
  if (result.action !== expectedAction) {
    console.warn('Turnstile action mismatch.', { expectedAction, receivedAction: result.action })
    return { success: false, error: 'Security verification did not match this request.' }
  }

  const expectedHosts = allowedHostnames(headers)
  const receivedHost = result.hostname?.toLowerCase()
  if (!receivedHost || expectedHosts.size === 0 || !expectedHosts.has(receivedHost)) {
    console.warn('Turnstile hostname mismatch.', {
      receivedHost,
      expectedHosts: [...expectedHosts],
    })
    return { success: false, error: 'Security verification did not match this website.' }
  }

  return { success: true }
}
