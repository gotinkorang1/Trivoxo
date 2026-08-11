'use server'

import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import config from '@payload-config'
import { createBookingAccessToken } from '@/lib/booking-access'
import { checkRateLimit, rateLimitMessage } from '@/lib/rate-limit'

export type TripLookupState = {
  error?: string
  values?: { reference?: string; email?: string }
}

/**
 * Guest booking lookup (§43, §44). Verifies a booking reference against the
 * booker's email and, on a match, sends them to the booking view. This is the
 * accountless path; full customer auth (Supabase magic-link/OTP) is a later add.
 *
 * Runs server-side via the local API (bookings aren't publicly readable). The
 * email check means a reference alone isn't enough to view someone's trip here.
 */
export async function lookupTripAction(
  _prev: TripLookupState,
  formData: FormData,
): Promise<TripLookupState> {
  const reference = String(formData.get('reference') ?? '')
    .trim()
    .toUpperCase()
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const values = { reference, email }

  if (!reference || !email) {
    return { error: 'Enter your booking reference and email.', values }
  }

  const rateLimit = await checkRateLimit('tripLookup', await nextHeaders())
  if (!rateLimit.allowed) return { error: rateLimitMessage(rateLimit), values }

  let redirectTo: string | null = null
  try {
    const payload = await getPayload({ config })
    const found = await payload.find({
      collection: 'bookings',
      where: { reference: { equals: reference } },
      limit: 1,
      depth: 0,
    })
    const booking = found.docs[0]
    if (booking && booking.booker?.email?.toLowerCase() === email) {
      const access = createBookingAccessToken(reference)
      redirectTo = `/booking/${reference}?access=${encodeURIComponent(access)}`
    }
  } catch (err) {
    console.error('Trip lookup failed', err)
    return { error: 'Something went wrong. Please try again.', values }
  }

  if (!redirectTo) {
    return {
      error: 'We couldn’t find a trip with those details. Check your reference and email.',
      values,
    }
  }

  // Outside try/catch — redirect() throws a control-flow signal.
  redirect(redirectTo)
}
