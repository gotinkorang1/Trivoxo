/**
 * Events (§62–§64). Real Trivoxo events. The public site now reads live from
 * Payload (src/lib/payload/events.ts); this module remains the seed's source
 * of truth and defines the `EventItem` shape the live layer maps into.
 *
 * Ticket PURCHASE (orders, QR tickets, check-in — §65, §66) is deferred: it
 * needs Paystack and an orders model, and sits with the payment work. For now
 * the package rate is displayed and booking routes through WhatsApp.
 */

import type { PublicImage } from '@/lib/media'

export type TicketType = {
  name: string
  price: number
  note?: string
  soldOut?: boolean
  quantity?: number
  perOrderLimit?: number
  saleStart?: string
  saleEnd?: string
}

export type EventItem = {
  slug: string
  title: string
  blurb: string
  /** ISO date-time of the event start. */
  startsAt: string
  /** ISO date-time of the event end (multi-day events). */
  endsAt?: string
  venue: string
  location: string
  region: string
  gradient: string
  image?: PublicImage
  featured?: boolean
  about: string
  whatToExpect: string[]
  included?: string[]
  ticketTypes: TicketType[]
}

export const EVENTS: EventItem[] = [
  {
    slug: '3-days-volta-xcape',
    title: '3 Days Volta Xcape',
    blurb:
      'Independence-weekend adventure across the Volta Region — mountains, waterfalls, culture and chill.',
    startsAt: '2026-03-06T07:00:00.000Z',
    endsAt: '2026-03-08T18:00:00.000Z',
    venue: 'Volta Region',
    location: 'Volta Region',
    region: 'Volta Region',
    gradient: 'linear-gradient(135deg,#0f3d2e,#1e9e7a)',
    featured: true,
    about:
      'A carefully planned 3-day weekend getaway where everything flows — movement, rest, pictures, meals and unforgettable experiences. Green landscapes, calm towns, mountains, waterfalls and warm culture, over the Independence weekend.',
    whatToExpect: [
      'Bike + Hike at Adaklu',
      'Mount Afadja (Afadjato) climb',
      'Wli Waterfalls',
      'Tagbo Village exploration',
      'Bongo Farms Camp — relax, eat, chill',
    ],
    included: [
      'Accommodation',
      'Transportation',
      'Breakfast and lunch for all 3 days',
      'Tour site fees',
      'Water',
      'Drinks',
      'Photography',
    ],
    ticketTypes: [{ name: 'Per person', price: 3900, quantity: 24, perOrderLimit: 6 }],
  },
  {
    slug: 'hike-and-chill',
    title: 'Hike and Chill',
    blurb:
      'Adventure, fresh air, beautiful views and great vibes — Danfa-Adamorobe Hills to Cactus Creek, Aburi.',
    startsAt: '2026-03-21T06:00:00.000Z',
    venue: 'Danfa-Adamorobe Hills → Cactus Creek',
    location: 'Aburi',
    region: 'Eastern Region',
    gradient: 'linear-gradient(135deg,#3d4a12,#8bae2a)',
    featured: true,
    about:
      'More than just a hike — a chance to step away from the stress of everyday life, connect with nature, meet amazing people and enjoy a refreshing outdoor experience. From the scenic hills to the calm beauty of Cactus Creek, every moment promises something memorable.',
    whatToExpect: [
      'Scenic hike through the hills',
      'Chill at Cactus Creek, Aburi',
      'Meet fellow adventurers',
      'Stunning photo moments',
    ],
    included: ['Transportation', 'Food and drinks', 'Water', 'Unlimited photography'],
    ticketTypes: [{ name: 'Full package', price: 650, quantity: 40, perOrderLimit: 8 }],
  },
]
