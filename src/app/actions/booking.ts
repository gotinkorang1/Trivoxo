'use server'

import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import config from '@payload-config'
import { evaluateDateAvailability, getBookingWindow, isIsoDate } from '@/lib/availability'
import { createBookingHold, InventoryError } from '@/lib/booking-inventory'
import { CAPACITY, quoteBooking } from '@/lib/policies'
import { createBookingAccessToken } from '@/lib/booking-access'
import { checkRateLimit, rateLimitMessage } from '@/lib/rate-limit'
import { verifyTurnstile } from '@/lib/turnstile'

export type BookingFormState = {
  error?: string
  fieldErrors?: Record<string, string>
  values?: Record<string, string>
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

/**
 * Create a booking and atomically hold its departure seats (§38–§40).
 * The PostgreSQL departure lock is authoritative; the browser's availability
 * message is only guidance. Paystack payment/verification follows in the next
 * checkout sprint and will convert this hold to confirmed inventory.
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
  const nationality = get('nationality')
  const country = get('country')
  const ghanaCardNumber = get('ghanaCardNumber')
  const passportNumber = get('passportNumber')
  const bookerAge = get('bookerAge')
  const consentAdultName = get('consentAdultName')
  const consentAdultPhone = get('consentAdultPhone')
  const date = get('date')
  const pickup = get('pickup')
  const pickupTime = get('pickupTime')
  const specialRequest = get('specialRequest')
  const adults = Number(formData.get('adults') ?? 4)
  const children = Number(formData.get('children') ?? 0)
  const youngChildren = Number(formData.get('youngChildren') ?? 0)
  const partySize = adults + children + youngChildren

  const values = {
    firstName,
    lastName,
    email,
    phone,
    nationality,
    country,
    ghanaCardNumber,
    passportNumber,
    bookerAge,
    consentAdultName,
    consentAdultPhone,
    date,
    pickup,
    pickupTime,
    specialRequest,
    adults: String(adults),
    children: String(children),
    youngChildren: String(youngChildren),
  }
  const fieldErrors: Record<string, string> = {}
  if (!firstName) fieldErrors.firstName = 'Required'
  if (!lastName) fieldErrors.lastName = 'Required'
  if (!email) fieldErrors.email = 'Required'
  else if (!EMAIL_RE.test(email)) fieldErrors.email = 'Enter a valid email'
  if (!phone) fieldErrors.phone = 'Required'
  if (!date) fieldErrors.date = 'Choose a date'
  else if (!isIsoDate(date)) fieldErrors.date = 'Choose a valid date'
  if (
    !Number.isInteger(adults) ||
    adults < 1 ||
    !Number.isInteger(children) ||
    children < 0 ||
    !Number.isInteger(youngChildren) ||
    youngChildren < 0
  ) {
    fieldErrors.party = 'Choose a valid number of travellers'
  } else if (partySize < CAPACITY.minGuests) {
    fieldErrors.party = `Groups of ${CAPACITY.minGuests}–${CAPACITY.maxGuests} book online. For a smaller group, request a custom trip.`
  } else if (partySize > CAPACITY.maxGuests) {
    fieldErrors.party = `Online bookings run up to ${CAPACITY.maxGuests} travellers. For a larger group, request a custom trip.`
  }

  // Identity: Ghanaians provide a Ghana Card; foreign nationals provide country + passport.
  if (nationality !== 'ghanaian' && nationality !== 'foreign') {
    fieldErrors.nationality = 'Select your nationality'
  } else if (nationality === 'ghanaian' && !ghanaCardNumber) {
    fieldErrors.ghanaCardNumber = 'Enter your Ghana Card number'
  } else if (nationality === 'foreign') {
    if (!country) fieldErrors.country = 'Enter your country'
    if (!passportNumber) fieldErrors.passportNumber = 'Enter your passport number'
  }

  // Booking age: 18+ book freely; 13–17 need adult consent; under-13 cannot book.
  if (bookerAge !== '18-plus' && bookerAge !== '13-17') {
    fieldErrors.bookerAge =
      bookerAge === 'under-13'
        ? 'Travellers under 13 must be booked by a parent or guardian.'
        : 'Confirm the lead traveller’s age'
  } else if (bookerAge === '13-17') {
    if (!consentAdultName) fieldErrors.consentAdultName = 'Enter the consenting adult’s name'
    if (!consentAdultPhone) fieldErrors.consentAdultPhone = 'Enter the consenting adult’s phone'
  }

  // Pickup must be provided (customer-chosen, within Greater Accra) with a time.
  if (!pickup) fieldErrors.pickup = 'Enter a pickup area within Greater Accra'
  if (!pickupTime) fieldErrors.pickupTime = 'Enter a preferred pickup time'

  if (Object.keys(fieldErrors).length > 0) {
    return { error: 'Please correct the highlighted fields.', fieldErrors, values }
  }

  const requestHeaders = await nextHeaders()
  const rateLimit = await checkRateLimit('bookingCreate', requestHeaders)
  if (!rateLimit.allowed) return { error: rateLimitMessage(rateLimit), values }
  const verification = await verifyTurnstile(formData, 'booking_create', requestHeaders)
  if (!verification.success) return { error: verification.error, values }

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

    const { booking } = await createBookingHold(payload, {
      experience,
      date,
      adults,
      children,
      youngChildren,
      booker: { firstName, lastName, email, phone, country: country || undefined },
      pickup: pickup || undefined,
      pickupTime: pickupTime || undefined,
      travellerIdentity: {
        nationality: nationality as 'ghanaian' | 'foreign',
        ghanaCardNumber: nationality === 'ghanaian' ? ghanaCardNumber : undefined,
        passportNumber: nationality === 'foreign' ? passportNumber : undefined,
        bookerAge: bookerAge as '18-plus' | '13-17',
        consentAdultName: bookerAge === '13-17' ? consentAdultName : undefined,
        consentAdultPhone: bookerAge === '13-17' ? consentAdultPhone : undefined,
      },
      specialRequest: specialRequest || undefined,
      // Estimate from the group-pricing rules — confirmed at checkout.
      totalAmount: quoteBooking(experience.priceFrom ?? 0, adults, children, youngChildren).total,
    })
    reference = booking.reference ?? undefined
  } catch (err) {
    if (err instanceof InventoryError) {
      const field = err.code === 'CAPACITY_UNAVAILABLE' ? 'party' : 'date'
      return {
        error:
          err.code === 'CAPACITY_UNAVAILABLE'
            ? 'Those seats were just taken or are no longer available.'
            : 'That departure is not available.',
        fieldErrors: { [field]: err.message },
        values,
      }
    }
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
  const access = createBookingAccessToken(reference)
  redirect(`/booking/${reference}?access=${encodeURIComponent(access)}`)
}
