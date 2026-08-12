import type { CollectionAfterChangeHook } from 'payload'
import type { Booking, Payment, Review, EventOrder } from '@/payload-types'
import { emitAdminNotificationsFromHook } from '@/lib/admin-notifications'
import { formatPrice } from '@/lib/format'

/** Admin edit path for a document. */
function editPath(slug: string, id: number | string): string {
  return `/admin/collections/${slug}/${id}`
}

/** Best-effort contact label from an enquiry doc's varying shapes. */
function contactLabel(doc: Record<string, unknown>): string | undefined {
  const contact = (doc.contact as { name?: string; email?: string } | undefined) ?? undefined
  const name = contact?.name ?? (doc.name as string | undefined)
  const email = contact?.email ?? (doc.email as string | undefined)
  return [name, email].filter(Boolean).join(' · ') || undefined
}

/** New booking → Operations & Finance. */
export const notifyNewBooking: CollectionAfterChangeHook<Booking> = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create' || !doc.reference) return doc
  const party = (doc.adults ?? 0) + (doc.children ?? 0)
  const amount = typeof doc.totalAmount === 'number' ? ` · ${formatPrice(doc.totalAmount)}` : ''
  await emitAdminNotificationsFromHook(req, {
    category: 'booking',
    title: `New booking ${doc.reference}`,
    message: `${party} traveller${party === 1 ? '' : 's'}${amount}`,
    adminURL: editPath('bookings', doc.id),
    dedupeBase: `booking-created:${doc.id}`,
  })
  return doc
}

/** Payment reaching "succeeded" → Operations & Finance (covers bookings and event orders). */
export const notifyPaymentSucceeded: CollectionAfterChangeHook<Payment> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const justSucceeded =
    doc.status === 'succeeded' && (operation === 'create' || previousDoc?.status !== 'succeeded')
  if (!justSucceeded) return doc
  const cedis = typeof doc.amountMinor === 'number' ? Math.round(doc.amountMinor / 100) : undefined
  await emitAdminNotificationsFromHook(req, {
    category: 'payment',
    title: `Payment received${doc.reference ? ` ${doc.reference}` : ''}`,
    message: cedis !== undefined ? formatPrice(cedis) : undefined,
    adminURL: editPath('payments', doc.id),
    dedupeBase: `payment-succeeded:${doc.id}`,
  })
  return doc
}

/** New review (pending approval) → Content & Operations. */
export const notifyNewReview: CollectionAfterChangeHook<Review> = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc
  await emitAdminNotificationsFromHook(req, {
    category: 'review',
    title: `New review: ${doc.title} (${doc.rating}★)`,
    message: doc.authorName ? `by ${doc.authorName}` : undefined,
    adminURL: editPath('reviews', doc.id),
    dedupeBase: `review-created:${doc.id}`,
  })
  return doc
}

/** New event ticket order → Operations, Finance & Event Managers. */
export const notifyNewEventOrder: CollectionAfterChangeHook<EventOrder> = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create' || !doc.reference) return doc
  await emitAdminNotificationsFromHook(req, {
    category: 'event_order',
    title: `New ticket order ${doc.reference}`,
    adminURL: editPath('event-orders', doc.id),
    dedupeBase: `event-order-created:${doc.id}`,
  })
  return doc
}

/** Factory for the three enquiry collections → Operations. */
export function makeEnquiryNotifier(
  slug: string,
  label: string,
): CollectionAfterChangeHook {
  return async ({ doc, operation, req }) => {
    if (operation !== 'create') return doc
    const record = doc as Record<string, unknown>
    await emitAdminNotificationsFromHook(req, {
      category: 'enquiry',
      title: `New ${label} enquiry`,
      message: contactLabel(record),
      adminURL: editPath(slug, record.id as number),
      dedupeBase: `enquiry-${slug}:${record.id}`,
    })
    return doc
  }
}
