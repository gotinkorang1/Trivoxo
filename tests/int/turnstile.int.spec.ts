import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { verifyTurnstile } from '@/lib/turnstile'

const originalSecret = process.env.TURNSTILE_SECRET_KEY
const originalSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const originalServerURL = process.env.NEXT_PUBLIC_SERVER_URL

const requestHeaders = new Headers({
  host: 'trivoxogh.com',
  'x-forwarded-for': '203.0.113.10, 10.0.0.1',
})

function form(token = 'turnstile-token') {
  const value = new FormData()
  value.set('cf-turnstile-response', token)
  return value
}

describe('Cloudflare Turnstile verification', () => {
  beforeEach(() => {
    process.env.TURNSTILE_SECRET_KEY = 'test-secret'
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'test-site-key'
    process.env.NEXT_PUBLIC_SERVER_URL = 'https://trivoxogh.com'
  })

  afterEach(() => {
    process.env.TURNSTILE_SECRET_KEY = originalSecret
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = originalSiteKey
    process.env.NEXT_PUBLIC_SERVER_URL = originalServerURL
  })

  it('accepts a successful token only for the expected action and hostname', async () => {
    let submitted = ''
    const result = await verifyTurnstile(form(), 'booking_create', requestHeaders, {
      fetch: async (_input, init) => {
        submitted = String(init?.body)
        return Response.json({
          success: true,
          action: 'booking_create',
          hostname: 'trivoxogh.com',
        })
      },
    })

    expect(result).toEqual({ success: true })
    expect(submitted).toContain('response=turnstile-token')
    expect(submitted).toContain('remoteip=203.0.113.10')
    expect(submitted).toContain('idempotency_key=')
  })

  it('rejects missing, failed, mismatched-action, and mismatched-host tokens', async () => {
    expect((await verifyTurnstile(form(''), 'booking_create', requestHeaders)).success).toBe(false)

    const responses = [
      { success: false, 'error-codes': ['timeout-or-duplicate'] },
      { success: true, action: 'trip_lookup', hostname: 'trivoxogh.com' },
      { success: true, action: 'booking_create', hostname: 'attacker.example' },
    ]
    for (const response of responses) {
      const result = await verifyTurnstile(form(), 'booking_create', requestHeaders, {
        fetch: async () => Response.json(response),
      })
      expect(result.success).toBe(false)
    }
  })
})
