import type { Payload } from 'payload'
import type { Coupon } from '@/payload-types'

/**
 * Coupon validation + redemption (§79). Amounts are in whole Ghana Cedi, to
 * match a booking's `totalAmount`. Discounts never exceed the order subtotal.
 */

export type CouponContext = {
  experienceId?: number
  eventId?: number
  subtotal: number
}

export type CouponSuccess = { ok: true; code: string; discount: number; total: number }
export type CouponResult = CouponSuccess | { ok: false; reason: string }

function relIds(list: Coupon['experiences'] | Coupon['events']): number[] {
  return (list ?? []).map((item) => (typeof item === 'object' && item ? item.id : (item as number)))
}

/** Discount in whole Cedi for a given subtotal, capped at the subtotal. */
export function computeCouponDiscount(coupon: Coupon, subtotal: number): number {
  const raw = coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value
  return Math.max(0, Math.min(Math.round(raw), subtotal))
}

/** Validate a code against the order and return the resulting discount, or a reason. */
export async function validateCoupon(
  payload: Payload,
  rawCode: string,
  ctx: CouponContext,
): Promise<CouponResult> {
  const code = rawCode.trim().toUpperCase()
  if (!code) return { ok: false, reason: 'Enter a code.' }

  const found = await payload.find({
    collection: 'coupons',
    where: { code: { equals: code } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const coupon = found.docs[0]
  if (!coupon || coupon.active === false) return { ok: false, reason: 'That code isn’t valid.' }

  const now = Date.now()
  if (coupon.validFrom && new Date(coupon.validFrom).getTime() > now)
    return { ok: false, reason: 'That code isn’t active yet.' }
  if (coupon.validTo && new Date(coupon.validTo).getTime() < now)
    return { ok: false, reason: 'That code has expired.' }

  if (typeof coupon.maxUses === 'number' && coupon.maxUses > 0 && (coupon.usedCount ?? 0) >= coupon.maxUses)
    return { ok: false, reason: 'That code has reached its usage limit.' }

  if (typeof coupon.minOrder === 'number' && coupon.minOrder > 0 && ctx.subtotal < coupon.minOrder)
    return { ok: false, reason: `Spend at least GHS ${coupon.minOrder} to use this code.` }

  if (coupon.appliesTo === 'experiences') {
    if (!ctx.experienceId || !relIds(coupon.experiences).includes(ctx.experienceId))
      return { ok: false, reason: 'This code doesn’t apply to this experience.' }
  } else if (coupon.appliesTo === 'events') {
    if (!ctx.eventId || !relIds(coupon.events).includes(ctx.eventId))
      return { ok: false, reason: 'This code doesn’t apply to this event.' }
  }

  const discount = computeCouponDiscount(coupon, ctx.subtotal)
  if (discount <= 0) return { ok: false, reason: 'That code has no effect on this order.' }
  return { ok: true, code, discount, total: ctx.subtotal - discount }
}

/**
 * Record a coupon redemption once a booking is paid. Best-effort and idempotent
 * (guarded by the booking's `couponRedeemed` flag) so it never disrupts payment
 * settlement or double-counts on webhook retries.
 */
export async function redeemCouponForBooking(
  payload: Payload,
  booking: { id: number; couponCode?: string | null; couponRedeemed?: boolean | null },
): Promise<void> {
  const code = booking.couponCode?.trim().toUpperCase()
  if (!code || booking.couponRedeemed) return
  try {
    const found = await payload.find({
      collection: 'coupons',
      where: { code: { equals: code } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const coupon = found.docs[0]
    if (!coupon) return
    await payload.update({
      collection: 'bookings',
      id: booking.id,
      data: { couponRedeemed: true },
      overrideAccess: true,
    })
    await payload.update({
      collection: 'coupons',
      id: coupon.id,
      data: { usedCount: (coupon.usedCount ?? 0) + 1 },
      overrideAccess: true,
    })
  } catch (error) {
    console.error('Coupon redemption bookkeeping failed', error)
  }
}
