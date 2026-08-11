import { getPayload } from 'payload'
import { after } from 'next/server'
import config from '@payload-config'
import { verifyBookingAccessToken } from '@/lib/booking-access'
import { reconcilePaymentByReference } from '@/lib/payment-dispatch'
import { processNotifications } from '@/lib/notifications'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request): Promise<Response> {
  const requestURL = new URL(request.url)
  const reference = requestURL.searchParams.get('reference')?.trim()
  const access = requestURL.searchParams.get('access')?.trim()
  if (!reference) {
    return Response.redirect(new URL('/my-trips?payment=missing-reference', requestURL), 303)
  }

  const payload = await getPayload({ config })
  const result = await reconcilePaymentByReference(payload, reference)

  if (result.kind === 'event') {
    const orderReference = result.order?.reference
    if (result.order?.id && result.outcome === 'confirmed') {
      const eventOrderID = result.order.id
      after(async () => {
        try {
          await processNotifications(payload, { eventOrderID, limit: 1 })
        } catch {
          console.error(
            'Event ticket email delivery could not start; the retry job will recover it.',
          )
        }
      })
    }
    if (!orderReference || !verifyBookingAccessToken(orderReference, access)) {
      return Response.redirect(new URL('/events?payment=verification-complete', requestURL), 303)
    }
    const destination = new URL(`/events/order/${encodeURIComponent(orderReference)}`, requestURL)
    destination.searchParams.set('access', access || '')
    destination.searchParams.set('payment', result.outcome)
    return Response.redirect(destination, 303)
  }

  const bookingReference = result.kind === 'booking' ? result.booking?.reference : undefined
  if (result.kind === 'booking' && result.booking?.id && result.outcome === 'confirmed') {
    const bookingID = result.booking.id
    after(async () => {
      try {
        await processNotifications(payload, { bookingID, limit: 1 })
      } catch {
        console.error(
          'Booking confirmation delivery could not start; the retry job will recover it.',
        )
      }
    })
  }
  if (!bookingReference || !verifyBookingAccessToken(bookingReference, access)) {
    return Response.redirect(new URL('/my-trips?payment=verification-complete', requestURL), 303)
  }

  const destination = new URL(`/booking/${encodeURIComponent(bookingReference)}`, requestURL)
  destination.searchParams.set('access', access || '')
  destination.searchParams.set('payment', result.outcome)
  return Response.redirect(destination, 303)
}
