/** Customer-facing reference generators (§42, §65). Never expose DB ids. */

import { randomInt } from 'node:crypto'

// Unambiguous alphabet (no 0/O, 1/I).
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function randomCode(length: number): string {
  let out = ''
  for (let i = 0; i < length; i++) {
    out += ALPHABET[randomInt(ALPHABET.length)]
  }
  return out
}

/** e.g. TVX-26-A8F41 */
export function bookingReference(date = new Date()): string {
  const yy = String(date.getFullYear()).slice(-2)
  return `TVX-${yy}-${randomCode(5)}`
}

/** e.g. TVXE-49C82 */
export function ticketReference(): string {
  return `TVXE-${randomCode(5)}`
}

/** Unique gateway attempt reference accepted by Paystack. */
export function paymentReference(date = new Date()): string {
  const yy = String(date.getFullYear()).slice(-2)
  return `TVXP-${yy}-${randomCode(10)}`
}
