import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  checkRateLimit,
  createRateLimitIdentifier,
  getClientAddress,
  rateLimitMessage,
  rateLimitResponseHeaders,
} from '@/lib/rate-limit'

describe('distributed rate limiting', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('prefers Vercel client IP data and takes the first proxy address', () => {
    const headers = new Headers({
      'x-forwarded-for': '198.51.100.40, 10.0.0.2',
      'x-vercel-forwarded-for': '203.0.113.8, 10.0.0.3',
    })

    expect(getClientAddress(headers)).toBe('203.0.113.8')
  })

  it('hashes identifiers consistently without exposing the client address', () => {
    vi.stubEnv('RATE_LIMIT_SALT', 'test-only-salt')
    const headers = new Headers({ 'cf-connecting-ip': '203.0.113.8' })
    const identifier = createRateLimitIdentifier(headers)

    expect(identifier).toHaveLength(40)
    expect(identifier).toBe(createRateLimitIdentifier(headers))
    expect(identifier).not.toContain('203.0.113.8')
  })

  it('fails open when Redis is not configured', async () => {
    vi.stubEnv('KV_REST_API_URL', '')
    vi.stubEnv('KV_REST_API_TOKEN', '')
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')

    const result = await checkRateLimit('bookingCreate', new Headers())

    expect(result).toMatchObject({ allowed: true, configured: false, limit: 6 })
    expect(rateLimitResponseHeaders(result)).toEqual({})
  })

  it('creates retry guidance and API headers for a blocked request', () => {
    const result = {
      allowed: false,
      configured: true,
      limit: 5,
      remaining: 0,
      reset: 1_800_000,
      retryAfter: 90,
    }

    expect(rateLimitMessage(result)).toBe(
      'Too many attempts. Please wait about 2 minutes and try again.',
    )
    expect(rateLimitResponseHeaders(result)).toEqual({
      'RateLimit-Limit': '5',
      'RateLimit-Remaining': '0',
      'RateLimit-Reset': '1800',
      'Retry-After': '90',
    })
  })
})
