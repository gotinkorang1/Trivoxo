/**
 * Trivoxo business rules — the single source of truth for pricing and policy
 * defaults (agreed with the team; see docs/OPEN_DECISIONS.md). Both the pricing
 * engine and the published legal pages read from here so the two can't drift.
 *
 * Money is whole Ghanaian Cedi (GHS). These are the operational defaults; the
 * exact resident/international rates and per-experience durations still depend
 * on Trivoxo's cost data.
 */

/* ── Group pricing (§32, §33) ────────────────────────────────────────────────
 * Standard price assumes 2 travellers; 3+ get a reduced per-person rate because
 * transport + guide are largely fixed costs spread across the group. */
export type DiscountTier = {
  minGuests: number
  maxGuests: number | null
  discountPct: number
  requestQuote?: boolean
}

export const GROUP_DISCOUNT_TIERS: DiscountTier[] = [
  { minGuests: 3, maxGuests: 4, discountPct: 10 },
  { minGuests: 5, maxGuests: 8, discountPct: 15 },
  { minGuests: 9, maxGuests: 14, discountPct: 20 },
  { minGuests: 15, maxGuests: null, discountPct: 25, requestQuote: true },
]

/** Children 3–11 pay this share of the adult per-person rate; infants 0–2 free. */
export const CHILD_RATE = 0.6
export const CHILD_AGES = { infantMax: 2, childMax: 11 } as const

/* ── Capacity & booking window (§37) ─────────────────────────────────────── */
export const CAPACITY = {
  minGuests: 2,
  maxGuests: 15,
  minNoticeHours: 24, // day tours; multi-day needs more (see BOOKING_NOTICE)
  maxAdvanceDays: 180,
} as const

export const BOOKING_NOTICE = { dayTourHours: 24, permitTourHours: 48, multiDayDays: 7 } as const

/* ── Deposits & payment (§45) ────────────────────────────────────────────── */
export const DEPOSIT = { pct: 50, balanceDueDays: 7 } as const // multi-day, premium & corporate
/** The Paystack fee (~1.95%) is absorbed into prices — customers are not surcharged. */
export const PAYMENT_FEE_ABSORBED = true

/* ── Cancellation, refunds, rescheduling (§78) ───────────────────────────── */
export const CANCELLATION = {
  dayTour: { freeHours: 48, partialFromHours: 24, partialPct: 50 },
  multiDay: { freeDays: 7, partialFromDays: 3, partialPct: 50 },
  event: { refundable: false, transferHours: 72 },
} as const
export const RESCHEDULE = { dayTourHours: 48, multiDayDays: 7, freeCount: 1 } as const
export const REFUND_WINDOW = '5–10 business days' as const

/* ── Seasonal (§35) ──────────────────────────────────────────────────────── */
export const SEASONAL = { peakSurchargePct: 15, note: 'Dec 15 – Jan 5 and major public holidays, on premium experiences and events only.' } as const

/* ── Guides (§102) ───────────────────────────────────────────────────────── */
export const GUIDE_LANGUAGES = { default: 'English', onRequest: ['Twi', 'Ga', 'Ewe'], advanceNoticeDays: 7 } as const

/* ── Pricing engine ──────────────────────────────────────────────────────── */

/** Per-person group-discount percentage for a given party size (0 for 1–2). */
export function groupDiscountPct(groupSize: number): number {
  const tier = GROUP_DISCOUNT_TIERS.find(
    (t) => groupSize >= t.minGuests && (t.maxGuests == null || groupSize <= t.maxGuests),
  )
  return tier?.discountPct ?? 0
}

/** Adult per-person price after the group discount, rounded to whole Cedi. */
export function perPersonPrice(baseFrom: number, groupSize: number): number {
  return Math.round(baseFrom * (1 - groupDiscountPct(groupSize) / 100))
}

export type Quote = {
  groupSize: number
  discountPct: number
  adultUnit: number
  childUnit: number
  total: number
  /** True for 15+ parties — the total is an estimate; a custom group quote applies. */
  requestQuote: boolean
}

/** Estimate a booking total from the "from" price and party composition. */
export function quoteBooking(baseFrom: number, adults: number, children = 0): Quote {
  const groupSize = Math.max(1, adults + children)
  const discountPct = groupDiscountPct(groupSize)
  const adultUnit = perPersonPrice(baseFrom, groupSize)
  const childUnit = Math.round(adultUnit * CHILD_RATE)
  return {
    groupSize,
    discountPct,
    adultUnit,
    childUnit,
    total: adultUnit * adults + childUnit * children,
    requestQuote: groupSize >= 15,
  }
}
