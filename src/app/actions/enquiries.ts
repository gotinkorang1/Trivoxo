'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import {
  EVENT_TYPE_VALUES,
  CORPORATE_SERVICE_VALUES,
  TRIP_INTEREST_VALUES,
} from '@/lib/enquiry-options'

export type EnquiryState = {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string>
  values?: Record<string, string>
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const num = (v: FormDataEntryValue | null) => {
  const n = Number(v)
  return v == null || v === '' || Number.isNaN(n) ? undefined : n
}

/**
 * Corporate & events enquiry (§67). Writes to CorporateEnquiries via the local
 * API (public create is allowed on that collection, but going through the server
 * lets us add Turnstile later — §88 — and keeps validation server-side).
 */
export async function createCorporateEnquiryAction(
  _prev: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const get = (k: string) => String(formData.get(k) ?? '').trim()

  const eventType = get('eventType')
  const name = get('name')
  const email = get('email')
  const phone = get('phone')
  const organisation = get('organisation')
  const location = get('location')
  const budget = get('budget')
  const message = get('message')
  const values = { eventType, name, email, phone, organisation, location, budget, message }

  const fieldErrors: Record<string, string> = {}
  if (!eventType || !EVENT_TYPE_VALUES.includes(eventType as never))
    fieldErrors.eventType = 'Choose an option'
  if (!name) fieldErrors.name = 'Required'
  if (!email) fieldErrors.email = 'Required'
  else if (!EMAIL_RE.test(email)) fieldErrors.email = 'Enter a valid email'
  if (!phone) fieldErrors.phone = 'Required'
  if (Object.keys(fieldErrors).length)
    return { error: 'Please correct the highlighted fields.', fieldErrors, values }

  const services = formData
    .getAll('services')
    .map(String)
    .filter((v) => CORPORATE_SERVICE_VALUES.includes(v as never))

  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'corporate-enquiries',
      data: {
        eventType: eventType as never,
        organisation: organisation || undefined,
        expectedGuests: num(formData.get('expectedGuests')),
        preferredDate: get('preferredDate')
          ? new Date(get('preferredDate')).toISOString()
          : undefined,
        durationDays: num(formData.get('durationDays')),
        location: location || undefined,
        budget: budget || undefined,
        services: services as never,
        contact: { name, email, phone },
        message: message || undefined,
      },
    })
  } catch (err) {
    console.error('Corporate enquiry failed', err)
    return { error: 'Something went wrong. Please try again.', values }
  }
  return { success: true }
}

/**
 * Custom / tailor-made trip request (§69). Writes to CustomTripRequests.
 */
export async function createCustomTripAction(
  _prev: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const get = (k: string) => String(formData.get(k) ?? '').trim()

  const name = get('name')
  const email = get('email')
  const phone = get('phone')
  const visitDates = get('visitDates')
  const budget = get('budget')
  const notes = get('notes')
  const values = { name, email, phone, visitDates, budget, notes }

  const fieldErrors: Record<string, string> = {}
  if (!name) fieldErrors.name = 'Required'
  if (!email) fieldErrors.email = 'Required'
  else if (!EMAIL_RE.test(email)) fieldErrors.email = 'Enter a valid email'
  if (Object.keys(fieldErrors).length)
    return { error: 'Please correct the highlighted fields.', fieldErrors, values }

  const interests = formData
    .getAll('interests')
    .map(String)
    .filter((v) => TRIP_INTEREST_VALUES.includes(v as never))

  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'custom-trip-requests',
      data: {
        visitDates: visitDates || undefined,
        travellers: num(formData.get('travellers')),
        days: num(formData.get('days')),
        interests: interests as never,
        budget: budget || undefined,
        needs: {
          accommodation: Boolean(formData.get('accommodation')),
          transport: Boolean(formData.get('transport')),
          airportTransfer: Boolean(formData.get('airportTransfer')),
          privateGuide: Boolean(formData.get('privateGuide')),
        },
        notes: notes || undefined,
        contact: { name, email, phone: phone || undefined },
      },
    })
  } catch (err) {
    console.error('Custom trip request failed', err)
    return { error: 'Something went wrong. Please try again.', values }
  }
  return { success: true }
}

const SERVICE_TYPES = ['airport-transfer', 'flights', 'accommodation', 'car-rental'] as const
const SERVICE_LABELS: Record<string, string> = {
  'airport-transfer': 'Airport Transfer',
  flights: 'Flights',
  accommodation: 'Accommodation',
  'car-rental': 'Car Rental',
}

const SERVICE_REQUIRED_FIELDS: Record<string, string[]> = {
  'airport-transfer': ['direction', 'airport', 'date', 'time', 'destination', 'passengers'],
  flights: ['tripType', 'from', 'to', 'departDate', 'adults'],
  accommodation: ['location', 'checkIn', 'checkOut', 'guests'],
  'car-rental': ['vehicleType', 'pickupLocation', 'startDate', 'endDate', 'driver'],
}

/**
 * Travel services enquiry (§70–§73). One generic action for all four services:
 * everything except serviceType + contact is captured into `details` (JSON) so
 * each page can define its own fields without a bespoke action.
 */
export async function createServiceRequestAction(
  _prev: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const get = (k: string) => String(formData.get(k) ?? '').trim()
  const serviceType = get('serviceType')
  const name = get('name')
  const email = get('email')
  const phone = get('phone')
  const values = { name, email, phone }

  if (!SERVICE_TYPES.includes(serviceType as never)) return { error: 'Unknown service.', values }
  const fieldErrors: Record<string, string> = {}
  if (!name) fieldErrors.name = 'Required'
  if (!email) fieldErrors.email = 'Required'
  else if (!EMAIL_RE.test(email)) fieldErrors.email = 'Enter a valid email'
  for (const field of SERVICE_REQUIRED_FIELDS[serviceType] ?? []) {
    if (!get(field)) fieldErrors[field] = 'Required'
  }

  const invalidDateOrder = (startName: string, endName: string) => {
    const start = get(startName)
    const end = get(endName)
    if (start && end && end < start) fieldErrors[endName] = 'Must be after the start date'
  }
  if (serviceType === 'flights' && get('tripType') === 'return')
    invalidDateOrder('departDate', 'returnDate')
  if (serviceType === 'accommodation') invalidDateOrder('checkIn', 'checkOut')
  if (serviceType === 'car-rental') invalidDateOrder('startDate', 'endDate')
  if (Object.keys(fieldErrors).length)
    return { error: 'Please correct the highlighted fields.', fieldErrors, values }

  const known = new Set(['serviceType', 'name', 'email', 'phone'])
  const details: Record<string, string> = {}
  for (const [k, val] of formData.entries()) {
    if (known.has(k)) continue
    const s = String(val).trim()
    if (s) details[k] = s
  }
  const summary = `${SERVICE_LABELS[serviceType]} — ${name}`

  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'travel-service-requests',
      data: {
        serviceType: serviceType as never,
        summary,
        contact: { name, email, phone: phone || undefined },
        details,
      },
    })
  } catch (err) {
    console.error('Travel service request failed', err)
    return { error: 'Something went wrong. Please try again.', values }
  }
  return { success: true }
}
