import type { Payload } from 'payload'
import type { Booking } from '@/payload-types'
import { verifyBookingAccessToken } from '@/lib/booking-access'

export async function findGuestBooking(
  payload: Payload,
  reference: string,
  access: string | null | undefined,
  depth = 2,
): Promise<Booking | undefined> {
  if (!verifyBookingAccessToken(reference, access)) return undefined
  const found = await payload.find({
    collection: 'bookings',
    depth,
    limit: 1,
    overrideAccess: true,
    where: { reference: { equals: reference } },
  })
  return found.docs[0]
}

export function bookingHasFulfilmentAccess(booking: Booking): boolean {
  return booking.inventoryState === 'confirmed' && booking.paymentState === 'paid'
}
