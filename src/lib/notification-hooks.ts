import type { CollectionAfterChangeHook } from 'payload'
import type { Booking } from '@/payload-types'
import { queueBookingConfirmation } from '@/lib/notifications'

/** Queue one confirmation when a booking first reaches paid + confirmed. */
export const queueBookingConfirmationAfterChange: CollectionAfterChangeHook<Booking> = async ({
  doc,
  req,
}) => {
  if (
    doc.inventoryState === 'confirmed' &&
    doc.paymentState === 'paid' &&
    doc.reference &&
    doc.booker?.email
  ) {
    await queueBookingConfirmation(req.payload, doc, { req })
  }

  return doc
}
