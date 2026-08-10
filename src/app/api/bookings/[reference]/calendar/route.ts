import config from '@payload-config'
import { getPayload } from 'payload'
import { createBookingLinks } from '@/lib/booking-materials'
import { createBookingCalendar } from '@/lib/calendar'
import { bookingHasFulfilmentAccess, findGuestBooking } from '@/lib/guest-booking'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reference: string }> },
): Promise<Response> {
  const { reference } = await params
  const requestURL = new URL(request.url)
  const access = requestURL.searchParams.get('access')
  const payload = await getPayload({ config })
  const booking = await findGuestBooking(payload, reference, access)

  if (!booking) return new Response('Not found', { status: 404 })
  if (!bookingHasFulfilmentAccess(booking)) {
    return new Response('Calendar download is available after booking confirmation.', {
      status: 409,
    })
  }

  const links = createBookingLinks(booking.reference || reference, booking.departureDate, {
    access: access || undefined,
  })
  const calendar = createBookingCalendar(booking, links)
  const safeReference = (booking.reference || reference).replace(/[^a-z0-9-]/gi, '')
  return new Response(calendar, {
    headers: {
      'Cache-Control': 'private, no-store, max-age=0',
      'Content-Disposition': `attachment; filename="Trivoxo-${safeReference}.ics"`,
      'Content-Type': 'text/calendar; charset=utf-8',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
