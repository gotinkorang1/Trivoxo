// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { render } from '@react-email/render'
import type { Booking, Departure, Experience } from '@/payload-types'
import { BookingConfirmedEmail } from '@/emails/BookingConfirmedEmail'
import {
  bookingMaterialFrom,
  createBookingLinks,
  formatGhanaDeparture,
} from '@/lib/booking-materials'
import { createBookingCalendar } from '@/lib/calendar'
import { verifyBookingAccessToken } from '@/lib/booking-access'
import { renderBookingVoucher } from '@/lib/voucher'

const originalPayloadSecret = process.env.PAYLOAD_SECRET
const originalServerURL = process.env.NEXT_PUBLIC_SERVER_URL

function confirmedBooking(timeConfirmed = true): Booking {
  const experience = {
    id: 8,
    title: 'Capital Pulse Tour',
    pricingStrategy: 'fixed',
    priceFrom: 1400,
    availabilityType: 'everyday',
    duration: 'Full Day',
    meetingPoint: 'Plantsville Residence, Accra',
    whatToBring: [{ text: 'Comfortable walking shoes' }, { text: 'Sun protection' }],
    updatedAt: '2026-08-10T12:00:00.000Z',
    createdAt: '2026-08-10T12:00:00.000Z',
  } satisfies Experience
  const departure = {
    id: 9,
    experience,
    startsAt: '2026-09-17T07:00:00.000Z',
    timeConfirmed,
    capacity: 15,
    status: 'scheduled',
    inventoryKey: '8:2026-09-17T07:00:00.000Z',
    updatedAt: '2026-08-10T12:00:00.000Z',
    createdAt: '2026-08-10T12:00:00.000Z',
  } satisfies Departure

  return {
    id: 10,
    reference: 'TVX-26-A8F41',
    status: 'paid',
    source: 'website',
    experience,
    departure,
    departureDate: departure.startsAt,
    adults: 2,
    children: 1,
    inventoryState: 'confirmed',
    capacitySeats: 3,
    booker: {
      firstName: 'Ama',
      lastName: 'Mensah',
      email: 'ama@example.com',
      phone: '0593962111',
    },
    pickup: 'Plantsville Residence, Poultry Farm Ave, Accra',
    totalAmount: 4200,
    paymentState: 'paid',
    updatedAt: '2026-08-10T12:00:00.000Z',
    createdAt: '2026-08-10T12:00:00.000Z',
  }
}

describe('booking fulfilment materials', () => {
  beforeEach(() => {
    process.env.PAYLOAD_SECRET = 'unit-test-booking-fulfilment-secret'
    process.env.NEXT_PUBLIC_SERVER_URL = 'https://staging.trivoxogh.com'
  })

  afterEach(() => {
    process.env.PAYLOAD_SECRET = originalPayloadSecret
    process.env.NEXT_PUBLIC_SERVER_URL = originalServerURL
  })

  it('builds booking-bound private links and a responsive React email', async () => {
    const booking = confirmedBooking()
    const expiresAt = new Date('2026-10-17T07:00:00.000Z')
    const links = createBookingLinks(booking.reference!, booking.departureDate, {
      expiresAt,
    })
    const retryLinks = createBookingLinks(booking.reference!, booking.departureDate, {
      expiresAt,
      now: new Date('2026-08-11T12:00:00.000Z'),
    })
    const manage = new URL(links.manage)
    const access = manage.searchParams.get('access')
    expect(retryLinks).toEqual(links)
    expect(manage.origin).toBe('https://staging.trivoxogh.com')
    expect(
      verifyBookingAccessToken(booking.reference!, access, new Date('2026-09-18T00:00:00.000Z')),
    ).toBe(true)

    const material = bookingMaterialFrom(booking)
    const html = await render(<BookingConfirmedEmail booking={material} links={links} />)
    expect(html).toContain('Capital Pulse Tour')
    expect(html).toContain('TVX-26-A8F41')
    expect(html).toContain('Download voucher')
    expect(html).not.toContain('sk_')
  })

  it('creates a confirmed calendar event and uses an all-day event when time is provisional', () => {
    const booking = confirmedBooking()
    const links = createBookingLinks(booking.reference!, booking.departureDate, {
      access: 'signed.test.token',
    })
    const timed = createBookingCalendar(booking, links, new Date('2026-08-10T12:00:00.000Z'))
    expect(timed).toContain('DTSTART:20260917T070000Z')
    expect(timed).toContain('DTEND:20260917T170000Z')
    expect(timed).toContain('STATUS:CONFIRMED')
    expect(timed.endsWith('\r\n')).toBe(true)

    const allDayBooking = confirmedBooking(false)
    const allDay = createBookingCalendar(allDayBooking, links)
    expect(allDay).toContain('DTSTART;VALUE=DATE:20260917')
    expect(allDay).toContain('DTEND;VALUE=DATE:20260918')
    expect(formatGhanaDeparture(bookingMaterialFrom(allDayBooking))).not.toContain(':')
  })

  it('renders a branded, non-empty PDF voucher', async () => {
    const pdf = await renderBookingVoucher(confirmedBooking())
    expect(pdf.subarray(0, 4).toString()).toBe('%PDF')
    expect(pdf.byteLength).toBeGreaterThan(5_000)
  }, 20_000)
})
