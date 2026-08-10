import type { Booking, Departure, Experience } from '@/payload-types'
import { createBookingAccessToken, createBookingAccessTokenUntil } from '@/lib/booking-access'

const DAY_MS = 24 * 60 * 60 * 1000

export type BookingMaterial = {
  reference: string
  bookerName: string
  bookerEmail: string
  experienceTitle: string
  departureDate: string
  timeConfirmed: boolean
  adults: number
  children: number
  travellers: number
  totalAmount: number
  pickup: string
  duration?: string
  whatToBring: string[]
}

export type BookingLinks = {
  manage: string
  voucher: string
  calendar: string
}

function relatedDocument<T extends { id: number }>(
  value: number | T | null | undefined,
): T | undefined {
  return value && typeof value === 'object' ? value : undefined
}

function siteURL(): URL {
  const configured = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const url = new URL(configured)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('NEXT_PUBLIC_SERVER_URL must use http or https.')
  }
  return url
}

/**
 * Guest links remain valid through the trip and 30 days afterwards. The
 * catalogue limits advance booking to 180 days; a 400-day ceiling bounds a
 * mistakenly distant departure without invalidating ordinary reservations.
 */
export function bookingAccessTTL(departureDate: string, now = new Date()): number {
  return Math.max(
    60,
    Math.ceil((bookingAccessExpiresAt(departureDate, now).getTime() - now.getTime()) / 1000),
  )
}

export function bookingAccessExpiresAt(departureDate: string, now = new Date()): Date {
  const departureTime = new Date(departureDate).getTime()
  const target = Number.isFinite(departureTime)
    ? Math.max(now.getTime() + 30 * DAY_MS, departureTime + 30 * DAY_MS)
    : now.getTime() + 30 * DAY_MS
  const bounded = Math.min(target, now.getTime() + 400 * DAY_MS)
  return new Date(bounded)
}

export function createBookingLinks(
  reference: string,
  departureDate: string,
  options: { access?: string; expiresAt?: Date | number; now?: Date } = {},
): BookingLinks {
  const access =
    options.access ||
    (options.expiresAt
      ? createBookingAccessTokenUntil(reference, options.expiresAt)
      : createBookingAccessToken(reference, {
          now: options.now,
          ttlSeconds: bookingAccessTTL(departureDate, options.now),
        }))
  const base = siteURL()

  const createLink = (pathname: string) => {
    const url = new URL(pathname, base)
    url.searchParams.set('access', access)
    return url.toString()
  }

  const encodedReference = encodeURIComponent(reference)
  return {
    manage: createLink(`/booking/${encodedReference}`),
    voucher: createLink(`/api/bookings/${encodedReference}/voucher`),
    calendar: createLink(`/api/bookings/${encodedReference}/calendar`),
  }
}

export function bookingMaterialFrom(booking: Booking): BookingMaterial {
  const experience = relatedDocument<Experience>(booking.experience)
  const departure = relatedDocument<Departure>(booking.departure)
  const adults = Number(booking.adults ?? 0)
  const children = Number(booking.children ?? 0)
  const pickup =
    booking.pickup?.trim() ||
    departure?.meetingPointOverride?.trim() ||
    experience?.meetingPoint?.trim() ||
    'Final pickup details will be shared before departure.'

  return {
    reference: booking.reference || `TVX-${booking.id}`,
    bookerName: [booking.booker.firstName, booking.booker.lastName].filter(Boolean).join(' '),
    bookerEmail: booking.booker.email,
    experienceTitle: experience?.title || 'Trivoxo experience',
    departureDate: booking.departureDate,
    timeConfirmed: departure?.timeConfirmed !== false,
    adults,
    children,
    travellers: adults + children,
    totalAmount: Number(booking.totalAmount ?? 0),
    pickup,
    duration: experience?.duration || undefined,
    whatToBring: experience?.whatToBring?.map((item) => item.text).filter(Boolean) ?? [],
  }
}

export function formatGhanaDeparture(
  material: Pick<BookingMaterial, 'departureDate' | 'timeConfirmed'>,
) {
  const date = new Date(material.departureDate)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(material.timeConfirmed ? { hour: 'numeric', minute: '2-digit' } : {}),
    timeZone: 'Africa/Accra',
  }).format(date)
}

export function formatGHS(amount: number): string {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    currencyDisplay: 'code',
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\u00a0/g, ' ')
}
