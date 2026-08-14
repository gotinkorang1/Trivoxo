import { sql } from '@payloadcms/db-postgres'
import {
  createLocalReq,
  type CollectionBeforeChangeHook,
  type Payload,
  type PayloadRequest,
} from 'payload'
import type { Booking, Departure, Experience, Payment } from '@/payload-types'
import { BOOKING_HOLD, CAPACITY } from '@/lib/policies'

const ACTIVE_BOOKING_STATES = ['held', 'confirmed'] as const
const ACTIVE_DEPARTURE_STATUS = 'scheduled'
type InventoryTransactionDB = { execute: (query: unknown) => Promise<unknown> }

export type InventoryFailureCode =
  | 'CAPACITY_UNAVAILABLE'
  | 'DEPARTURE_CLOSED'
  | 'HOLD_EXPIRED'
  | 'INVALID_INVENTORY'
  | 'NO_DEPARTURE'

export class InventoryError extends Error {
  code: InventoryFailureCode
  remainingSeats?: number

  constructor(code: InventoryFailureCode, message: string, remainingSeats?: number) {
    super(message)
    this.name = 'InventoryError'
    this.code = code
    this.remainingSeats = remainingSeats
  }
}

export type InventorySnapshot = {
  capacity: number
  heldSeats: number
  confirmedSeats: number
  usedSeats: number
  remainingSeats: number
}

export type DateInventory = {
  available: boolean
  autoProvisioned: boolean
  departureCount: number
  maxRemainingSeats: number
  status: 'available' | 'closed' | 'no-departure' | 'sold-out'
}

export type CreateHoldInput = {
  experience: Experience
  date: string
  adults: number
  /** Children aged 6–12 (charged the child rate). */
  children: number
  /** Young children aged 0–5 (free, but occupy a seat). */
  youngChildren?: number
  booker: Booking['booker']
  pickup?: string
  pickupTime?: string
  travellerIdentity?: Booking['travellerIdentity']
  specialRequest?: string
  totalAmount: number
  couponCode?: string
  couponDiscount?: number
  source?: Booking['source']
  now?: Date
  holdMinutes?: number
}

function relationshipID(value: unknown): number | undefined {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    return typeof id === 'number' ? id : undefined
  }
  return undefined
}

function dayBounds(date: string): { start: string; end: string } {
  const start = new Date(`${date}T00:00:00.000Z`)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 1)
  return { start: start.toISOString(), end: end.toISOString() }
}

function statusToInventoryState(status: Booking['status']): NonNullable<Booking['inventoryState']> {
  if (status === 'draft') return 'none'
  if (status === 'held' || status === 'pending_payment') return 'held'
  if (
    status === 'cancelled' ||
    status === 'expired' ||
    status === 'refunded' ||
    status === 'payment_review'
  ) {
    return 'released'
  }
  return 'confirmed'
}

function isAutoProvisionedType(type: Experience['availabilityType']): boolean {
  return type !== 'specific-dates'
}

function bookingSeats(
  booking: Pick<Booking, 'adults' | 'capacitySeats' | 'children' | 'youngChildren'>,
): number {
  return Number(
    booking.capacitySeats ??
      (booking.adults ?? 0) + (booking.children ?? 0) + (booking.youngChildren ?? 0),
  )
}

export function isBookingHoldActive(
  booking: Pick<Booking, 'holdExpiresAt' | 'inventoryState'>,
  now = new Date(),
): boolean {
  return (
    booking.inventoryState === 'held' &&
    Boolean(booking.holdExpiresAt) &&
    new Date(String(booking.holdExpiresAt)).getTime() > now.getTime()
  )
}

async function transactionDB(req: PayloadRequest): Promise<InventoryTransactionDB> {
  const transactionID = await req.transactionID
  if (!transactionID) {
    throw new InventoryError(
      'INVALID_INVENTORY',
      'Inventory operation requires a database transaction.',
    )
  }

  const sessions = req.payload.db.sessions
  const session = sessions?.[String(transactionID)]
  if (!session) {
    throw new InventoryError('INVALID_INVENTORY', 'Inventory transaction is no longer active.')
  }
  return session.db as InventoryTransactionDB
}

async function lockDeparture(req: PayloadRequest, departureID: number): Promise<void> {
  const db = await transactionDB(req)
  await db.execute(sql`SELECT id FROM departures WHERE id = ${departureID} FOR UPDATE`)
}

async function lockBooking(req: PayloadRequest, bookingID: number): Promise<void> {
  const db = await transactionDB(req)
  await db.execute(sql`SELECT id FROM bookings WHERE id = ${bookingID} FOR UPDATE`)
}

async function lockPayment(req: PayloadRequest, paymentID: number): Promise<void> {
  const db = await transactionDB(req)
  await db.execute(sql`SELECT id FROM payments WHERE id = ${paymentID} FOR UPDATE`)
}

async function lockDepartureDate(
  req: PayloadRequest,
  experienceID: number,
  date: string,
): Promise<void> {
  const db = await transactionDB(req)
  const dateLock = Number(date.replaceAll('-', ''))
  await db.execute(sql`SELECT pg_advisory_xact_lock(${experienceID}, ${dateLock})`)
}

async function withInventoryTransaction<T>(
  payload: Payload,
  work: (req: PayloadRequest) => Promise<T>,
): Promise<T> {
  const transactionID = await payload.db.beginTransaction()
  if (!transactionID) {
    throw new InventoryError('INVALID_INVENTORY', 'PostgreSQL transactions are unavailable.')
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

type PaymentAuditData = {
  gatewayTransactionId: string
  channel?: string
  paidAt?: string
  verifiedAt: string
  verificationSnapshot: Record<string, unknown>
}

export type PaymentSettlementResult = {
  booking: Booking
  payment: Payment
  outcome: 'confirmed' | 'review' | 'already_processed'
  reason?: string
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

/**
 * Convert a verified gateway payment to confirmed inventory in one database
 * transaction. Duplicate callbacks/webhooks serialize on the payment row.
 */
export async function settleVerifiedBookingPayment(
  payload: Payload,
  paymentID: number,
  audit: PaymentAuditData,
): Promise<PaymentSettlementResult> {
  return withInventoryTransaction(payload, async (req) => {
    await lockPayment(req, paymentID)
    let payment = await payload.findByID({
      collection: 'payments',
      id: paymentID,
      depth: 0,
      overrideAccess: true,
      req,
    })
    const bookingID = relationshipID(payment.booking)
    if (!bookingID) {
      throw new InventoryError('INVALID_INVENTORY', 'Payment has no booking relationship.')
    }

    if (payment.status === 'succeeded' || payment.status === 'review') {
      const booking = await payload.findByID({
        collection: 'bookings',
        id: bookingID,
        depth: 0,
        overrideAccess: true,
        req,
      })
      return {
        booking,
        payment,
        outcome: 'already_processed',
        reason: payment.reviewReason ?? undefined,
      }
    }

    const initialBooking = await payload.findByID({
      collection: 'bookings',
      id: bookingID,
      depth: 0,
      overrideAccess: true,
      req,
    })
    const departureID = relationshipID(initialBooking.departure)
    if (departureID) await lockDeparture(req, departureID)
    await lockBooking(req, bookingID)

    let booking = await payload.findByID({
      collection: 'bookings',
      id: bookingID,
      depth: 0,
      overrideAccess: true,
      req,
    })

    const priorSuccessful = await payload.find({
      collection: 'payments',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      req,
      where: {
        and: [
          { booking: { equals: bookingID } },
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
        data: {
          ...paymentAuditFields(audit),
          status: 'review',
          reviewReason: reason,
        },
      })
      return { booking, payment, outcome: 'review', reason }
    }

    if (booking.inventoryState === 'confirmed' && booking.paymentState === 'paid') {
      payment = await payload.update({
        collection: 'payments',
        id: payment.id,
        depth: 0,
        overrideAccess: true,
        req,
        data: {
          ...paymentAuditFields(audit),
          status: 'succeeded',
          reviewReason: null,
          failureReason: null,
        },
      })
      return { booking, payment, outcome: 'confirmed' }
    }

    try {
      booking = await payload.update({
        collection: 'bookings',
        id: booking.id,
        depth: 0,
        overrideAccess: true,
        req,
        data: {
          status: 'paid',
          paymentState: 'paid',
          holdExpiresAt: null,
        },
      })
      payment = await payload.update({
        collection: 'payments',
        id: payment.id,
        depth: 0,
        overrideAccess: true,
        req,
        data: {
          ...paymentAuditFields(audit),
          status: 'succeeded',
          reviewReason: null,
          failureReason: null,
        },
      })
      return { booking, payment, outcome: 'confirmed' }
    } catch (error) {
      if (
        !(error instanceof InventoryError) ||
        !['CAPACITY_UNAVAILABLE', 'DEPARTURE_CLOSED', 'NO_DEPARTURE'].includes(error.code)
      ) {
        throw error
      }

      const reason = `Payment succeeded but inventory could not be confirmed: ${error.message}`
      booking = await payload.update({
        collection: 'bookings',
        id: booking.id,
        depth: 0,
        overrideAccess: true,
        req,
        data: {
          status: 'payment_review',
          paymentState: 'paid',
          holdExpiresAt: null,
        },
      })
      payment = await payload.update({
        collection: 'payments',
        id: payment.id,
        depth: 0,
        overrideAccess: true,
        req,
        data: {
          ...paymentAuditFields(audit),
          status: 'review',
          reviewReason: reason,
        },
      })
      return { booking, payment, outcome: 'review', reason }
    }
  })
}

/** Release an unconfirmed hold when money was received but verification failed. */
export async function markBookingPaymentForReview(
  payload: Payload,
  paymentID: number,
  reason: string,
  audit: Partial<PaymentAuditData> = {},
): Promise<PaymentSettlementResult> {
  return withInventoryTransaction(payload, async (req) => {
    await lockPayment(req, paymentID)
    let payment = await payload.findByID({
      collection: 'payments',
      id: paymentID,
      depth: 0,
      overrideAccess: true,
      req,
    })
    const bookingID = relationshipID(payment.booking)
    if (!bookingID) {
      throw new InventoryError('INVALID_INVENTORY', 'Payment has no booking relationship.')
    }
    const initialBooking = await payload.findByID({
      collection: 'bookings',
      id: bookingID,
      depth: 0,
      overrideAccess: true,
      req,
    })
    const departureID = relationshipID(initialBooking.departure)
    if (departureID) await lockDeparture(req, departureID)
    await lockBooking(req, bookingID)

    let booking = await payload.findByID({
      collection: 'bookings',
      id: bookingID,
      depth: 0,
      overrideAccess: true,
      req,
    })
    if (booking.inventoryState !== 'confirmed') {
      booking = await payload.update({
        collection: 'bookings',
        id: booking.id,
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
    return { booking, payment, outcome: 'review', reason }
  })
}

async function activeBookingsForDeparture(
  payload: Payload,
  departureID: number,
  now: Date,
  req?: PayloadRequest,
  excludeBookingID?: number,
): Promise<Booking[]> {
  const exclusion = excludeBookingID ? [{ id: { not_equals: excludeBookingID } }] : []
  const result = await payload.find({
    collection: 'bookings',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    req,
    where: {
      and: [
        { departure: { equals: departureID } },
        { inventoryState: { in: [...ACTIVE_BOOKING_STATES] } },
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
  return result.docs
}

export async function getDepartureInventory(
  payload: Payload,
  departure: Departure,
  options: { now?: Date; req?: PayloadRequest; excludeBookingID?: number } = {},
): Promise<InventorySnapshot> {
  const now = options.now ?? new Date()
  const active = await activeBookingsForDeparture(
    payload,
    departure.id,
    now,
    options.req,
    options.excludeBookingID,
  )
  const heldSeats = active
    .filter((booking) => booking.inventoryState === 'held')
    .reduce((total, booking) => total + bookingSeats(booking), 0)
  const confirmedSeats = active
    .filter((booking) => booking.inventoryState === 'confirmed')
    .reduce((total, booking) => total + bookingSeats(booking), 0)
  const capacity = Number(departure.capacity)
  const usedSeats = heldSeats + confirmedSeats
  return {
    capacity,
    heldSeats,
    confirmedSeats,
    usedSeats,
    remainingSeats: Math.max(0, capacity - usedSeats),
  }
}

async function departuresForDate(
  payload: Payload,
  experienceID: number,
  date: string,
  req?: PayloadRequest,
): Promise<Departure[]> {
  const { start, end } = dayBounds(date)
  const result = await payload.find({
    collection: 'departures',
    depth: 0,
    limit: 100,
    overrideAccess: true,
    req,
    sort: 'startsAt',
    where: {
      and: [
        { experience: { equals: experienceID } },
        { startsAt: { greater_than_equal: start } },
        { startsAt: { less_than: end } },
      ],
    },
  })
  return result.docs
}

async function createDatePlaceholderDeparture(
  payload: Payload,
  req: PayloadRequest,
  experience: Experience,
  date: string,
): Promise<Departure> {
  return payload.create({
    collection: 'departures',
    depth: 0,
    overrideAccess: true,
    req,
    data: {
      experience: experience.id,
      startsAt: `${date}T12:00:00.000Z`,
      timeConfirmed: false,
      capacity: experience.maxGuests ?? CAPACITY.maxGuests,
      status: 'scheduled',
      autoCreated: true,
      // Collection hooks derive dateKey and the unique inventoryKey.
      dateKey: date,
      inventoryKey: `${experience.id}:${date}T12:00:00.000Z`,
    },
  })
}

async function chooseDepartureForHold(
  payload: Payload,
  req: PayloadRequest,
  experience: Experience,
  date: string,
  partySize: number,
  now: Date,
): Promise<Departure> {
  await lockDepartureDate(req, experience.id, date)
  let departures = await departuresForDate(payload, experience.id, date, req)
  let scheduled = departures.filter((departure) => departure.status === ACTIVE_DEPARTURE_STATUS)

  if (scheduled.length === 0) {
    if (departures.length > 0) {
      throw new InventoryError('DEPARTURE_CLOSED', 'Trivoxo has closed departures on this date.', 0)
    }
    if (!isAutoProvisionedType(experience.availabilityType)) {
      throw new InventoryError(
        'NO_DEPARTURE',
        'No scheduled departure is available on this date.',
        0,
      )
    }
    const created = await createDatePlaceholderDeparture(payload, req, experience, date)
    departures = [created]
    scheduled = [created]
  }

  let maxRemainingSeats = 0
  for (const departure of scheduled) {
    await lockDeparture(req, departure.id)
    const fresh = await payload.findByID({
      collection: 'departures',
      id: departure.id,
      depth: 0,
      overrideAccess: true,
      req,
    })
    if (fresh.status !== ACTIVE_DEPARTURE_STATUS) continue
    const snapshot = await getDepartureInventory(payload, fresh, { now, req })
    maxRemainingSeats = Math.max(maxRemainingSeats, snapshot.remainingSeats)
    if (snapshot.remainingSeats >= partySize) return fresh
  }

  throw new InventoryError(
    'CAPACITY_UNAVAILABLE',
    maxRemainingSeats > 0
      ? `Only ${maxRemainingSeats} seat${maxRemainingSeats === 1 ? '' : 's'} remain on this date.`
      : 'This date is sold out.',
    maxRemainingSeats,
  )
}

export async function createBookingHold(
  payload: Payload,
  input: CreateHoldInput,
): Promise<{ booking: Booking; departure: Departure }> {
  const now = input.now ?? new Date()
  const youngChildren = input.youngChildren ?? 0
  const partySize = input.adults + input.children + youngChildren
  const holdMinutes = input.holdMinutes ?? BOOKING_HOLD.minutes

  if (!Number.isInteger(partySize) || partySize < 1 || holdMinutes <= 0) {
    throw new InventoryError('INVALID_INVENTORY', 'Invalid seat hold request.')
  }

  return withInventoryTransaction(payload, async (req) => {
    const departure = await chooseDepartureForHold(
      payload,
      req,
      input.experience,
      input.date,
      partySize,
      now,
    )
    const holdExpiresAt = new Date(now.getTime() + holdMinutes * 60 * 1000).toISOString()
    const booking = await payload.create({
      collection: 'bookings',
      depth: 0,
      overrideAccess: true,
      req,
      data: {
        status: 'held',
        source: input.source ?? 'website',
        experience: input.experience.id,
        departure: departure.id,
        departureDate: departure.startsAt,
        adults: input.adults,
        children: input.children,
        youngChildren,
        capacitySeats: partySize,
        inventoryState: 'held',
        holdExpiresAt,
        booker: input.booker,
        pickup: input.pickup,
        pickupTime: input.pickupTime,
        travellerIdentity: input.travellerIdentity,
        specialRequest: input.specialRequest,
        totalAmount: input.totalAmount,
        couponCode: input.couponCode,
        couponDiscount: input.couponDiscount,
        paymentState: 'outstanding',
      },
    })
    return { booking, departure }
  })
}

export async function getDateInventory(
  payload: Payload,
  experience: Experience,
  date: string,
  options: { now?: Date; partySize?: number } = {},
): Promise<DateInventory> {
  const now = options.now ?? new Date()
  const partySize = options.partySize ?? 1
  const departures = await departuresForDate(payload, experience.id, date)
  const scheduled = departures.filter((departure) => departure.status === ACTIVE_DEPARTURE_STATUS)

  if (scheduled.length === 0) {
    if (departures.length > 0) {
      return {
        available: false,
        autoProvisioned: false,
        departureCount: departures.length,
        maxRemainingSeats: 0,
        status: 'closed',
      }
    }
    const canProvision = isAutoProvisionedType(experience.availabilityType)
    const provisionalCapacity = Number(experience.maxGuests ?? CAPACITY.maxGuests)
    return {
      available: canProvision && provisionalCapacity >= partySize,
      autoProvisioned: canProvision,
      departureCount: 0,
      maxRemainingSeats: canProvision ? provisionalCapacity : 0,
      status: canProvision ? 'available' : 'no-departure',
    }
  }

  const snapshots = await Promise.all(
    scheduled.map((departure) => getDepartureInventory(payload, departure, { now })),
  )
  const maxRemainingSeats = Math.max(0, ...snapshots.map((snapshot) => snapshot.remainingSeats))
  return {
    available: maxRemainingSeats >= partySize,
    autoProvisioned: false,
    departureCount: scheduled.length,
    maxRemainingSeats,
    status: maxRemainingSeats >= partySize ? 'available' : 'sold-out',
  }
}

async function expireHoldInTransaction(
  payload: Payload,
  bookingID: number,
  now: Date,
): Promise<boolean> {
  return withInventoryTransaction(payload, async (req) => {
    const initial = await payload.findByID({
      collection: 'bookings',
      id: bookingID,
      depth: 0,
      overrideAccess: true,
      req,
    })
    const departureID = relationshipID(initial.departure)
    if (departureID) await lockDeparture(req, departureID)

    const booking = await payload.findByID({
      collection: 'bookings',
      id: bookingID,
      depth: 0,
      overrideAccess: true,
      req,
    })
    if (
      booking.inventoryState !== 'held' ||
      !booking.holdExpiresAt ||
      new Date(booking.holdExpiresAt).getTime() > now.getTime()
    ) {
      return false
    }

    await payload.update({
      collection: 'bookings',
      id: booking.id,
      depth: 0,
      overrideAccess: true,
      req,
      data: { status: 'expired', inventoryState: 'released' },
    })
    return true
  })
}

export async function expireStaleBookingHolds(
  payload: Payload,
  options: { limit?: number; now?: Date } = {},
): Promise<{ expired: number; scanned: number }> {
  const now = options.now ?? new Date()
  const stale = await payload.find({
    collection: 'bookings',
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
  for (const booking of stale.docs) {
    if (await expireHoldInTransaction(payload, booking.id, now)) expired += 1
  }
  return { expired, scanned: stale.docs.length }
}

/**
 * Enforces the same inventory invariant for staff-created and staff-edited
 * bookings. The public hold service pre-locks its departure, so the repeated
 * row lock here is re-entrant inside the same PostgreSQL transaction.
 */
export const enforceBookingInventory: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  const status = (data.status ?? originalDoc?.status ?? 'draft') as Booking['status']
  const desiredState = statusToInventoryState(status)
  const departureID = relationshipID(data.departure ?? originalDoc?.departure)
  const adults = Number(data.adults ?? originalDoc?.adults ?? 0)
  const children = Number(data.children ?? originalDoc?.children ?? 0)
  const youngChildren = Number(data.youngChildren ?? originalDoc?.youngChildren ?? 0)
  const capacitySeats = adults + children + youngChildren
  const now = new Date()

  if (!Number.isInteger(capacitySeats) || capacitySeats < 1) {
    throw new InventoryError('INVALID_INVENTORY', 'A booking must consume at least one seat.')
  }

  data.capacitySeats = capacitySeats
  data.inventoryState = desiredState

  if (desiredState === 'none' || desiredState === 'released') return data
  if (!departureID) {
    const unchangedLegacyRequest =
      operation === 'update' &&
      (originalDoc?.inventoryState === 'none' || !originalDoc?.inventoryState) &&
      status === originalDoc?.status
    if (unchangedLegacyRequest) {
      // Requests created before real departures existed remain editable, but do
      // not consume seats until Operations assigns a departure or changes status.
      data.inventoryState = 'none'
      return data
    }
    throw new InventoryError(
      'INVALID_INVENTORY',
      'Choose a departure before holding or confirming a booking.',
    )
  }

  await lockDeparture(req, departureID)
  const departure = await req.payload.findByID({
    collection: 'departures',
    id: departureID,
    depth: 0,
    overrideAccess: true,
    req,
  })
  if (departure.status !== ACTIVE_DEPARTURE_STATUS) {
    throw new InventoryError('DEPARTURE_CLOSED', 'This departure is not open for bookings.', 0)
  }

  if (operation === 'update' && originalDoc?.id) {
    const current = await req.payload.findByID({
      collection: 'bookings',
      id: originalDoc.id,
      depth: 0,
      overrideAccess: true,
      req,
    })
    if (current.updatedAt !== originalDoc.updatedAt) {
      throw new InventoryError(
        'INVALID_INVENTORY',
        'This booking changed while you were editing it. Reload and try again.',
      )
    }
  }

  if (desiredState === 'held') {
    const existingExpiry = data.holdExpiresAt ?? originalDoc?.holdExpiresAt
    if (existingExpiry && new Date(String(existingExpiry)).getTime() > now.getTime()) {
      data.holdExpiresAt = existingExpiry
    } else if (operation === 'create' || originalDoc?.inventoryState !== 'held') {
      data.holdExpiresAt = new Date(now.getTime() + BOOKING_HOLD.minutes * 60 * 1000).toISOString()
    } else {
      data.status = 'expired'
      data.inventoryState = 'released'
      return data
    }
  }

  const snapshot = await getDepartureInventory(req.payload, departure, {
    now,
    req,
    excludeBookingID: operation === 'update' ? originalDoc?.id : undefined,
  })
  if (snapshot.remainingSeats < capacitySeats) {
    throw new InventoryError(
      'CAPACITY_UNAVAILABLE',
      snapshot.remainingSeats > 0
        ? `Only ${snapshot.remainingSeats} seat${snapshot.remainingSeats === 1 ? '' : 's'} remain.`
        : 'This departure is sold out.',
      snapshot.remainingSeats,
    )
  }

  data.departureDate = departure.startsAt
  return data
}
