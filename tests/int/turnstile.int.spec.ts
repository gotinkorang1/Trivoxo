import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { verifyTurnstile } from '@/lib/turnstile'

const originalSecret = process.env.TURNSTILE_SECRET_KEY
const originalSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const originalServerURL = process.env.NEXT_PUBLIC_SERVER_URL
const originalVercelEnv = process.env.VERCEL_ENV

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
    delete process.env.VERCEL_ENV
  })

  afterEach(() => {
    process.env.TURNSTILE_SECRET_KEY = originalSecret
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = originalSiteKey
    process.env.NEXT_PUBLIC_SERVER_URL = originalServerURL
    process.env.VERCEL_ENV = originalVercelEnv
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

  it('accepts Cloudflare official always-pass keys only outside production', async () => {
    process.env.TURNSTILE_SECRET_KEY = '1x0000000000000000000000000000000AA'
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = '1x00000000000000000000AA'
    process.env.VERCEL_ENV = 'preview'

    const stagingResult = await verifyTurnstile(form(), 'booking_create', requestHeaders, {
      fetch: async () => Response.json({ success: true }),
    })
    expect(stagingResult).toEqual({ success: true, bypassed: true })

    process.env.VERCEL_ENV = 'production'
    const productionResult = await verifyTurnstile(form(), 'booking_create', requestHeaders, {
      fetch: async () => Response.json({ success: true }),
    })
    expect(productionResult.success).toBe(false)
  })
})
