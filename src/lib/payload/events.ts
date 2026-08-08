/**
 * Live event queries — mirrors src/lib/payload/experiences.ts.
 */
import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { EventItem } from '@/lib/data/events'
import type { Event as EventDoc } from '@/payload-types'
import { gradientForSlug } from '@/lib/visuals'
import { mediaToPublicImage } from '@/lib/media'
import { isCurrentEvent } from '@/lib/event-status'

function toEvent(doc: EventDoc): EventItem | null {
  if (!doc.slug) return null
  const destination =
    typeof doc.destination === 'object' && doc.destination ? doc.destination : null

  return {
    slug: doc.slug,
    title: doc.title,
    blurb: doc.shortDescription ?? '',
    startsAt: doc.startsAt,
    endsAt: doc.endsAt ?? undefined,
    venue: doc.venue ?? '',
    location: doc.location ?? destination?.title ?? '',
    region: destination?.region ?? '',
    gradient: gradientForSlug(doc.slug),
    image: mediaToPublicImage(doc.coverImage),
    featured: Boolean(doc.featured),
    about: doc.about ?? doc.shortDescription ?? '',
    whatToExpect: doc.highlights?.map((h) => h.text) ?? [],
    included: doc.included?.map((h) => h.text),
    ticketTypes: (doc.ticketTypes ?? []).map((t) => ({
      name: t.name,
      price: t.price,
      soldOut: Boolean(t.soldOut),
      quantity: t.quantity ?? undefined,
      perOrderLimit: t.perOrderLimit ?? undefined,
      saleStart: t.saleStart ?? undefined,
      saleEnd: t.saleEnd ?? undefined,
    })),
  }
}

export const getAllEvents = cache(async (): Promise<EventItem[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'events',
    where: { _status: { equals: 'published' } },
    depth: 1,
    limit: 200,
  })
  return docs.map(toEvent).filter((e): e is EventItem => e !== null)
})

export const getEventBySlug = cache(async (slug: string): Promise<EventItem | undefined> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'events',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    depth: 1,
    limit: 1,
  })
  const doc = docs[0]
  return doc ? (toEvent(doc) ?? undefined) : undefined
})

export async function getUpcomingEvents(limit = 3): Promise<EventItem[]> {
  const all = await getAllEvents()
  return all
    .filter((event) => isCurrentEvent(event))
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
    .slice(0, limit)
}

export function eventFromPrice(event: EventItem): number {
  const prices = event.ticketTypes.map((t) => t.price)
  return prices.length > 0 ? Math.min(...prices) : 0
}
