import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { CheckCircle2, MessageCircle, CalendarClock, Users } from 'lucide-react'
import config from '@payload-config'
import { Container } from '@/components/ui/container'
import { ButtonLink } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatPrice } from '@/lib/format'
import { whatsappLink } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Booking received',
  robots: { index: false },
}

export default async function BookingConfirmationPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params
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
  const waMessage = `Hi Trivoxo, I've just requested a booking (${booking.reference}) for ${experienceName}. I'd like to confirm availability.`

  return (
    <Container className="max-w-2xl py-14 sm:py-20">
      <div className="text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-accent-soft text-brand-accent">
          <CheckCircle2 className="size-8" />
        </span>
        <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">Booking request received 🎉</h1>
        <p className="mt-3 text-text-secondary">
          Thanks{booking.booker?.firstName ? `, ${booking.booker.firstName}` : ''}! We’ve logged your request and
          will confirm availability shortly.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-card border border-border bg-surface-elevated">
        <div className="flex items-center justify-between gap-4 border-b border-border bg-surface px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted">Booking reference</p>
            <p className="font-mono text-lg font-semibold text-text-primary">{booking.reference}</p>
          </div>
          <Badge tone="popular">Awaiting confirmation</Badge>
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
              booking.children ? `, ${booking.children} child${booking.children === 1 ? '' : 'ren'}` : ''
            })`}
          />
          {typeof booking.totalAmount === 'number' && booking.totalAmount > 0 && (
            <Row label="Estimated total" value={`${formatPrice(booking.totalAmount)} (to be confirmed)`} />
          )}
        </dl>
      </div>

      {/* Next steps */}
      <div className="mt-6 rounded-card border border-border bg-surface p-6">
        <p className="font-semibold text-text-primary">What happens next</p>
        <ol className="mt-3 space-y-2 text-sm text-text-secondary">
          <li>1. We confirm availability for your date and group size.</li>
          <li>2. You receive final pricing (including any group discount) and secure payment options.</li>
          <li>3. Once paid, your spot is confirmed and your voucher is issued.</li>
        </ol>
        <p className="mt-4 text-xs text-text-muted">
          Online payment (Mobile Money & cards) is coming soon. For now our team will reach out to complete your
          booking.
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
