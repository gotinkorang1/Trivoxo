import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { PageHero } from '@/components/site/page-hero'
import { getAllEvents, eventFromPrice } from '@/lib/payload/events'
import { dateParts, formatFromPrice } from '@/lib/format'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Events',
  description: 'Trivoxo events across Ghana — adventure weekends, sunset sessions and curated experiences.',
}

export default async function EventsPage() {
  const all = await getAllEvents()
  const events = [...all].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Good energy deserves a date"
        description="Adventure weekends, sunset sessions and memorable Ghana moments — secure your spot before they sell out."
      />
      <Container className="py-16 sm:py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const { day, month } = dateParts(event.startsAt)
            return (
              <Link
                key={event.slug}
                href={`/events/${event.slug}`}
                className="card-lift group flex flex-col overflow-hidden rounded-card border border-border bg-surface-elevated shadow-soft"
              >
                <div className="relative aspect-[16/10] overflow-hidden" style={{ background: event.gradient }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/48 to-transparent" />
                  <div className="absolute left-4 top-4 flex size-16 flex-col items-center justify-center rounded-2xl bg-white text-brand-navy shadow-xl">
                    <span className="text-2xl font-black leading-none">{day}</span>
                    <span className="mt-1 text-[0.65rem] font-bold uppercase tracking-wider">{month}</span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-xl font-semibold leading-snug text-text-primary transition-colors group-hover:text-brand-link">{event.title}</h2>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-text-muted">
                    <MapPin className="size-3.5 text-brand-link" aria-hidden="true" /> {event.venue}, {event.location}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                    <span className="font-bold text-text-primary">{formatFromPrice(eventFromPrice(event))}</span>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-brand-link">
                      Get tickets <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </Container>
    </>
  )
}
