import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import {
  AlertTriangle,
  CalendarPlus,
  CalendarClock,
  CheckCircle2,
  FileDown,
  MessageCircle,
  ShieldCheck,
  Users,
  WalletCards,
} from 'lucide-react'
import config from '@payload-config'
import { Container } from '@/components/ui/container'
import { ButtonLink } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HoldCountdown } from '@/components/booking/hold-countdown'
import { formatDate, formatPrice } from '@/lib/format'
import { whatsappLink } from '@/lib/constants'
import { isBookingHoldActive } from '@/lib/booking-inventory'
import { verifyBookingAccessToken } from '@/lib/booking-access'
import { startPaystackCheckoutAction } from '@/app/actions/payment'
import { PaystackCheckoutButton } from '@/components/booking/paystack-checkout-button'

export const metadata: Metadata = {
  title: 'Booking received',
  robots: { index: false },
  referrer: 'no-referrer',
}

export default async function BookingConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>
  searchParams: Promise<{ access?: string; payment?: string }>
}) {
  const { reference } = await params
  const { access, payment: paymentResult } = await searchParams
  if (!verifyBookingAccessToken(reference, access)) notFound()

  const payload = await getPayload({ config })
  const found = await payload.find({
    collection: 'bookings',
    where: { reference: { equals: reference } },
    depth: 1,
    limit: 1,
  })
  const booking = found.docs[0]
  if (!booking) notFound()

  const experience = booking.experience
  const experienceName =
    experience && typeof experience === 'object' ? experience.title : 'Your experience'
  const travellers = (booking.adults ?? 0) + (booking.children ?? 0)
  const holdExpiresAt = booking.holdExpiresAt ?? undefined
  const holdActive = isBookingHoldActive(booking)
  const confirmed = booking.inventoryState === 'confirmed'
  const paymentReview = booking.status === 'payment_review'
  const waMessage = paymentReview
    ? `Hi Trivoxo, my payment for booking ${booking.reference} needs review. Please help me.`
    : `Hi Trivoxo, I'm following up on booking ${booking.reference} for ${experienceName}.`
  const paymentFeedback = paymentMessage(paymentResult)
  const resourceQuery = new URLSearchParams({ access: access || '' }).toString()
  const encodedReference = encodeURIComponent(booking.reference || reference)
  const voucherHref = `/api/bookings/${encodedReference}/voucher?${resourceQuery}`
  const calendarHref = `/api/bookings/${encodedReference}/calendar?${resourceQuery}`

  return (
    <Container className="max-w-2xl py-14 sm:py-20">
      <div className="text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-accent-soft text-brand-accent">
          <CheckCircle2 className="size-8" />
        </span>
        <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">
          {paymentReview
            ? 'Payment received — we’re checking your seats'
            : confirmed
              ? 'Your booking is confirmed 🎉'
              : holdActive
                ? 'Your seats are on hold 🎉'
                : 'Booking request saved'}
        </h1>
        <p className="mt-3 text-text-secondary">
          Thanks{booking.booker?.firstName ? `, ${booking.booker.firstName}` : ''}!{' '}
          {paymentReview
            ? 'Your payment is recorded. Trivoxo will confirm capacity or arrange the right resolution.'
            : confirmed
              ? 'Your places are secured.'
              : holdActive
                ? 'We have temporarily reserved capacity for your group.'
                : 'Your details are saved, but capacity is no longer reserved.'}
        </p>
        {holdActive && holdExpiresAt && (
          <div className="mt-4 text-sm">
            <HoldCountdown expiresAt={holdExpiresAt} />
          </div>
        )}
        {paymentFeedback && (
          <div
            className={`mt-5 rounded-2xl border px-4 py-3 text-left text-sm ${
              paymentFeedback.tone === 'success'
                ? 'border-success/30 bg-success/10 text-success'
                : paymentFeedback.tone === 'warning'
                  ? 'border-warning/35 bg-warning/10 text-text-primary'
                  : 'border-danger/30 bg-danger/10 text-danger'
            }`}
            role="status"
          >
            <p className="font-semibold">{paymentFeedback.title}</p>
            <p className="mt-1 text-current/80">{paymentFeedback.body}</p>
          </div>
        )}
      </div>

      <div className="mt-8 overflow-hidden rounded-card border border-border bg-surface-elevated">
        <div className="flex items-center justify-between gap-4 border-b border-border bg-surface px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted">Booking reference</p>
            <p className="font-mono text-lg font-semibold text-text-primary">{booking.reference}</p>
          </div>
          <Badge tone={confirmed ? 'new' : holdActive ? 'popular' : 'limited'}>
            {paymentReview
              ? 'Finance review'
              : confirmed
                ? 'Confirmed'
                : holdActive
                  ? 'Seats held'
                  : 'Hold expired'}
          </Badge>
        </div>
        <dl className="divide-y divide-border px-6">
          <Row label="Experience" value={experienceName} />
          <Row
            label="Date"
            icon={<CalendarClock className="size-4 text-text-muted" />}
            value={booking.departureDate ? formatDate(booking.departureDate) : '—'}
          />
          <Row
            label="Travellers"
            icon={<Users className="size-4 text-text-muted" />}
            value={`${travellers} (${booking.adults ?? 0} adult${booking.adults === 1 ? '' : 's'}${
              booking.children
                ? `, ${booking.children} child${booking.children === 1 ? '' : 'ren'}`
                : ''
            })`}
          />
          {typeof booking.totalAmount === 'number' && booking.totalAmount > 0 && (
            <Row
              label={confirmed || paymentReview ? 'Amount paid' : 'Total due'}
              value={formatPrice(booking.totalAmount)}
            />
          )}
        </dl>
      </div>

      {holdActive && !confirmed && !paymentReview && (
        <div className="mt-6 overflow-hidden rounded-card border border-brand-primary/35 bg-surface-elevated shadow-lift">
          <div className="border-b border-border bg-brand-primary-soft px-6 py-4">
            <p className="flex items-center gap-2 font-semibold text-text-primary">
              <WalletCards className="size-5 text-brand-link" /> Complete your booking
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Paystack securely processes Mobile Money, cards, and enabled bank payment methods.
            </p>
          </div>
          <form action={startPaystackCheckoutAction} className="p-6">
            <input type="hidden" name="reference" value={booking.reference ?? reference} />
            <input type="hidden" name="access" value={access} />
            <PaystackCheckoutButton />
            <p className="mt-3 flex items-start justify-center gap-2 text-center text-xs leading-5 text-text-muted">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-accent" /> Your amount is
              calculated on the server. Trivoxo confirms your seats only after Paystack verifies the
              payment.
            </p>
          </form>
        </div>
      )}

      {paymentReview && (
        <div className="mt-6 rounded-card border border-warning/35 bg-warning/10 p-6">
          <p className="flex items-center gap-2 font-semibold text-text-primary">
            <AlertTriangle className="size-5 text-warning" /> No action or second payment is needed
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            The payment reached Trivoxo, but automatic inventory confirmation was not safe. The team
            will confirm an alternative departure or arrange the appropriate refund.
          </p>
        </div>
      )}

      {confirmed && (
        <div className="mt-6 rounded-card border border-border bg-surface-elevated p-6 shadow-soft">
          <p className="font-semibold text-text-primary">Your trip documents are ready</p>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            Keep the voucher on your phone and add the departure to your calendar. Both links are
            private to this booking.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={voucherHref} variant="secondary" className="flex-1">
              <FileDown className="size-4" /> Download voucher
            </ButtonLink>
            <ButtonLink href={calendarHref} variant="outline" className="flex-1">
              <CalendarPlus className="size-4" /> Add to calendar
            </ButtonLink>
          </div>
        </div>
      )}

      {/* Next steps */}
      <div className="mt-6 rounded-card border border-border bg-surface p-6">
        <p className="font-semibold text-text-primary">What happens next</p>
        <ol className="mt-3 space-y-2 text-sm text-text-secondary">
          {confirmed ? (
            <>
              <li>1. Your payment has been verified and your places are secured.</li>
              <li>2. Trivoxo will share final pickup and guide details before departure.</li>
              <li>3. Keep this booking reference available when contacting the team.</li>
            </>
          ) : paymentReview ? (
            <>
              <li>1. Do not make another payment for this booking.</li>
              <li>2. Trivoxo will review capacity and contact you with the resolution.</li>
              <li>3. Use WhatsApp below if you need immediate support.</li>
            </>
          ) : (
            <>
              <li>1. Complete the secure Paystack checkout before the hold expires.</li>
              <li>2. The server verifies the reference, amount, currency, and payment status.</li>
              <li>
                3. Verified payment converts your held seats to confirmed seats automatically.
              </li>
            </>
          )}
        </ol>
        <p className="mt-4 text-xs text-text-muted">
          {confirmed
            ? 'Payment confirmation is based on Paystack server verification, not the browser return screen.'
            : holdActive
              ? 'The temporary hold releases automatically if secure checkout is not completed in time.'
              : 'This hold has expired. Message Trivoxo to check the latest capacity before paying.'}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href={whatsappLink(waMessage)} external variant="primary" className="flex-1">
          <MessageCircle className="size-4" /> Message us on WhatsApp
        </ButtonLink>
        <ButtonLink href="/experiences" variant="outline" className="flex-1">
          Browse more experiences
        </ButtonLink>
      </div>
    </Container>
  )
}

function paymentMessage(
  code?: string,
): { tone: 'success' | 'warning' | 'danger'; title: string; body: string } | undefined {
  if (!code) return undefined
  if (code === 'confirmed') {
    return {
      tone: 'success',
      title: 'Payment verified',
      body: 'Paystack confirmed the exact amount and your booking inventory is secured.',
    }
  }
  if (code === 'review') {
    return {
      tone: 'warning',
      title: 'Payment received for review',
      body: 'Your money is recorded, but Trivoxo needs to resolve an inventory or verification mismatch.',
    }
  }
  if (code === 'pending' || code === 'checkout_pending') {
    return {
      tone: 'warning',
      title: 'Payment is still being checked',
      body: 'Please wait a moment and refresh this page. Do not submit a second payment.',
    }
  }
  if (code === 'already_paid') {
    return {
      tone: 'success',
      title: 'This booking is already paid',
      body: 'No additional payment is required.',
    }
  }
  if (code === 'hold_expired') {
    return {
      tone: 'danger',
      title: 'The seat hold expired',
      body: 'Start a new booking or contact Trivoxo before making payment.',
    }
  }
  return {
    tone: 'danger',
    title: 'Secure checkout could not start',
    body: 'No charge was made. Please try again or contact Trivoxo if the problem continues.',
  }
}

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="flex items-center gap-1.5 text-right text-sm font-medium text-text-primary">
        {icon}
        {value}
      </dd>
    </div>
  )
}
