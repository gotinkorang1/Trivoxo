import config from '@payload-config'
import { getPayload } from 'payload'
import { expireStaleBookingHolds } from '@/lib/booking-inventory'
import { expireStaleEventOrderHolds } from '@/lib/event-inventory'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const payload = await getPayload({ config })
  const [bookings, eventOrders] = await Promise.all([
    expireStaleBookingHolds(payload),
    expireStaleEventOrderHolds(payload),
  ])
  return Response.json({ ok: true, bookings, eventOrders })
}
