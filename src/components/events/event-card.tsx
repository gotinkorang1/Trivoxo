import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import type { EventItem } from '@/lib/data/events'
import { getEventStatus } from '@/lib/event-status'
import { dateParts, formatFromPrice } from '@/lib/format'
import { eventFromPrice } from '@/lib/payload/events'

export function EventCard({ event, now = new Date() }: { event: EventItem; now?: Date }) {
  const { day, month } = dateParts(event.startsAt)
  const status = getEventStatus(event, now)
  const price = eventFromPrice(event)

  return (
    <Link
      href={`/events/${event.slug}`}
      className="card-lift group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface-elevated shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
    >
      <div
        className="relative aspect-[16/10] overflow-hidden"
        style={{ background: event.gradient }}
      >
        {event.image && (
          <Image
            src={event.image.src}
            alt={event.image.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/8 to-transparent" />
        <div className="absolute left-4 top-4 flex size-16 flex-col items-center justify-center rounded-2xl bg-white text-brand-navy shadow-xl">
          <span className="text-2xl font-black leading-none">{day}</span>
          <span className="mt-1 text-[0.65rem] font-bold uppercase tracking-wider">{month}</span>
        </div>
        <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
          {status === 'past' ? 'Past event' : status === 'ongoing' ? 'Happening now' : 'Upcoming'}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h2 className="font-sans text-xl font-bold leading-snug tracking-normal text-text-primary transition-colors group-hover:text-brand-link">
          {event.title}
        </h2>
        <p className="mt-2 flex items-start gap-1.5 text-sm text-text-muted">
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-brand-link" aria-hidden="true" />
          <span>{[event.venue, event.location].filter(Boolean).join(', ')}</span>
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-5">
          <span className="font-bold text-text-primary">
            {price > 0 ? formatFromPrice(price) : 'Enquire for tickets'}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-brand-link">
            {status === 'past' ? 'View recap' : 'View event'}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  )
}
