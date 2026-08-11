import type { Event, EventOrder, EventTicket } from '@/payload-types'
import { createBookingAccessTokenUntil } from '@/lib/booking-access'
import { bookingAccessExpiresAt } from '@/lib/booking-materials'

export type EventTicketMaterial = {
  orderReference: string
  buyerName: string
  buyerEmail: string
  eventTitle: string
  startsAt: string
  venue: string
  totalAmount: number
  items: { name: string; quantity: number; unitPrice: number }[]
  tickets: { reference: string; ticketTypeName: string; attendeeName?: string }[]
}

function relatedEvent(value: EventOrder['event']): Event | undefined {
  return value && typeof value === 'object' ? value : undefined
}

function siteURL(): URL {
  const configured = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const url = new URL(configured)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('NEXT_PUBLIC_SERVER_URL must use http or https.')
  }
  return url
}

export function eventOrderAccessExpiresAt(startsAt: string, now = new Date()): Date {
  return bookingAccessExpiresAt(startsAt, now)
}

export function createEventOrderLink(
  reference: string,
  options: { expiresAt: Date | number },
): string {
  const access = createBookingAccessTokenUntil(reference, options.expiresAt)
  const url = new URL(`/events/order/${encodeURIComponent(reference)}`, siteURL())
  url.searchParams.set('access', access)
  return url.toString()
}

export function eventTicketMaterialFrom(
  order: EventOrder,
  tickets: EventTicket[],
): EventTicketMaterial {
  const event = relatedEvent(order.event)
  if (!event?.startsAt) throw new Error('Event order confirmation requires a populated event.')

  return {
    orderReference: order.reference || `TVXO-${order.id}`,
    buyerName: [order.buyer.firstName, order.buyer.lastName].filter(Boolean).join(' '),
    buyerEmail: order.buyer.email,
    eventTitle: event.title || 'Trivoxo event',
    startsAt: event.startsAt,
    venue: [event.venue, event.location].filter(Boolean).join(', ') || 'Venue details to follow',
    totalAmount: Number(order.totalAmount ?? 0),
    items: (order.items ?? []).map((item) => ({
      name: item.ticketTypeName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    tickets: tickets.map((ticket) => ({
      reference: ticket.reference || `TVXE-${ticket.id}`,
      ticketTypeName: ticket.ticketTypeName,
      attendeeName: ticket.attendeeName || undefined,
    })),
  }
}

export function formatEventStart(startsAt: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Africa/Accra',
  }).format(new Date(startsAt))
}
