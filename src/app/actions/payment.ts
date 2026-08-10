'use server'

import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import config from '@payload-config'
import { PaymentError, startPaystackCheckout } from '@/lib/payment-service'

export async function startPaystackCheckoutAction(formData: FormData): Promise<never> {
  const reference = String(formData.get('reference') ?? '')
    .trim()
    .toUpperCase()
  const access = String(formData.get('access') ?? '').trim()
  let checkoutURL: string | undefined
  let failureCode = 'checkout_error'

  try {
    const payload = await getPayload({ config })
    const checkout = await startPaystackCheckout(payload, reference, access)
    checkoutURL = checkout.authorizationURL
  } catch (error) {
    if (error instanceof PaymentError) {
      failureCode = error.code.toLowerCase()
    } else {
      console.error('Paystack checkout initialization failed', error)
    }
  }

  if (checkoutURL) redirect(checkoutURL)

  const query = new URLSearchParams({ access, payment: failureCode })
  redirect(`/booking/${encodeURIComponent(reference)}?${query.toString()}`)
}
