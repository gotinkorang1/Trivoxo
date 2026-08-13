/**
 * Trivoxo business rules — the single source of truth for pricing and policy
 * defaults (agreed with the team; see docs/OPEN_DECISIONS.md). Both the pricing
 * engine and the published legal pages read from here so the two can't drift.
 *
 * Money is whole Ghanaian Cedi (GHS). These are the operational defaults; the
 * exact resident/international rates and per-experience durations still depend
 * on Trivoxo's cost data.
 */

/* ── Group pricing ───────────────────────────────────────────────────────────
 * A single group discount: parties of 10+ travellers get 5% off, reflecting the
 * transport + guide costs spread across a fuller vehicle. */
export type DiscountTier = {
  minGuests: number
  maxGuests: number | null
  discountPct: number
  requestQuote?: boolean
}

export const GROUP_DISCOUNT_TIERS: DiscountTier[] = [
  { minGuests: 10, maxGuests: null, discountPct: 5 },
]

/**
 * Age brackets. Total headcount (all ages) counts toward capacity and the group
 * discount, because every traveller occupies a vehicle seat.
 * - 0–5 years: free
 * - 6–12 years: pay {@link CHILD_RATE} (40% off the adult rate)
 * - 13+ years: charged as an adult
 */
export const CHILD_RATE = 0.6
export const CHILD_AGES = { freeMax: 5, childMax: 12 } as const

/**
 * Who may make a booking. 18+ can book unaccompanied; 13–17 may book only with
 * the consent of an accompanying adult (18+); under-13s cannot book.
 */
export const BOOKING_AGE = { minUnaccompanied: 18, minWithConsent: 13 } as const

/** Pickup is customer-chosen but must fall within this region. */
export const PICKUP = { region: 'Greater Accra' } as const

/* ── Capacity & booking window ───────────────────────────────────────────────
 * Standard shared-vehicle bookings run from 4 to 30 travellers — the smallest
 * vehicle seats 4 passengers, the largest 30. Parties outside that range need a
 * custom/private arrangement. */
export const CAPACITY = {
  minGuests: 4,
  maxGuests: 30,
  minNoticeHours: 24, // day tours; multi-day needs more (see BOOKING_NOTICE)
  maxAdvanceDays: 180,
} as const

/** A checkout owns its seats for this long before they return to inventory. */
export const BOOKING_HOLD = {
  minutes: 20,
  cleanupBatchSize: 100,
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
export const SEASONAL = {
  peakSurchargePct: 15,
  note: 'Dec 15 – Jan 5 and major public holidays, on premium experiences and events only.',
} as const

/* ── Guides (§102) ───────────────────────────────────────────────────────── */
export const GUIDE_LANGUAGES = {
  default: 'English',
  onRequest: ['Twi', 'Ga', 'Ewe'],
  advanceNoticeDays: 7,
} as const

/* ── Pricing engine ──────────────────────────────────────────────────────── */

/** Group-discount percentage for a given headcount (0 below the group threshold). */
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

/** True when a headcount falls outside the standard shared-vehicle range (4–30). */
export function needsCustomBooking(groupSize: number): boolean {
  return groupSize < CAPACITY.minGuests || groupSize > CAPACITY.maxGuests
}

export type Quote = {
  /** Total travellers of all ages (each occupies a seat). */
  groupSize: number
  discountPct: number
  adultUnit: number
  childUnit: number
  total: number
  /** True when the party is outside 4–30 and needs a custom/private booking. */
  requestQuote: boolean
}

/**
 * Estimate a booking total from the "from" price and party composition.
 * `children` are 6–12 (charged {@link CHILD_RATE}); `youngChildren` are 0–5 (free).
 */
export function quoteBooking(
  baseFrom: number,
  adults: number,
  children = 0,
  youngChildren = 0,
): Quote {
  const groupSize = Math.max(1, adults + children + youngChildren)
  const discountPct = groupDiscountPct(groupSize)
  const adultUnit = perPersonPrice(baseFrom, groupSize)
  const childUnit = Math.round(adultUnit * CHILD_RATE)
  return {
    groupSize,
    discountPct,
    adultUnit,
    childUnit,
    total: adultUnit * adults + childUnit * children,
    requestQuote: needsCustomBooking(groupSize),
  }
}
