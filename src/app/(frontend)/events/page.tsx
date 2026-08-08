import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { getAllEvents, eventFromPrice } from '@/lib/payload/events'
import { dateParts, formatFromPrice } from '@/lib/format'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Events',
  description: 'Trivoxo events across Ghana — sunset sessions, December nights and lake cruises. Get your tickets.',
}

export default async function EventsPage() {
  const all = await getAllEvents()
  const events = [...all].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))

  return (
    <Container className="py-10 sm:py-14">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-primary">Events</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Upcoming events</h1>
        <p className="mt-2 max-w-2xl text-text-secondary">
          Sunset sessions, December nights and lake cruises — secure your spot before they sell out.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((ev) => {
          const { day, month } = dateParts(ev.startsAt)
          return (
            <Link
              key={ev.slug}
              href={`/events/${ev.slug}`}
              className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface-elevated transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[16/10]" style={{ background: ev.gradient }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute left-4 top-4 flex flex-col items-center rounded-xl bg-white/95 px-3 py-2 text-brand-navy shadow">
                  <span className="text-xl font-bold leading-none">{day}</span>
                  <span className="text-xs font-semibold">{month}</span>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-display text-lg leading-snug text-text-primary group-hover:text-brand-primary">
                  {ev.title}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-text-muted">
                  <MapPin className="size-3.5" /> {ev.venue}, {ev.location}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-sm font-semibold text-text-primary">{formatFromPrice(eventFromPrice(ev))}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary">
                    Get tickets <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </Container>
  )
}
