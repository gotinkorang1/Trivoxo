/**
 * Server-only two-factor (TOTP) helpers. Never import from a client component.
 *
 * - TOTP secrets are stored AES-256-GCM encrypted (key derived from
 *   PAYLOAD_SECRET), and are never exposed through the API or admin UI.
 * - Short-lived login challenges are HMAC-signed so the second-factor step is
 *   stateless (no server session store needed on serverless).
 * - Recovery codes are stored only as SHA-256 hashes.
 */
import { authenticator } from 'otplib'
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto'

const ISSUER = 'Trivoxo Admin'

function secretKey(): Buffer {
  const base = process.env.PAYLOAD_SECRET
  if (!base) throw new Error('PAYLOAD_SECRET is required for two-factor encryption')
  // Derive a stable 32-byte key from the app secret.
  return scryptSync(base, 'trivoxo-2fa-v1', 32)
}

/** Whether login enforcement of 2FA is switched on (server-side). */
export function isTwoFactorEnforced(): boolean {
  return process.env.TWO_FACTOR_ENFORCED === 'true'
}

// ── Secret encryption ──────────────────────────────────────────────────────
export function encryptSecret(plain: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', secretKey(), iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, enc]).toString('base64')
}

export function decryptSecret(payload: string): string {
  const raw = Buffer.from(payload, 'base64')
  const iv = raw.subarray(0, 12)
  const tag = raw.subarray(12, 28)
  const enc = raw.subarray(28)
  const decipher = createDecipheriv('aes-256-gcm', secretKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8')
}

// ── TOTP ───────────────────────────────────────────────────────────────────
export function generateTotpSecret(): string {
  return authenticator.generateSecret()
}

export function totpKeyUri(accountEmail: string, secret: string): string {
  return authenticator.keyuri(accountEmail, ISSUER, secret)
}

export function verifyTotp(token: string, secret: string): boolean {
  const cleaned = token.replace(/\s+/g, '')
  if (!/^\d{6}$/.test(cleaned)) return false
  try {
    return authenticator.verify({ token: cleaned, secret })
  } catch {
    return false
  }
}

// ── Recovery codes ─────────────────────────────────────────────────────────
function hashCode(code: string): string {
  return createHmac('sha256', secretKey()).update(code.toLowerCase()).digest('hex')
}

export function generateRecoveryCodes(count = 10): { plain: string[]; hashed: string[] } {
  const plain: string[] = []
  for (let i = 0; i < count; i += 1) {
    const raw = randomBytes(5).toString('hex') // 10 hex chars
    plain.push(`${raw.slice(0, 5)}-${raw.slice(5)}`)
  }
  return { plain, hashed: plain.map(hashCode) }
}

/** Returns the remaining hashed codes with the matched one removed, or null. */
export function consumeRecoveryCode(input: string, hashed: string[]): string[] | null {
  const candidate = hashCode(input.trim())
  const idx = hashed.findIndex((h) => {
    const a = Buffer.from(h)
    const b = Buffer.from(candidate)
    return a.length === b.length && timingSafeEqual(a, b)
  })
  if (idx === -1) return null
  return hashed.filter((_, i) => i !== idx)
}

// ── Stateless login challenge ──────────────────────────────────────────────
// Between the password step and the code step we hand the client an opaque,
// AES-GCM-sealed blob carrying the already-issued (but not yet delivered)
// session token. The cookie is only set once the TOTP code verifies, so the
// token is useless to anyone who can't also pass the second factor.
export function sealChallenge(data: Record<string, unknown>, ttlSeconds = 300): string {
  const payload = JSON.stringify({ ...data, exp: Math.floor(Date.now() / 1000) + ttlSeconds })
  return encryptSecret(payload)
}

export function openChallenge<T = Record<string, unknown>>(token: string): (T & { exp: number }) | null {
  try {
    const obj = JSON.parse(decryptSecret(token)) as T & { exp: number }
    if (typeof obj.exp !== 'number' || obj.exp < Math.floor(Date.now() / 1000)) return null
    return obj
  } catch {
    return null
  }
}
