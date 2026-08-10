import config from '@payload-config'
import { getPayload } from 'payload'
import { bookingHasFulfilmentAccess, findGuestBooking } from '@/lib/guest-booking'
import { renderBookingVoucher } from '@/lib/voucher'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reference: string }> },
): Promise<Response> {
  const { reference } = await params
  const access = new URL(request.url).searchParams.get('access')
  const payload = await getPayload({ config })
  const booking = await findGuestBooking(payload, reference, access)

  if (!booking) return new Response('Not found', { status: 404 })
  if (!bookingHasFulfilmentAccess(booking)) {
    return new Response('Voucher is available after payment and booking confirmation.', {
      status: 409,
    })
  }

  const buffer = await renderBookingVoucher(booking)
  const safeReference = (booking.reference || reference).replace(/[^a-z0-9-]/gi, '')
  return new Response(new Uint8Array(buffer), {
    headers: {
      'Cache-Control': 'private, no-store, max-age=0',
      'Content-Disposition': `attachment; filename="Trivoxo-${safeReference}-voucher.pdf"`,
      'Content-Length': String(buffer.byteLength),
      'Content-Type': 'application/pdf',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
