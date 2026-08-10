import { renderToBuffer } from '@react-pdf/renderer'
import type { Booking } from '@/payload-types'
import { BookingVoucherDocument } from '@/documents/BookingVoucher'
import { bookingMaterialFrom } from '@/lib/booking-materials'

export async function renderBookingVoucher(booking: Booking): Promise<Buffer> {
  return renderToBuffer(<BookingVoucherDocument booking={bookingMaterialFrom(booking)} />)
}
