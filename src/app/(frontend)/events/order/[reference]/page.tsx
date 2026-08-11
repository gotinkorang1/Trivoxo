import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Ticket,
  WalletCards,
} from 'lucide-react'
import config from '@payload-config'
import { Container } from '@/components/ui/container'
import { ButtonLink } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HoldCountdown } from '@/components/booking/hold-countdown'
import { PaystackCheckoutButton } from '@/components/booking/paystack-checkout-button'
import { startEventCheckoutAction } from '@/app/actions/event-order'
import { formatDateTime, formatPrice } from '@/lib/format'
import { whatsappLink } from '@/lib/constants'
import { verifyBookingAccessToken } from '@/lib/booking-access'
import { isEventOrderHoldActive } from '@/lib/event-inventory'
import { createTicketToken } from '@/lib/ticket-token'
import { qrSvg } from '@/lib/qr'

export const metadata: Metadata = {
  title: 'Your tickets',
  robots: { index: false },
  referrer: 'no-referrer',
}

export default async function EventOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>
  searchParams: Promise<{ access?: string; payment?: string }>
}) {
  const { reference } = await params
  const { access } = await searchParams
  if (!verifyBookingAccessToken(reference, access)) notFound()

  const payload = await getPayload({ config })
  const found = await payload.find({
    collection: 'event-orders',
    where: { reference: { equals: reference } },
    depth: 1,
    limit: 1,
  })
  const order = found.docs[0]
  if (!order) notFound()

  const event = order.event
  const eventTitle = event && typeof event === 'object' ? event.title : 'Your event'
  const eventWhen =
    event && typeof event === 'object' && event.startsAt ? formatDateTime(event.startsAt) : undefined
  const confirmed = order.inventoryState === 'confirmed'
  const holdActive = isEventOrderHoldActive(order)
  const paymentReview = order.status === 'payment_review'
  const waMessage = `Hi Trivoxo, I'm following up on my ticket order ${order.reference} for ${eventTitle}.`

  // Signed QR per issued ticket (only when the order is confirmed & paid).
  const tickets = confirmed
    ? (
        await payload.find({
          collection: 'event-tickets',
          where: { order: { equals: order.id } },
          depth: 0,
          limit: 200,
          sort: 'createdAt',
        })
      ).docs
    : []
  const ticketQrs = await Promise.all(
    tickets.map(async (t) => ({ ticket: t, svg: await qrSvg(createTicketToken(t.reference || '')) })),
  )

  return (
    <Container className="max-w-2xl py-14 sm:py-20">
      <div className="text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-accent-soft text-brand-accent">
          <CheckCircle2 className="size-8" />
        </span>
        <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">
          {paymentReview
            ? 'Payment received — we’re checking your tickets'
            : confirmed
              ? 'You’re going 🎉'
              : holdActive
                ? 'Your tickets are on hold 🎉'
                : 'Order saved'}
        </h1>
        <p className="mt-3 text-text-secondary">
          Thanks{order.buyer?.firstName ? `, ${order.buyer.firstName}` : ''}!{' '}
          {confirmed
            ? 'Your tickets are below — bring the QR codes to the event.'
            : holdActive
              ? 'We’ve reserved your tickets while you complete secure payment.'
              : paymentReview
                ? 'Your payment is recorded and the team will confirm your tickets.'
                : 'Your order is saved, but tickets are no longer reserved.'}
        </p>
        {holdActive && order.holdExpiresAt && (
          <div className="mt-4 text-sm">
            <HoldCountdown expiresAt={order.holdExpiresAt} />
          </div>
        )}
      </div>

      <div className="mt-8 overflow-hidden rounded-card border border-border bg-surface-elevated">
        <div className="flex items-center justify-between gap-4 border-b border-border bg-surface px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted">Order reference</p>
            <p className="font-mono text-lg font-semibold text-text-primary">{order.reference}</p>
          </div>
          <Badge tone={confirmed ? 'new' : holdActive ? 'popular' : 'limited'}>
            {paymentReview ? 'Finance review' : confirmed ? 'Confirmed' : holdActive ? 'On hold' : 'Hold expired'}
          </Badge>
        </div>
        <dl className="divide-y divide-border px-6">
          <Row label="Event" value={eventTitle} />
          {eventWhen && (
            <Row label="Date" icon={<CalendarClock className="size-4 text-text-muted" />} value={eventWhen} />
          )}
          {(order.items ?? []).map((item, i) => (
            <Row
              key={i}
              label={`${item.quantity} × ${item.ticketTypeName}`}
              value={formatPrice(item.unitPrice * item.quantity)}
            />
          ))}
          {typeof order.totalAmount === 'number' && order.totalAmount > 0 && (
            <Row label={confirmed || paymentReview ? 'Amount paid' : 'Total due'} value={formatPrice(order.totalAmount)} />
          )}
        </dl>
      </div>

      {holdActive && !confirmed && !paymentReview && (
        <div className="mt-6 overflow-hidden rounded-card border border-brand-primary/35 bg-surface-elevated shadow-lift">
          <div className="border-b border-border bg-brand-primary-soft px-6 py-4">
            <p className="flex items-center gap-2 font-semibold text-text-primary">
              <WalletCards className="size-5 text-brand-primary" /> Pay for your tickets
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Paystack securely processes Mobile Money, cards and bank payments.
            </p>
          </div>
          <form action={startEventCheckoutAction} className="p-6">
            <input type="hidden" name="reference" value={order.reference ?? reference} />
            <input type="hidden" name="access" value={access} />
            <PaystackCheckoutButton />
            <p className="mt-3 flex items-start justify-center gap-2 text-center text-xs leading-5 text-text-muted">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-accent" /> Your amount is calculated on the
              server. Tickets are issued only after Paystack verifies the payment.
            </p>
          </form>
        </div>
      )}

      {paymentReview && (
        <div className="mt-6 rounded-card border border-warning/35 bg-warning/10 p-6">
          <p className="flex items-center gap-2 font-semibold text-text-primary">
            <AlertTriangle className="size-5 text-warning" /> No second payment is needed
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Your payment reached Trivoxo, but automatic ticket confirmation was not safe. The team will confirm
            your tickets or arrange the appropriate refund.
          </p>
        </div>
      )}

      {confirmed && ticketQrs.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 flex items-center gap-2 font-semibold text-text-primary">
            <Ticket className="size-5 text-brand-primary" /> Your {ticketQrs.length} ticket
            {ticketQrs.length === 1 ? '' : 's'}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {ticketQrs.map(({ ticket, svg }) => (
              <div key={ticket.id} className="rounded-card border border-border bg-surface-elevated p-5 text-center">
                <div
                  className="mx-auto w-40 [&>svg]:h-auto [&>svg]:w-full"
                  aria-label={`QR code for ticket ${ticket.reference}`}
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
                <p className="mt-3 font-mono text-sm font-semibold text-text-primary">{ticket.reference}</p>
                <p className="text-xs uppercase tracking-wide text-brand-primary">{ticket.ticketTypeName}</p>
                {ticket.attendeeName && (
                  <p className="mt-1 text-sm text-text-secondary">{ticket.attendeeName}</p>
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-text-muted">
            Present each QR at the gate. Every ticket can be scanned once.
          </p>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href={whatsappLink(waMessage)} external variant="primary" className="flex-1">
          <MessageCircle className="size-4" /> Message us on WhatsApp
        </ButtonLink>
        <ButtonLink href="/events" variant="outline" className="flex-1">
          Browse more events
        </ButtonLink>
      </div>
    </Container>
  )
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
