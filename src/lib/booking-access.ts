import { createHmac, timingSafeEqual } from 'node:crypto'

const TOKEN_VERSION = 'v1'
const DEFAULT_TTL_SECONDS = 24 * 60 * 60

function signingSecret(): string {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret || secret.length < 16) {
    throw new Error('PAYLOAD_SECRET must be configured before issuing booking access links.')
  }
  return secret
}

function signature(reference: string, expiresAt: number): string {
  return createHmac('sha256', signingSecret())
    .update(`${TOKEN_VERSION}:${reference.toUpperCase()}:${expiresAt}`)
    .digest('base64url')
}

/**
 * Short-lived, signed guest access for a single public booking reference.
 * It contains no customer data and can be regenerated after an email match.
 */
export function createBookingAccessToken(
  reference: string,
  options: { now?: Date; ttlSeconds?: number } = {},
): string {
  const now = options.now ?? new Date()
  const ttlSeconds = options.ttlSeconds ?? DEFAULT_TTL_SECONDS
  const expiresAt = Math.floor(now.getTime() / 1000) + ttlSeconds
  return `${TOKEN_VERSION}.${expiresAt}.${signature(reference, expiresAt)}`
}

export function verifyBookingAccessToken(
  reference: string,
  token: string | null | undefined,
  now = new Date(),
): boolean {
  if (!token) return false
  const [version, expiresRaw, receivedSignature, extra] = token.split('.')
  if (extra || version !== TOKEN_VERSION || !expiresRaw || !receivedSignature) return false

  const expiresAt = Number(expiresRaw)
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(now.getTime() / 1000)) {
    return false
  }

  const expected = Buffer.from(signature(reference, expiresAt))
  const received = Buffer.from(receivedSignature)
  return expected.length === received.length && timingSafeEqual(expected, received)
}
