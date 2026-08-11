import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import {
  createEventOrderHold,
  EventInventoryError,
  settleVerifiedEventOrderPayment,
} from '@/lib/event-inventory'
import { checkInTicket } from '@/lib/event-checkin'
import { paymentReference } from '@/lib/reference'
import type { Event } from '@/payload-types'

let payload: Payload
const createdEventIDs: number[] = []
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

function buyer() {
  return {
    firstName: 'Ticket',
    lastName: 'Tester',
    email: `tickets-${suffix}@example.com`,
    phone: '0200000000',
  }
}

async function createTestEvent(name: string, quantity: number): Promise<Event> {
  const startsAt = new Date()
  startsAt.setUTCDate(startsAt.getUTCDate() + 30)
  const event = await payload.create({
    collection: 'events',
    depth: 0,
    overrideAccess: true,
    data: {
      title: `${name} ${suffix}`,
      slug: `${name.toLowerCase().replaceAll(' ', '-')}-${suffix}`,
      startsAt: startsAt.toISOString(),
      ticketTypes: [{ name: 'General', price: 100, quantity }],
      _status: 'published',
    },
  })
  createdEventIDs.push(event.id)
  return event
}

const audit = () => ({
  gatewayTransactionId: `test-${Math.random().toString(36).slice(2)}`,
  verifiedAt: new Date().toISOString(),
  verificationSnapshot: {},
})

async function createPaidPayment(orderID: number, totalAmount: number) {
  return payload.create({
    collection: 'payments',
    depth: 0,
    overrideAccess: true,
    data: {
      reference: paymentReference(),
      eventOrder: orderID,
      gateway: 'paystack',
      status: 'pending',
      amountMinor: Math.round(totalAmount * 100),
      currency: 'GHS',
    },
  })
}

describe('transactional event ticket inventory', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(async () => {
    for (const eventID of createdEventIDs) {
      const tickets = await payload.find({ collection: 'event-tickets', depth: 0, limit: 200, overrideAccess: true, where: { event: { equals: eventID } } })
      for (const t of tickets.docs) await payload.delete({ collection: 'event-tickets', id: t.id, overrideAccess: true })

      const orders = await payload.find({ collection: 'event-orders', depth: 0, limit: 200, overrideAccess: true, where: { event: { equals: eventID } } })
      for (const o of orders.docs) {
        const payments = await payload.find({ collection: 'payments', depth: 0, limit: 50, overrideAccess: true, where: { eventOrder: { equals: o.id } } })
        for (const p of payments.docs) await payload.delete({ collection: 'payments', id: p.id, overrideAccess: true })
        await payload.delete({ collection: 'event-orders', id: o.id, overrideAccess: true })
      }
      await payload.delete({ collection: 'events', id: eventID, overrideAccess: true })
    }
  })

  it('serializes simultaneous orders so ticket stock cannot be oversold', async () => {
    const event = await createTestEvent('Concurrent Event', 2)

    const results = await Promise.allSettled([
      createEventOrderHold(payload, { event, selections: [{ ticketTypeName: 'General', quantity: 2 }], buyer: buyer() }),
      createEventOrderHold(payload, { event, selections: [{ ticketTypeName: 'General', quantity: 2 }], buyer: buyer() }),
    ])

    const fulfilled = results.filter((r) => r.status === 'fulfilled')
    const rejected = results.filter((r) => r.status === 'rejected')
    expect(fulfilled).toHaveLength(1)
    expect(rejected).toHaveLength(1)
    expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(EventInventoryError)
    expect((rejected[0] as PromiseRejectedResult).reason.code).toBe('CAPACITY_UNAVAILABLE')
  })

  it('issues one ticket per unit on settlement, idempotently', async () => {
    const event = await createTestEvent('Settle Event', 10)
    const { order } = await createEventOrderHold(payload, {
      event,
      selections: [{ ticketTypeName: 'General', quantity: 3 }],
      buyer: buyer(),
    })
    const payment = await createPaidPayment(order.id, order.totalAmount ?? 0)

    const first = await settleVerifiedEventOrderPayment(payload, payment.id, audit())
    expect(first.outcome).toBe('confirmed')
    expect(first.order.inventoryState).toBe('confirmed')
    expect(first.order.paymentState).toBe('paid')
    expect(first.tickets).toHaveLength(3)

    // Re-settling the same payment must not issue duplicate tickets.
    const second = await settleVerifiedEventOrderPayment(payload, payment.id, audit())
    expect(second.outcome).toBe('already_processed')
    expect(second.tickets).toHaveLength(3)

    const allTickets = await payload.find({ collection: 'event-tickets', depth: 0, limit: 200, overrideAccess: true, where: { order: { equals: order.id } } })
    expect(allTickets.totalDocs).toBe(3)
  })

  it('admits a ticket once and reports repeat scans', async () => {
    const event = await createTestEvent('Checkin Event', 5)
    const { order } = await createEventOrderHold(payload, {
      event,
      selections: [{ ticketTypeName: 'General', quantity: 1 }],
      buyer: buyer(),
    })
    const payment = await createPaidPayment(order.id, order.totalAmount ?? 0)
    const settled = await settleVerifiedEventOrderPayment(payload, payment.id, audit())
    const ticket = settled.tickets[0]
    expect(ticket?.reference).toBeTruthy()

    const first = await checkInTicket(payload, { reference: ticket.reference || '', gate: 'Gate 1' })
    expect(first.result).toBe('valid')

    const second = await checkInTicket(payload, { reference: ticket.reference || '' })
    expect(second.result).toBe('already')

    const missing = await checkInTicket(payload, { reference: 'TVXE-NOPE9' })
    expect(missing.result).toBe('not_found')
  })
})
