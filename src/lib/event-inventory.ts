import { sql } from '@payloadcms/db-postgres'
import { createLocalReq, type Payload, type PayloadRequest } from 'payload'
import type { Event, EventOrder, EventTicket, Payment } from '@/payload-types'
import { BOOKING_HOLD } from '@/lib/policies'
import { eventOrderReference, ticketReference } from '@/lib/reference'

/**
 * Event ticket inventory — the transactional twin of src/lib/booking-inventory.ts.
 * Ticket stock lives on each event's `ticketTypes[].quantity`; usage is the sum
 * of held (unexpired) + confirmed order line items per ticket type. Concurrency
 * is serialized with a per-event advisory lock plus row locks on the order and
 * payment being settled, so two buyers can't oversell the last ticket.
 */

const ACTIVE_ORDER_STATES = ['held', 'confirmed'] as const
type InventoryTransactionDB = { execute: (query: unknown) => Promise<unknown> }

export type EventInventoryFailureCode =
  | 'CAPACITY_UNAVAILABLE'
  | 'INVALID_INVENTORY'
  | 'SALE_CLOSED'
  | 'UNKNOWN_TICKET_TYPE'

export class EventInventoryError extends Error {
  code: EventInventoryFailureCode
  ticketTypeName?: string

  constructor(code: EventInventoryFailureCode, message: string, ticketTypeName?: string) {
    super(message)
    this.name = 'EventInventoryError'
    this.code = code
    this.ticketTypeName = ticketTypeName
  }
}

export type TicketSelection = { ticketTypeName: string; quantity: number }

export type TicketTypeInventory = {
  ticketTypeName: string
  price: number
  capacity: number | null // null = unlimited
  held: number
  confirmed: number
  remaining: number | null // null = unlimited
  soldOut: boolean
  onSale: boolean
  perOrderLimit: number | null
}

export type CreateEventOrderInput = {
  event: Event
  selections: TicketSelection[]
  buyer: EventOrder['buyer']
  source?: EventOrder['source']
  now?: Date
  holdMinutes?: number
}

type PaymentAuditData = {
  gatewayTransactionId: string
  channel?: string
  paidAt?: string
  verifiedAt: string
  verificationSnapshot: Record<string, unknown>
}

export type EventSettlementResult = {
  order: EventOrder
  payment: Payment
  tickets: EventTicket[]
  outcome: 'confirmed' | 'review' | 'already_processed'
  reason?: string
}

function relationshipID(value: unknown): number | undefined {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    return typeof id === 'number' ? id : undefined
  }
  return undefined
}

function ticketTypeOnSale(
  type: NonNullable<Event['ticketTypes']>[number],
  now: Date,
): boolean {
  if (type.soldOut) return false
  if (type.saleStart && new Date(type.saleStart).getTime() > now.getTime()) return false
  if (type.saleEnd && new Date(type.saleEnd).getTime() < now.getTime()) return false
  return true
}

export function isEventOrderHoldActive(
  order: Pick<EventOrder, 'holdExpiresAt' | 'inventoryState'>,
  now = new Date(),
): boolean {
  return (
    order.inventoryState === 'held' &&
    Boolean(order.holdExpiresAt) &&
    new Date(String(order.holdExpiresAt)).getTime() > now.getTime()
  )
}

async function transactionDB(req: PayloadRequest): Promise<InventoryTransactionDB> {
  const transactionID = await req.transactionID
  const session = transactionID ? req.payload.db.sessions?.[String(transactionID)] : undefined
  if (!session) {
    throw new EventInventoryError('INVALID_INVENTORY', 'Inventory transaction is no longer active.')
  }
  return session.db as InventoryTransactionDB
}

async function lockEvent(req: PayloadRequest, eventID: number): Promise<void> {
  const db = await transactionDB(req)
  // Namespaced advisory lock (1 = events) serializes all ordering for this event.
  await db.execute(sql`SELECT pg_advisory_xact_lock(1, ${eventID})`)
}

async function lockOrder(req: PayloadRequest, orderID: number): Promise<void> {
  const db = await transactionDB(req)
  await db.execute(sql`SELECT id FROM event_orders WHERE id = ${orderID} FOR UPDATE`)
}

async function lockPayment(req: PayloadRequest, paymentID: number): Promise<void> {
  const db = await transactionDB(req)
  await db.execute(sql`SELECT id FROM payments WHERE id = ${paymentID} FOR UPDATE`)
}

async function withInventoryTransaction<T>(
  payload: Payload,
  work: (req: PayloadRequest) => Promise<T>,
): Promise<T> {
  const transactionID = await payload.db.beginTransaction()
  if (!transactionID) {
    throw new EventInventoryError('INVALID_INVENTORY', 'PostgreSQL transactions are unavailable.')
  }
  const req = await createLocalReq({ req: { transactionID } }, payload)
  try {
    const result = await work(req)
    await payload.db.commitTransaction(transactionID)
    return result
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }
}

/** Sum held (unexpired) + confirmed quantities per ticket type across orders. */
async function usageByTicketType(
  payload: Payload,
  eventID: number,
  now: Date,
  req?: PayloadRequest,
  excludeOrderID?: number,
): Promise<Map<string, { held: number; confirmed: number }>> {
  const exclusion = excludeOrderID ? [{ id: { not_equals: excludeOrderID } }] : []
  const result = await payload.find({
    collection: 'event-orders',
    depth: 0,
    limit: 5000,
    overrideAccess: true,
    req,
    where: {
      and: [
        { event: { equals: eventID } },
        { inventoryState: { in: [...ACTIVE_ORDER_STATES] } },
        ...exclusion,
        {
          or: [
            { inventoryState: { equals: 'confirmed' } },
            {
              and: [
                { inventoryState: { equals: 'held' } },
                { holdExpiresAt: { greater_than: now.toISOString() } },
              ],
            },
          ],
        },
      ],
    },
  })

  const usage = new Map<string, { held: number; confirmed: number }>()
  for (const order of result.docs) {
    const bucket = order.inventoryState === 'confirmed' ? 'confirmed' : 'held'
    for (const item of order.items ?? []) {
      const current = usage.get(item.ticketTypeName) ?? { held: 0, confirmed: 0 }
      current[bucket] += item.quantity
      usage.set(item.ticketTypeName, current)
    }
  }
  return usage
}

export async function getEventInventory(
  payload: Payload,
  event: Event,
  options: { now?: Date; req?: PayloadRequest; excludeOrderID?: number } = {},
): Promise<TicketTypeInventory[]> {
  const now = options.now ?? new Date()
  const usage = await usageByTicketType(payload, event.id, now, options.req, options.excludeOrderID)

  return (event.ticketTypes ?? []).map((type) => {
    const used = usage.get(type.name) ?? { held: 0, confirmed: 0 }
    const capacity = typeof type.quantity === 'number' ? type.quantity : null
    const remaining = capacity === null ? null : Math.max(0, capacity - used.held - used.confirmed)
    const onSale = ticketTypeOnSale(type, now)
    return {
      ticketTypeName: type.name,
      price: type.price,
      capacity,
      held: used.held,
      confirmed: used.confirmed,
      remaining,
      soldOut: Boolean(type.soldOut) || remaining === 0,
      onSale,
      perOrderLimit: typeof type.perOrderLimit === 'number' ? type.perOrderLimit : null,
    }
  })
}

/**
 * Create a held event order in one transaction, validating live ticket
 * availability under a per-event advisory lock.
 */
export async function createEventOrderHold(
  payload: Payload,
  input: CreateEventOrderInput,
): Promise<{ order: EventOrder }> {
  const now = input.now ?? new Date()
  const holdMinutes = input.holdMinutes ?? BOOKING_HOLD.minutes
  const selections = input.selections.filter((s) => s.quantity > 0)

  if (selections.length === 0 || holdMinutes <= 0) {
    throw new EventInventoryError('INVALID_INVENTORY', 'Choose at least one ticket.')
  }
  for (const selection of selections) {
    if (!Number.isInteger(selection.quantity) || selection.quantity < 1) {
      throw new EventInventoryError('INVALID_INVENTORY', 'Ticket quantities must be whole numbers.')
    }
  }

  return withInventoryTransaction(payload, async (req) => {
    await lockEvent(req, input.event.id)
    const event = await payload.findByID({
      collection: 'events',
      id: input.event.id,
      depth: 0,
      overrideAccess: true,
      req,
    })
    const inventory = await getEventInventory(payload, event, { now, req })
    const byName = new Map(inventory.map((row) => [row.ticketTypeName, row]))

    const items: NonNullable<EventOrder['items']> = []
    let total = 0
    let quantityTotal = 0

    for (const selection of selections) {
      const row = byName.get(selection.ticketTypeName)
      if (!row) {
        throw new EventInventoryError(
          'UNKNOWN_TICKET_TYPE',
          `Ticket type “${selection.ticketTypeName}” is not available for this event.`,
          selection.ticketTypeName,
        )
      }
      if (!row.onSale) {
        throw new EventInventoryError(
          'SALE_CLOSED',
          `${row.ticketTypeName} tickets are not on sale.`,
          row.ticketTypeName,
        )
      }
      if (row.perOrderLimit != null && selection.quantity > row.perOrderLimit) {
        throw new EventInventoryError(
          'CAPACITY_UNAVAILABLE',
          `Up to ${row.perOrderLimit} ${row.ticketTypeName} ticket${row.perOrderLimit === 1 ? '' : 's'} per order.`,
          row.ticketTypeName,
        )
      }
      if (row.remaining != null && selection.quantity > row.remaining) {
        throw new EventInventoryError(
          'CAPACITY_UNAVAILABLE',
          row.remaining > 0
            ? `Only ${row.remaining} ${row.ticketTypeName} ticket${row.remaining === 1 ? '' : 's'} left.`
            : `${row.ticketTypeName} is sold out.`,
          row.ticketTypeName,
        )
      }
      items.push({ ticketTypeName: row.ticketTypeName, unitPrice: row.price, quantity: selection.quantity })
      total += row.price * selection.quantity
      quantityTotal += selection.quantity
    }

    const holdExpiresAt = new Date(now.getTime() + holdMinutes * 60 * 1000).toISOString()
    const order = await payload.create({
      collection: 'event-orders',
      depth: 0,
      overrideAccess: true,
      req,
      data: {
        reference: eventOrderReference(now),
        status: 'held',
        inventoryState: 'held',
        holdExpiresAt,
        source: input.source ?? 'website',
        event: event.id,
        buyer: input.buyer,
        items,
        quantityTotal,
        totalAmount: total,
        paymentState: 'outstanding',
      },
    })
    return { order }
  })
}

function paymentAuditFields(data: PaymentAuditData) {
  return {
    gatewayTransactionId: data.gatewayTransactionId,
    channel: data.channel,
    paidAt: data.paidAt,
    lastVerifiedAt: data.verifiedAt,
    verificationSnapshot: data.verificationSnapshot,
  }
}

async function issueTicketsForOrder(
  payload: Payload,
  req: PayloadRequest,
  order: EventOrder,
): Promise<EventTicket[]> {
  const eventID = relationshipID(order.event)
  if (!eventID) throw new EventInventoryError('INVALID_INVENTORY', 'Order has no event.')

  // Idempotency: never issue twice for the same order.
  const existing = await payload.find({
    collection: 'event-tickets',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    req,
    where: { order: { equals: order.id } },
  })
  if (existing.totalDocs > 0) return existing.docs

  const attendeeName = `${order.buyer.firstName} ${order.buyer.lastName}`.trim()
  const used = new Set<string>()
  const tickets: EventTicket[] = []
  for (const item of order.items ?? []) {
    for (let i = 0; i < item.quantity; i++) {
      let reference = ticketReference()
      while (used.has(reference)) reference = ticketReference()
      used.add(reference)
      const ticket = await payload.create({
        collection: 'event-tickets',
        depth: 0,
        overrideAccess: true,
        req,
        data: {
          reference,
          order: order.id,
          event: eventID,
          ticketTypeName: item.ticketTypeName,
          attendeeName,
          status: 'valid',
        },
      })
      tickets.push(ticket)
    }
  }
  return tickets
}

/**
 * Convert a verified event-order payment to confirmed inventory + issued
 * tickets in one transaction. Duplicate callbacks/webhooks serialize on the
 * payment row and are idempotent.
 */
export async function settleVerifiedEventOrderPayment(
  payload: Payload,
  paymentID: number,
  audit: PaymentAuditData,
): Promise<EventSettlementResult> {
  return withInventoryTransaction(payload, async (req) => {
    await lockPayment(req, paymentID)
    let payment = await payload.findByID({
      collection: 'payments',
      id: paymentID,
      depth: 0,
      overrideAccess: true,
      req,
    })
    const orderID = relationshipID(payment.eventOrder)
    if (!orderID) {
      throw new EventInventoryError('INVALID_INVENTORY', 'Payment has no event order relationship.')
    }

    const loadOrder = () =>
      payload.findByID({ collection: 'event-orders', id: orderID, depth: 0, overrideAccess: true, req })

    if (payment.status === 'succeeded' || payment.status === 'review') {
      const order = await loadOrder()
      const tickets = await issueTicketsForOrder(payload, req, order)
      return {
        order,
        payment,
        tickets,
        outcome: 'already_processed',
        reason: payment.reviewReason ?? undefined,
      }
    }

    const initialOrder = await loadOrder()
    const eventID = relationshipID(initialOrder.event)
    if (eventID) await lockEvent(req, eventID)
    await lockOrder(req, orderID)
    let order = await loadOrder()

    // Duplicate successful payment for the same order → Finance review.
    const priorSuccessful = await payload.find({
      collection: 'payments',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      req,
      where: {
        and: [
          { eventOrder: { equals: orderID } },
          { status: { equals: 'succeeded' } },
          { id: { not_equals: paymentID } },
        ],
      },
    })
    if (priorSuccessful.totalDocs > 0) {
      const reason = 'Duplicate successful payment. Finance must refund or reconcile this attempt.'
      payment = await payload.update({
        collection: 'payments',
        id: payment.id,
        depth: 0,
        overrideAccess: true,
        req,
        data: { ...paymentAuditFields(audit), status: 'review', reviewReason: reason },
      })
      const tickets = await issueTicketsForOrder(payload, req, order)
      return { order, payment, tickets, outcome: 'review', reason }
    }

    // Already settled this order (e.g. via the parallel callback) → just succeed the payment.
    if (order.inventoryState === 'confirmed' && order.paymentState === 'paid') {
      payment = await payload.update({
        collection: 'payments',
        id: payment.id,
        depth: 0,
        overrideAccess: true,
        req,
        data: { ...paymentAuditFields(audit), status: 'succeeded', reviewReason: null, failureReason: null },
      })
      const tickets = await issueTicketsForOrder(payload, req, order)
      return { order, payment, tickets, outcome: 'confirmed' }
    }

    // Re-validate stock excluding this order's own hold (guards against a hold
    // that expired and was taken before payment settled).
    const event = eventID
      ? await payload.findByID({ collection: 'events', id: eventID, depth: 0, overrideAccess: true, req })
      : null
    const oversold: string[] = []
    if (event) {
      const inventory = await getEventInventory(payload, event, { now: new Date(), req, excludeOrderID: order.id })
      const byName = new Map(inventory.map((row) => [row.ticketTypeName, row]))
      for (const item of order.items ?? []) {
        const row = byName.get(item.ticketTypeName)
        if (row?.remaining != null && row.remaining < item.quantity) oversold.push(item.ticketTypeName)
      }
    }

    if (oversold.length > 0) {
      const reason = `Payment succeeded but tickets could not be confirmed (sold out: ${oversold.join(', ')}).`
      order = await payload.update({
        collection: 'event-orders',
        id: order.id,
        depth: 0,
        overrideAccess: true,
        req,
        data: { status: 'payment_review', paymentState: 'paid', holdExpiresAt: null },
      })
      payment = await payload.update({
        collection: 'payments',
        id: payment.id,
        depth: 0,
        overrideAccess: true,
        req,
        data: { ...paymentAuditFields(audit), status: 'review', reviewReason: reason },
      })
      return { order, payment, tickets: [], outcome: 'review', reason }
    }

    order = await payload.update({
      collection: 'event-orders',
      id: order.id,
      depth: 0,
      overrideAccess: true,
      req,
      data: { status: 'paid', inventoryState: 'confirmed', paymentState: 'paid', holdExpiresAt: null },
    })
    payment = await payload.update({
      collection: 'payments',
      id: payment.id,
      depth: 0,
      overrideAccess: true,
      req,
      data: { ...paymentAuditFields(audit), status: 'succeeded', reviewReason: null, failureReason: null },
    })
    const tickets = await issueTicketsForOrder(payload, req, order)
    return { order, payment, tickets, outcome: 'confirmed' }
  })
}

export async function markEventOrderPaymentForReview(
  payload: Payload,
  paymentID: number,
  reason: string,
  audit: Partial<PaymentAuditData> = {},
): Promise<EventSettlementResult> {
  return withInventoryTransaction(payload, async (req) => {
    await lockPayment(req, paymentID)
    let payment = await payload.findByID({
      collection: 'payments',
      id: paymentID,
      depth: 0,
      overrideAccess: true,
      req,
    })
    const orderID = relationshipID(payment.eventOrder)
    if (!orderID) {
      throw new EventInventoryError('INVALID_INVENTORY', 'Payment has no event order relationship.')
    }
    await lockOrder(req, orderID)
    let order = await payload.findByID({
      collection: 'event-orders',
      id: orderID,
      depth: 0,
      overrideAccess: true,
      req,
    })
    if (order.inventoryState !== 'confirmed') {
      order = await payload.update({
        collection: 'event-orders',
        id: order.id,
        depth: 0,
        overrideAccess: true,
        req,
        data: { status: 'payment_review', paymentState: 'paid', holdExpiresAt: null },
      })
    }
    payment = await payload.update({
      collection: 'payments',
      id: payment.id,
      depth: 0,
      overrideAccess: true,
      req,
      data: {
        status: 'review',
        reviewReason: reason,
        ...(audit.gatewayTransactionId ? { gatewayTransactionId: audit.gatewayTransactionId } : {}),
        ...(audit.channel ? { channel: audit.channel } : {}),
        ...(audit.paidAt ? { paidAt: audit.paidAt } : {}),
        ...(audit.verifiedAt ? { lastVerifiedAt: audit.verifiedAt } : {}),
        ...(audit.verificationSnapshot ? { verificationSnapshot: audit.verificationSnapshot } : {}),
      },
    })
    return { order, payment, tickets: [], outcome: 'review', reason }
  })
}

async function expireOrderHoldInTransaction(
  payload: Payload,
  orderID: number,
  now: Date,
): Promise<boolean> {
  return withInventoryTransaction(payload, async (req) => {
    await lockOrder(req, orderID)
    const order = await payload.findByID({
      collection: 'event-orders',
      id: orderID,
      depth: 0,
      overrideAccess: true,
      req,
    })
    if (
      order.inventoryState !== 'held' ||
      !order.holdExpiresAt ||
      new Date(order.holdExpiresAt).getTime() > now.getTime()
    ) {
      return false
    }
    await payload.update({
      collection: 'event-orders',
      id: order.id,
      depth: 0,
      overrideAccess: true,
      req,
      data: { status: 'expired', inventoryState: 'released' },
    })
    return true
  })
}

export async function expireStaleEventOrderHolds(
  payload: Payload,
  options: { limit?: number; now?: Date } = {},
): Promise<{ expired: number; scanned: number }> {
  const now = options.now ?? new Date()
  const stale = await payload.find({
    collection: 'event-orders',
    depth: 0,
    limit: options.limit ?? BOOKING_HOLD.cleanupBatchSize,
    overrideAccess: true,
    sort: 'holdExpiresAt',
    where: {
      and: [
        { inventoryState: { equals: 'held' } },
        { holdExpiresAt: { less_than_equal: now.toISOString() } },
      ],
    },
  })

  let expired = 0
  for (const order of stale.docs) {
    if (await expireOrderHoldInTransaction(payload, order.id, now)) expired += 1
  }
  return { expired, scanned: stale.docs.length }
}
