import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarDays, Check, ChevronRight, MapPin } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { TicketCheckoutCard } from '@/components/events/ticket-checkout-card'
import { getAllEvents, getEventBySlug } from '@/lib/payload/events'
import { formatDateTime } from '@/lib/format'
import { JsonLd, eventSchema } from '@/components/seo/structured-data'
import { getEventStatus } from '@/lib/event-status'

export const revalidate = 60

export async function generateStaticParams() {
  const events = await getAllEvents()
  return events.map((event) => ({ slug: event.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) return { title: 'Event not found' }
  return {
    title: event.title,
    description: event.blurb,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      title: event.title,
      description: event.blurb,
      type: 'website',
      url: `/events/${event.slug}`,
      images: event.image ? [{ url: event.image.src, alt: event.image.alt }] : ['/og'],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description: event.blurb,
      images: [event.image?.src || '/og'],
    },
  }
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) notFound()

  const now = new Date()
  const eventStatus = getEventStatus(event, now)

  return (
    <article>
      <JsonLd data={eventSchema(event)} />
      <div className="relative overflow-hidden text-white" style={{ background: event.gradient }}>
        {event.image && (
          <Image
            src={event.image.src}
            alt={event.image.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/25" />
        <Container className="relative flex min-h-[320px] flex-col justify-end py-8 sm:min-h-[420px]">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-sm text-white/75"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <Link href="/events" className="hover:text-white">
              Events
            </Link>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <span className="text-white">{event.title}</span>
          </nav>
          <div className="mt-auto max-w-3xl">
            <span className="rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-md">
              {eventStatus === 'past'
                ? 'Past event'
                : eventStatus === 'ongoing'
                  ? 'Happening now'
                  : 'Upcoming event'}
            </span>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-5xl">{event.title}</h1>
            <p className="mt-3 max-w-xl text-white/85">{event.blurb}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/90">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden="true" />{' '}
                {formatDateTime(event.startsAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" aria-hidden="true" />{' '}
                {[event.venue, event.location].filter(Boolean).join(', ')}
              </span>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0 space-y-10">
            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">About</h2>
              <p className="leading-relaxed text-text-secondary">{event.about}</p>
            </section>
            {event.whatToExpect.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-semibold text-text-primary">What to expect</h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {event.whatToExpect.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-text-secondary">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-brand-accent"
                        aria-hidden="true"
                      />{' '}
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {event.included && event.included.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-semibold text-text-primary">What’s included</h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {event.included.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-text-secondary">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-brand-accent"
                        aria-hidden="true"
                      />{' '}
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <TicketCheckoutCard
              eventSlug={slug}
              eventTitle={event.title}
              eventDate={formatDateTime(event.startsAt)}
              eventStatus={eventStatus}
              ticketTypes={event.ticketTypes}
              now={now.toISOString()}
            />
          </aside>
        </div>
      </Container>
    </article>
  )
}
