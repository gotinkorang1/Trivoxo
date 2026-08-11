'use server'

import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import config from '@payload-config'
import { createEventOrderHold, EventInventoryError, type TicketSelection } from '@/lib/event-inventory'
import {
  EventPaymentError,
  freshEventOrderAccess,
  startEventCheckout,
} from '@/lib/event-payment-service'

export type EventOrderFormState = {
  error?: string
  fieldErrors?: Record<string, string>
  values?: Record<string, string>
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

function parseSelections(raw: string): TicketSelection[] {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item) => ({
        ticketTypeName: String((item as TicketSelection)?.ticketTypeName ?? ''),
        quantity: Math.floor(Number((item as TicketSelection)?.quantity ?? 0)),
      }))
      .filter((item) => item.ticketTypeName && item.quantity > 0)
  } catch {
    return []
  }
}

/** Create a held event ticket order, then send the buyer to the order page to pay. */
export async function createEventOrderAction(
  _prev: EventOrderFormState,
  formData: FormData,
): Promise<EventOrderFormState> {
  const get = (k: string) => String(formData.get(k) ?? '').trim()

  const eventSlug = get('eventSlug')
  const firstName = get('firstName')
  const lastName = get('lastName')
  const email = get('email')
  const phone = get('phone')
  const selections = parseSelections(get('selections'))
  const values = { firstName, lastName, email, phone }

  const fieldErrors: Record<string, string> = {}
  if (!firstName) fieldErrors.firstName = 'Required'
  if (!lastName) fieldErrors.lastName = 'Required'
  if (!email) fieldErrors.email = 'Required'
  else if (!EMAIL_RE.test(email)) fieldErrors.email = 'Enter a valid email'
  if (Object.keys(fieldErrors).length > 0) {
    return { error: 'Please correct the highlighted fields.', fieldErrors, values }
  }
  if (selections.length === 0) {
    return { error: 'Choose at least one ticket to continue.', values }
  }

  let orderReference: string | undefined
  let accessToken: string | undefined
  try {
    const payload = await getPayload({ config })
    const found = await payload.find({
      collection: 'events',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { and: [{ slug: { equals: eventSlug } }, { _status: { equals: 'published' } }] },
    })
    const event = found.docs[0]
    if (!event) return { error: 'That event could not be found.', values }

    const { order } = await createEventOrderHold(payload, {
      event,
      selections,
      buyer: { firstName, lastName, email, phone: phone || undefined },
      source: 'website',
    })
    orderReference = order.reference ?? undefined
    if (orderReference) accessToken = freshEventOrderAccess(orderReference)
  } catch (err) {
    if (err instanceof EventInventoryError) return { error: err.message, values }
    console.error('Event order creation failed', err)
    return { error: 'Something went wrong creating your order. Please try again.', values }
  }

  if (!orderReference || !accessToken) {
    return { error: 'Your order was created but could not be opened. Please contact us.', values }
  }

  const query = new URLSearchParams({ access: accessToken }).toString()
  redirect(`/events/order/${encodeURIComponent(orderReference)}?${query}`)
}

/** Start Paystack checkout for an existing held order. */
export async function startEventCheckoutAction(formData: FormData): Promise<never> {
  const reference = String(formData.get('reference') ?? '')
    .trim()
    .toUpperCase()
  const access = String(formData.get('access') ?? '').trim()
  let checkoutURL: string | undefined
  let failureCode = 'checkout_error'

  try {
    const payload = await getPayload({ config })
    const checkout = await startEventCheckout(payload, reference, access)
    checkoutURL = checkout.authorizationURL
  } catch (error) {
    if (error instanceof EventPaymentError) failureCode = error.code.toLowerCase()
    else console.error('Event Paystack checkout failed', error)
  }

  if (checkoutURL) redirect(checkoutURL)

  const query = new URLSearchParams({ access, payment: failureCode }).toString()
  redirect(`/events/order/${encodeURIComponent(reference)}?${query}`)
}
