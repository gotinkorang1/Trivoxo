'use server'

import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import config from '@payload-config'

export type BookingFormState = {
  error?: string
  fieldErrors?: Record<string, string>
  values?: Record<string, string>
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

/**
 * Create a booking REQUEST from the public site (§39, §40).
 *
 * Scope note: this captures the booking as `pending_payment` and hands the
 * customer a reference. It deliberately does NOT implement the transactional
 * inventory hold or Paystack payment/verification (§38, §46) — those are the
 * concurrency-sensitive pieces flagged for deliberate human review and require
 * Paystack credentials. Payment wiring slots in after this step.
 *
 * Runs server-side via Payload's local API, so it can create a booking even
 * though public `create` is restricted on the collection. TODO: add Cloudflare
 * Turnstile before going live (§88) to prevent spam.
 */
export async function createBookingAction(
  _prev: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const get = (k: string) => String(formData.get(k) ?? '').trim()

  const slug = get('slug')
  const firstName = get('firstName')
  const lastName = get('lastName')
  const email = get('email')
  const phone = get('phone')
  const country = get('country')
  const date = get('date')
  const pickup = get('pickup')
  const specialRequest = get('specialRequest')
  const adults = Math.max(1, Number(formData.get('adults') ?? 2) || 2)
  const children = Math.max(0, Number(formData.get('children') ?? 0) || 0)

  const values = { firstName, lastName, email, phone, country, date, pickup, specialRequest }
  const fieldErrors: Record<string, string> = {}
  if (!firstName) fieldErrors.firstName = 'Required'
  if (!lastName) fieldErrors.lastName = 'Required'
  if (!email) fieldErrors.email = 'Required'
  else if (!EMAIL_RE.test(email)) fieldErrors.email = 'Enter a valid email'
  if (!phone) fieldErrors.phone = 'Required'
  if (!date) fieldErrors.date = 'Choose a date'
  else if (Number.isNaN(Date.parse(date))) fieldErrors.date = 'Invalid date'

  if (Object.keys(fieldErrors).length > 0) {
    return { error: 'Please correct the highlighted fields.', fieldErrors, values }
  }

  let reference: string | undefined
  try {
    const payload = await getPayload({ config })
    const found = await payload.find({
      collection: 'experiences',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    const experience = found.docs[0]
    if (!experience) {
      return { error: 'That experience could not be found.', values }
    }

    const booking = await payload.create({
      collection: 'bookings',
      data: {
        status: 'pending_payment',
        source: 'website',
        experience: experience.id,
        departureDate: new Date(date).toISOString(),
        adults,
        children,
        booker: { firstName, lastName, email, phone, country: country || undefined },
        pickup: pickup || undefined,
        specialRequest: specialRequest || undefined,
        // Provisional estimate only — real pricing (group tiers, child rates)
        // is applied when the pricing engine + checkout land.
        totalAmount: (experience.priceFrom ?? 0) * adults,
        paymentState: 'outstanding',
      },
    })
    reference = booking.reference ?? undefined
  } catch (err) {
    console.error('Booking creation failed', err)
    return { error: 'Something went wrong creating your booking. Please try again.', values }
  }

  if (!reference) {
    return { error: 'Booking was created but no reference was returned. Please contact us.', values }
  }

  // Must be outside try/catch — redirect() throws a control-flow signal.
  redirect(`/booking/${reference}`)
}
