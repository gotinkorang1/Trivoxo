// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { render } from '@react-email/render'
import type { Event, EventOrder, EventTicket } from '@/payload-types'
import { EventTicketsEmail } from '@/emails/EventTicketsEmail'
import {
  createEventOrderLink,
  eventTicketMaterialFrom,
  formatEventStart,
} from '@/lib/event-ticket-materials'
import { verifyBookingAccessToken } from '@/lib/booking-access'
import { createTicketToken, ticketReferenceFromScan } from '@/lib/ticket-token'
import { qrPng } from '@/lib/qr'

const originalPayloadSecret = process.env.PAYLOAD_SECRET
const originalServerURL = process.env.NEXT_PUBLIC_SERVER_URL

describe('event ticket email materials', () => {
  beforeEach(() => {
    process.env.PAYLOAD_SECRET = 'unit-test-event-ticket-email-secret'
    process.env.NEXT_PUBLIC_SERVER_URL = 'https://staging.trivoxogh.com'
  })

  afterEach(() => {
    process.env.PAYLOAD_SECRET = originalPayloadSecret
    process.env.NEXT_PUBLIC_SERVER_URL = originalServerURL
  })

  it('renders private event access and scannable QR ticket content', async () => {
    const event = {
      id: 20,
      title: 'Trivoxo Sunset Experience',
      slug: 'sunset-experience',
      startsAt: '2026-12-19T16:00:00.000Z',
      venue: 'Ada Riverfront',
      location: 'Ada',
      updatedAt: '2026-08-11T09:00:00.000Z',
      createdAt: '2026-08-11T09:00:00.000Z',
    } satisfies Event
    const order = {
      id: 21,
      reference: 'TVXO-26-TEST1',
      status: 'paid',
      inventoryState: 'confirmed',
      source: 'website',
      event,
      buyer: { firstName: 'Ama', lastName: 'Mensah', email: 'ama@example.com' },
      items: [{ ticketTypeName: 'VIP', unitPrice: 700, quantity: 1 }],
      quantityTotal: 1,
      totalAmount: 700,
      paymentState: 'paid',
      updatedAt: '2026-08-11T09:00:00.000Z',
      createdAt: '2026-08-11T09:00:00.000Z',
    } satisfies EventOrder
    const ticket = {
      id: 22,
      reference: 'TVXE-TEST1',
      order: order.id,
      event: event.id,
      ticketTypeName: 'VIP',
      attendeeName: 'Ama Mensah',
      status: 'valid',
      updatedAt: '2026-08-11T09:00:00.000Z',
      createdAt: '2026-08-11T09:00:00.000Z',
    } satisfies EventTicket

    const material = eventTicketMaterialFrom(order, [ticket])
    const expiresAt = new Date('2027-01-18T16:00:00.000Z')
    const manageLink = createEventOrderLink(order.reference!, { expiresAt })
    const access = new URL(manageLink).searchParams.get('access')
    expect(verifyBookingAccessToken(order.reference!, access, new Date('2026-12-20'))).toBe(true)
    expect(formatEventStart(material.startsAt)).toContain('19 December 2026')

    const signedQR = createTicketToken(ticket.reference!)
    expect(ticketReferenceFromScan(signedQR)).toBe(ticket.reference)
    const png = await qrPng(signedQR)
    expect(png.subarray(1, 4).toString()).toBe('PNG')

    const html = await render(
      <EventTicketsEmail
        order={material}
        manageLink={manageLink}
        qrContentIDs={{ [ticket.reference!]: 'ticket-1' }}
      />,
    )
    expect(html).toContain('Trivoxo Sunset Experience')
    expect(html).toContain('TVXE-TEST1')
    expect(html).toContain('cid:ticket-1')
    expect(html).not.toContain('sk_')
  })
})
