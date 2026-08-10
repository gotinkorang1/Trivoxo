import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyBookingAccessToken } from '@/lib/booking-access'
import { reconcilePaystackPayment } from '@/lib/payment-service'

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
  const result = await reconcilePaystackPayment(payload, reference)
  const bookingReference = result.booking?.reference
  if (!bookingReference || !verifyBookingAccessToken(bookingReference, access)) {
    return Response.redirect(new URL('/my-trips?payment=verification-complete', requestURL), 303)
  }

  const destination = new URL(`/booking/${encodeURIComponent(bookingReference)}`, requestURL)
  destination.searchParams.set('access', access || '')
  destination.searchParams.set('payment', result.outcome)
  return Response.redirect(destination, 303)
}
