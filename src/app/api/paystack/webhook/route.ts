import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyPaystackWebhookSignature } from '@/lib/paystack'
import { reconcilePaystackPayment } from '@/lib/payment-service'

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
    await reconcilePaystackPayment(payload, reference)
    return Response.json({ received: true })
  } catch (error) {
    console.error('Paystack webhook reconciliation failed', error)
    // A non-2xx response asks Paystack to retry this idempotent event.
    return Response.json({ received: false }, { status: 500 })
  }
}
