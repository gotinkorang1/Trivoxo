'use server'

import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import config from '@payload-config'
import { evaluateDateAvailability, getBookingWindow, isIsoDate } from '@/lib/availability'
import { CAPACITY, quoteBooking } from '@/lib/policies'

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
  const adults = Number(formData.get('adults') ?? 2)
  const children = Number(formData.get('children') ?? 0)
  const partySize = adults + children

  const values = {
    firstName,
    lastName,
    email,
    phone,
    country,
    date,
    pickup,
    specialRequest,
    adults: String(adults),
    children: String(children),
  }
  const fieldErrors: Record<string, string> = {}
  if (!firstName) fieldErrors.firstName = 'Required'
  if (!lastName) fieldErrors.lastName = 'Required'
  if (!email) fieldErrors.email = 'Required'
  else if (!EMAIL_RE.test(email)) fieldErrors.email = 'Enter a valid email'
  if (!phone) fieldErrors.phone = 'Required'
  if (!date) fieldErrors.date = 'Choose a date'
  else if (!isIsoDate(date)) fieldErrors.date = 'Choose a valid date'
  if (!Number.isInteger(adults) || adults < 1 || !Number.isInteger(children) || children < 0) {
    fieldErrors.party = 'Choose a valid number of travellers'
  } else if (partySize < CAPACITY.minGuests) {
    fieldErrors.party = `A minimum of ${CAPACITY.minGuests} travellers is required`
  } else if (partySize > CAPACITY.maxGuests) {
    fieldErrors.party = `Online requests are limited to ${CAPACITY.maxGuests} travellers`
  }

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

    const minGuests = experience.minGuests ?? CAPACITY.minGuests
    const maxGuests = experience.maxGuests ?? CAPACITY.maxGuests
    if (partySize < minGuests || partySize > maxGuests) {
      return {
        error: 'Please adjust the number of travellers.',
        fieldErrors: {
          party:
            partySize < minGuests
              ? `This experience requires at least ${minGuests} travellers.`
              : `Online requests are limited to ${maxGuests} travellers. Contact Trivoxo for a larger group.`,
        },
        values,
      }
    }

    const availabilityRules = {
      availabilityType: experience.availabilityType,
      weekdays: experience.weekdays ?? undefined,
      minNoticeHours: experience.minNoticeHours ?? undefined,
      maxAdvanceDays: experience.maxAdvanceDays ?? undefined,
      soldOut: Boolean(experience.soldOut),
    }
    const dateAvailability = evaluateDateAvailability(
      date,
      availabilityRules,
      getBookingWindow(availabilityRules),
    )
    if (!dateAvailability.requestable) {
      return {
        error: 'That date cannot be requested for this experience.',
        fieldErrors: { date: dateAvailability.reason ?? 'Choose another date.' },
        values,
      }
    }

    const booking = await payload.create({
      collection: 'bookings',
      data: {
        status: 'pending_payment',
        source: 'website',
        experience: experience.id,
        departureDate: new Date(`${date}T12:00:00.000Z`).toISOString(),
        adults,
        children,
        booker: { firstName, lastName, email, phone, country: country || undefined },
        pickup: pickup || undefined,
        specialRequest: specialRequest || undefined,
        // Estimate from the group-pricing rules (§32) — confirmed at checkout.
        totalAmount: quoteBooking(experience.priceFrom ?? 0, adults, children).total,
        paymentState: 'outstanding',
      },
    })
    reference = booking.reference ?? undefined
  } catch (err) {
    console.error('Booking creation failed', err)
    return { error: 'Something went wrong creating your booking. Please try again.', values }
  }

  if (!reference) {
    return {
      error: 'Booking was created but no reference was returned. Please contact us.',
      values,
    }
  }

  // Must be outside try/catch — redirect() throws a control-flow signal.
  redirect(`/booking/${reference}`)
}
