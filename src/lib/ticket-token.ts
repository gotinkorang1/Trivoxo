import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Signed QR ticket tokens (§65). A ticket QR encodes `<reference>.<sig>` where
 * the signature binds the ticket reference to PAYLOAD_SECRET, so a guessed or
 * forged reference can't produce a valid QR. Tickets don't expire on a timer —
 * one-time use is enforced by the ticket's `checked_in` status at scan time.
 *
 * The check-in scanner also accepts a bare reference for manual staff entry:
 * that path is safe because check-in is a role-gated staff action.
 */
const TOKEN_VERSION = 'tkt1'

function signingSecret(): string {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret || secret.length < 16) {
    throw new Error('PAYLOAD_SECRET must be configured before issuing ticket QR codes.')
  }
  return secret
}

function signature(reference: string): string {
  return createHmac('sha256', signingSecret())
    .update(`${TOKEN_VERSION}:${reference.toUpperCase()}`)
    .digest('base64url')
}

/** The string encoded into a ticket's QR code. */
export function createTicketToken(reference: string): string {
  return `${reference.toUpperCase()}.${signature(reference)}`
}

/**
 * Extract a validated ticket reference from scanner input.
 * - `<ref>.<sig>` (scanned QR): the signature must verify.
 * - `<ref>` (manual staff entry): accepted as-is (uppercased).
 * Returns null when a signed token fails verification.
 */
export function ticketReferenceFromScan(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const dotIndex = trimmed.indexOf('.')
  if (dotIndex === -1) {
    // Bare reference — trusted manual entry.
    return trimmed.toUpperCase()
  }

  const reference = trimmed.slice(0, dotIndex).toUpperCase()
  const received = trimmed.slice(dotIndex + 1)
  const expected = signature(reference)
  const a = Buffer.from(expected)
  const b = Buffer.from(received)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  return reference
}
