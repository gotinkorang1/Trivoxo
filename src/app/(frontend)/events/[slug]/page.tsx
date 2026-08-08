import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, MapPin, CalendarDays, MessageCircle, Check } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { ButtonLink } from '@/components/ui/button'
import { EVENTS, getEventBySlug } from '@/lib/data/events'
import { formatDateTime, formatPrice } from '@/lib/format'
import { whatsappLink } from '@/lib/constants'

export function generateStaticParams() {
  return EVENTS.map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const ev = getEventBySlug(slug)
  if (!ev) return { title: 'Event not found' }
  return { title: ev.title, description: ev.blurb, openGraph: { title: ev.title, description: ev.blurb } }
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ev = getEventBySlug(slug)
  if (!ev) notFound()

  const waMessage = `Hi Trivoxo, I'd like tickets for ${ev.title} on ${formatDateTime(ev.startsAt)}.`

  return (
    <article>
      {/* Hero */}
      <div className="relative overflow-hidden text-white" style={{ background: ev.gradient }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/20" />
        <Container className="relative flex min-h-[300px] flex-col justify-end py-8 sm:min-h-[380px]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-white/75">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="size-3.5" />
            <Link href="/events" className="hover:text-white">Events</Link>
            <ChevronRight className="size-3.5" />
            <span className="text-white">{ev.title}</span>
          </nav>
          <div className="mt-auto max-w-2xl">
            <h1 className="text-3xl font-semibold sm:text-5xl">{ev.title}</h1>
            <p className="mt-3 max-w-xl text-white/85">{ev.blurb}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/90">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" /> {formatDateTime(ev.startsAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" /> {ev.venue}, {ev.location}
              </span>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Main */}
          <div className="min-w-0 space-y-10">
            <section>
              <h2 className="mb-3 text-xl font-semibold">About</h2>
              <p className="text-text-secondary">{ev.about}</p>
            </section>
            <section>
              <h2 className="mb-4 text-xl font-semibold">What to expect</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {ev.whatToExpect.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-text-secondary">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand-accent" /> {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Tickets */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-card border border-border bg-surface-elevated p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Tickets</h2>
              <ul className="mt-4 space-y-3">
                {ev.ticketTypes.map((t) => (
                  <li key={t.name} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-text-primary">{t.name}</p>
                      {t.note && <p className="text-xs text-text-muted">{t.note}</p>}
                    </div>
                    <span className="text-sm font-semibold text-text-primary">
                      {t.soldOut ? <span className="text-danger">Sold out</span> : formatPrice(t.price)}
                    </span>
                  </li>
                ))}
              </ul>
              <ButtonLink href={whatsappLink(waMessage)} external variant="primary" size="lg" className="mt-5 w-full">
                <MessageCircle className="size-4" /> Get tickets
              </ButtonLink>
              <p className="mt-3 text-center text-xs text-text-muted">
                Online ticketing is coming soon — reserve via WhatsApp for now.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </article>
  )
}
