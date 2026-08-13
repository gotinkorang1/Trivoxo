import { describe, expect, it } from 'vitest'
import {
  evaluateDateAvailability,
  firstRequestableDate,
  getBookingWindow,
  type AvailabilityRules,
} from '@/lib/availability'
import { quoteBooking } from '@/lib/policies'

describe('availability rules', () => {
  it('builds a deterministic notice and advance-booking window', () => {
    const window = getBookingWindow(
      { minNoticeHours: 24, maxAdvanceDays: 180 },
      new Date('2026-08-08T10:00:00.000Z'),
    )

    expect(window).toEqual({ minDate: '2026-08-10', maxDate: '2027-02-04' })
  })

  it('only allows configured weekdays', () => {
    const rules: AvailabilityRules = { availabilityType: 'weekdays', weekdays: ['sat', 'sun'] }
    const window = { minDate: '2026-08-01', maxDate: '2026-08-31' }

    expect(evaluateDateAvailability('2026-08-10', rules, window).requestable).toBe(false)
    expect(evaluateDateAvailability('2026-08-15', rules, window).requestable).toBe(true)
    expect(firstRequestableDate(rules, { minDate: '2026-08-10', maxDate: '2026-08-31' })).toBe(
      '2026-08-15',
    )
  })

  it('blocks dates when an experience is sold out', () => {
    const result = evaluateDateAvailability(
      '2026-08-15',
      { availabilityType: 'everyday', soldOut: true },
      { minDate: '2026-08-01', maxDate: '2026-08-31' },
    )

    expect(result).toMatchObject({ requestable: false, label: 'Sold out' })
  })
})

describe('live booking quote', () => {
  it('charges full adult rate below the 10-person group threshold', () => {
    // Standard party (4 adults): no group discount, full rate.
    expect(quoteBooking(1400, 4)).toMatchObject({ discountPct: 0, adultUnit: 1400, total: 5600 })
  })

  it('applies the single 5% group discount at 10+ travellers', () => {
    expect(quoteBooking(1400, 10)).toMatchObject({
      discountPct: 5,
      adultUnit: 1330,
      total: 13300,
      requestQuote: false,
    })
  })

  it('charges 6–12s at 60% and 0–5s free, counting all toward headcount', () => {
    // 8 adults + 1 child (6–12) + 1 free (0–5) = 10 headcount → 5% discount.
    const quote = quoteBooking(1400, 8, 1, 1)
    expect(quote).toMatchObject({ groupSize: 10, discountPct: 5, adultUnit: 1330, childUnit: 798 })
    expect(quote.total).toBe(1330 * 8 + 798) // young child is free
  })

  it('flags parties outside 4–30 for a custom booking', () => {
    expect(quoteBooking(1400, 3)).toMatchObject({ requestQuote: true })
    expect(quoteBooking(1400, 31)).toMatchObject({ requestQuote: true })
    expect(quoteBooking(1400, 4)).toMatchObject({ requestQuote: false })
    expect(quoteBooking(1400, 30)).toMatchObject({ requestQuote: false })
  })
})
