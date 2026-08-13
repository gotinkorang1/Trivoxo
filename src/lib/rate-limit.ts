import { createHash } from 'node:crypto'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

type RateLimitWindow = Parameters<typeof Ratelimit.slidingWindow>[1]

export const RATE_LIMIT_POLICIES = {
  availability: { limit: 60, window: '1 m' },
  bookingCreate: { limit: 6, window: '10 m' },
  bookingDownload: { limit: 30, window: '10 m' },
  checkoutStart: { limit: 10, window: '10 m' },
  enquiryCreate: { limit: 5, window: '1 h' },
  eventOrderCreate: { limit: 6, window: '10 m' },
  newsletterSubscribe: { limit: 5, window: '1 h' },
  tripLookup: { limit: 10, window: '10 m' },
  // Admin 2FA: cap password attempts (Payload also locks the account) and,
  // more importantly, cap TOTP/recovery code guesses so a stolen password
  // can't be paired with a brute-forced 6-digit code.
  twoFactorLogin: { limit: 20, window: '10 m' },
  twoFactorVerify: { limit: 10, window: '10 m' },
} as const satisfies Record<string, { limit: number; window: RateLimitWindow }>

export type RateLimitPolicyName = keyof typeof RATE_LIMIT_POLICIES

export type RateLimitCheck = {
  allowed: boolean
  configured: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter: number
}

const limiters = new Map<RateLimitPolicyName, Ratelimit>()
let redis: Redis | undefined
let warnedAboutMissingConfig = false

function redisCredentials() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? { url, token } : null
}

function getRedis() {
  if (redis) return redis
  const credentials = redisCredentials()
  if (!credentials) return null
  redis = new Redis(credentials)
  return redis
}

function getLimiter(name: RateLimitPolicyName, client: Redis) {
  const existing = limiters.get(name)
  if (existing) return existing

  const policy = RATE_LIMIT_POLICIES[name]
  const limiter = new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(policy.limit, policy.window),
    prefix: `trivoxo:rate-limit:${name}`,
    timeout: 1_500,
  })
  limiters.set(name, limiter)
  return limiter
}

/**
 * Vercel supplies x-vercel-forwarded-for. The fallbacks keep local, Cloudflare,
 * and other trusted reverse-proxy deployments working without storing raw IPs.
 */
export function getClientAddress(headers: Headers): string {
  const candidate =
    headers.get('x-vercel-forwarded-for') ||
    headers.get('cf-connecting-ip') ||
    headers.get('x-forwarded-for') ||
    headers.get('x-real-ip')
  const first = candidate?.split(',')[0]?.trim()
  return first ? first.slice(0, 128) : 'unknown'
}

export function createRateLimitIdentifier(headers: Headers): string {
  const salt = process.env.RATE_LIMIT_SALT || process.env.PAYLOAD_SECRET || 'trivoxo-development'
  return createHash('sha256')
    .update(`${salt}:${getClientAddress(headers)}`)
    .digest('hex')
    .slice(0, 40)
}

export async function checkRateLimit(
  name: RateLimitPolicyName,
  headers: Headers,
): Promise<RateLimitCheck> {
  const policy = RATE_LIMIT_POLICIES[name]
  const client = getRedis()

  if (!client) {
    if (process.env.NODE_ENV === 'production' && !warnedAboutMissingConfig) {
      warnedAboutMissingConfig = true
      console.warn(
        'Rate limiting is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN.',
      )
    }
    return {
      allowed: true,
      configured: false,
      limit: policy.limit,
      remaining: policy.limit,
      reset: 0,
      retryAfter: 0,
    }
  }

  try {
    const result = await getLimiter(name, client).limit(createRateLimitIdentifier(headers))
    void result.pending.catch((error) => console.error('Rate limit background work failed', error))
    return {
      allowed: result.success,
      configured: true,
      limit: result.limit,
      remaining: Math.max(0, result.remaining),
      reset: result.reset,
      retryAfter: result.success ? 0 : Math.max(1, Math.ceil((result.reset - Date.now()) / 1_000)),
    }
  } catch (error) {
    // Redis should protect the app, not become a single point of failure for sales.
    console.error(`Rate limit check failed for ${name}; allowing the request`, error)
    return {
      allowed: true,
      configured: false,
      limit: policy.limit,
      remaining: policy.limit,
      reset: 0,
      retryAfter: 0,
    }
  }
}

export function rateLimitMessage(result: RateLimitCheck): string {
  const minutes = Math.max(1, Math.ceil(result.retryAfter / 60))
  return `Too many attempts. Please wait about ${minutes} minute${minutes === 1 ? '' : 's'} and try again.`
}

export function rateLimitResponseHeaders(result: RateLimitCheck): Record<string, string> {
  if (!result.configured) return {}
  const headers: Record<string, string> = {
    'RateLimit-Limit': String(result.limit),
    'RateLimit-Remaining': String(result.remaining),
    'RateLimit-Reset': String(Math.ceil(result.reset / 1_000)),
  }
  if (!result.allowed) headers['Retry-After'] = String(result.retryAfter)
  return headers
}
