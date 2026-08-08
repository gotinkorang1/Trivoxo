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
  it('applies the agreed 3-person discount to the estimate', () => {
    expect(quoteBooking(1400, 3)).toMatchObject({ discountPct: 10, adultUnit: 1260, total: 3780 })
  })

  it('uses the child rate and flags 15-person groups for a quote', () => {
    expect(quoteBooking(1400, 2, 1)).toMatchObject({ discountPct: 10, childUnit: 756, total: 3276 })
    expect(quoteBooking(1400, 15)).toMatchObject({ requestQuote: true, discountPct: 25 })
  })
})
