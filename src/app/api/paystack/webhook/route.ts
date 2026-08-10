import { getPayload } from 'payload'
import { after } from 'next/server'
import config from '@payload-config'
import { verifyPaystackWebhookSignature } from '@/lib/paystack'
import { reconcilePaystackPayment } from '@/lib/payment-service'
import { processBookingNotifications } from '@/lib/notifications'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type PaystackWebhookEvent = {
  event?: string
  data?: { reference?: string }
}

export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text()
  const signature = request.headers.get('x-paystack-signature')
  if (!verifyPaystackWebhookSignature(rawBody, signature)) {
    return Response.json({ received: false }, { status: 401 })
  }

  let event: PaystackWebhookEvent
  try {
    event = JSON.parse(rawBody) as PaystackWebhookEvent
  } catch {
    return Response.json({ received: false }, { status: 400 })
  }

  if (event.event !== 'charge.success') {
    return Response.json({ received: true })
  }
  const reference = event.data?.reference
  if (!reference) return Response.json({ received: false }, { status: 400 })

  try {
    const payload = await getPayload({ config })
    const result = await reconcilePaystackPayment(payload, reference)
    if (result.booking?.id && result.outcome === 'confirmed') {
      const bookingID = result.booking.id
      after(async () => {
        try {
          await processBookingNotifications(payload, { bookingID, limit: 1 })
        } catch {
          console.error(
            'Booking confirmation delivery could not start; the retry job will recover it.',
          )
        }
      })
    }
    return Response.json({ received: true })
  } catch (error) {
    console.error('Paystack webhook reconciliation failed', error)
    // A non-2xx response asks Paystack to retry this idempotent event.
    return Response.json({ received: false }, { status: 500 })
  }
}
