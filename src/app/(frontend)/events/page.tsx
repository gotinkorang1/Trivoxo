import type { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { PageHero } from '@/components/site/page-hero'
import { EventCard } from '@/components/events/event-card'
import { getAllEvents } from '@/lib/payload/events'
import { getEventStatus } from '@/lib/event-status'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Events',
  description:
    'Trivoxo events across Ghana — adventure weekends, sunset sessions and curated experiences.',
}

export default async function EventsPage() {
  const all = await getAllEvents()
  const now = new Date()
  const upcoming = all
    .filter((event) => getEventStatus(event, now) !== 'past')
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
  const past = all
    .filter((event) => getEventStatus(event, now) === 'past')
    .sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt))

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Good energy deserves a date"
        description="Adventure weekends, sunset sessions and memorable Ghana moments — with clear dates and honest availability."
        image={{ src: '/images/accra-night.jpg', alt: 'Accra lit up at night' }}
      />
      <Container className="py-16 sm:py-20">
        <section aria-labelledby="upcoming-events">
          <h2 id="upcoming-events" className="text-2xl font-semibold text-text-primary">
            Upcoming events
          </h2>
          {upcoming.length > 0 ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((event) => (
                <EventCard key={event.slug} event={event} now={now} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-card border border-dashed border-border-strong bg-surface p-8 sm:p-10">
              <p className="font-semibold text-text-primary">New event dates are being planned.</p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
                There are no published future dates right now. Follow Trivoxo or contact the team
                for the next release.
              </p>
            </div>
          )}
        </section>

        {past.length > 0 && (
          <section className="mt-16 border-t border-border pt-12" aria-labelledby="past-events">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-link">
              Event archive
            </p>
            <h2 id="past-events" className="mt-2 text-2xl font-semibold text-text-primary">
              Past Trivoxo moments
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((event) => (
                <EventCard key={event.slug} event={event} now={now} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </>
  )
}
