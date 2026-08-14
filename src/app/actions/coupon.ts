'use server'

import { getPayload } from 'payload'
import { headers as nextHeaders } from 'next/headers'
import config from '@payload-config'
import { quoteBooking } from '@/lib/policies'
import { validateCoupon } from '@/lib/coupons'
import { checkRateLimit, rateLimitMessage } from '@/lib/rate-limit'

export type CouponPreview =
  | { ok: true; code: string; discount: number; total: number; subtotal: number }
  | { ok: false; reason: string }

/**
 * Preview a coupon against a booking before checkout. The subtotal is recomputed
 * server-side from the experience's own pricing, never trusted from the client.
 */
export async function validateCouponAction(input: {
  code: string
  slug: string
  adults: number
  children: number
  youngChildren: number
}): Promise<CouponPreview> {
  const code = input.code.trim()
  if (!code) return { ok: false, reason: 'Enter a code.' }

  const rl = await checkRateLimit('couponValidate', await nextHeaders())
  if (!rl.allowed) return { ok: false, reason: rateLimitMessage(rl) }

  const payload = await getPayload({ config })
  const found = await payload.find({
    collection: 'experiences',
    where: { slug: { equals: input.slug } },
    limit: 1,
    depth: 0,
  })
  const experience = found.docs[0]
  if (!experience) return { ok: false, reason: 'That experience could not be found.' }

  const subtotal = quoteBooking(
    experience.priceFrom ?? 0,
    input.adults,
    input.children,
    input.youngChildren,
  ).total

  const result = await validateCoupon(payload, code, { experienceId: experience.id, subtotal })
  if (!result.ok) return result
  return { ok: true, code: result.code, discount: result.discount, total: result.total, subtotal }
}
