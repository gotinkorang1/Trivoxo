/**
 * Sample events (§62–§64). Source of truth shared by the events pages and the
 * seed (so the admin matches the site). Real events are created by staff in the
 * admin; these give the section content to render.
 *
 * Ticket PURCHASE (orders, QR tickets, check-in — §65, §66) is deferred: it
 * needs Paystack and an orders model, and sits with the payment work. For now
 * ticket types are displayed and enquiries route through WhatsApp.
 */

export type TicketType = {
  name: string
  price: number
  note?: string
  soldOut?: boolean
}

export type EventItem = {
  slug: string
  title: string
  blurb: string
  /** ISO date-time of the event start. */
  startsAt: string
  venue: string
  location: string
  region: string
  gradient: string
  featured?: boolean
  about: string
  whatToExpect: string[]
  ticketTypes: TicketType[]
}

export const EVENTS: EventItem[] = [
  {
    slug: 'trivoxo-sunset-experience',
    title: 'Trivoxo Sunset Experience',
    blurb: 'An evening of music, food and golden light on the Ada estuary.',
    startsAt: '2026-12-19T16:00:00.000Z',
    venue: 'Ada Estuary',
    location: 'Ada',
    region: 'Greater Accra',
    gradient: 'linear-gradient(135deg,#4d3a12,#f5b133)',
    featured: true,
    about:
      'Close out the year where the Volta meets the sea. Live sets, local food stalls and a slow sunset over the water — Trivoxo’s signature December gathering.',
    whatToExpect: ['Live music & DJs', 'Local food & drinks', 'Sunset boat rides', 'Beach lounge seating'],
    ticketTypes: [
      { name: 'Early Bird', price: 250, note: 'Limited' },
      { name: 'Regular', price: 350 },
      { name: 'VIP', price: 700, note: 'Lounge access + welcome drink' },
      { name: 'Table for Six', price: 4000, note: 'Reserved table, bottle service' },
    ],
  },
  {
    slug: 'detty-december-capital-glow',
    title: 'Detty December: Capital Glow',
    blurb: 'Accra after dark — the city’s biggest December night out.',
    startsAt: '2026-12-27T20:00:00.000Z',
    venue: 'Independence Avenue',
    location: 'Accra',
    region: 'Greater Accra',
    gradient: 'linear-gradient(135deg,#1a1440,#6d4bd8)',
    featured: true,
    about:
      'The capital at full glow. A night of Afrobeats, highlife and the energy that makes December in Accra unmissable.',
    whatToExpect: ['Headline performances', 'Food village', 'Rooftop lounge', 'After-party'],
    ticketTypes: [
      { name: 'Regular', price: 350 },
      { name: 'VIP', price: 700, note: 'Fast-track entry + lounge' },
    ],
  },
  {
    slug: 'new-year-volta-cruise',
    title: 'New Year Volta Cruise',
    blurb: 'Ring in the new year cruising across Volta Lake.',
    startsAt: '2027-01-01T18:00:00.000Z',
    venue: 'Akosombo Marina',
    location: 'Akosombo',
    region: 'Eastern Region',
    gradient: 'linear-gradient(135deg,#133a4d,#2a9fb8)',
    featured: false,
    about:
      'A relaxed evening cruise to welcome the new year — dinner on the water, music and fireworks over the lake.',
    whatToExpect: ['Dinner on board', 'Live band', 'Fireworks at midnight', 'Return transfer option'],
    ticketTypes: [
      { name: 'Regular', price: 600, note: 'Includes dinner' },
      { name: 'VIP', price: 1200, note: 'Upper deck + premium bar' },
    ],
  },
]

export function getEventBySlug(slug: string): EventItem | undefined {
  return EVENTS.find((e) => e.slug === slug)
}

export function getUpcomingEvents(limit = 3): EventItem[] {
  return [...EVENTS].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)).slice(0, limit)
}

export function eventFromPrice(event: EventItem): number {
  return Math.min(...event.ticketTypes.map((t) => t.price))
}
