import { sql } from '@payloadcms/db-postgres'
import { Resend } from 'resend'
import { createLocalReq, type Payload, type PayloadRequest } from 'payload'
import type { Booking, EventOrder, EventTicket, Notification } from '@/payload-types'
import { BookingConfirmedEmail } from '@/emails/BookingConfirmedEmail'
import { EventTicketsEmail } from '@/emails/EventTicketsEmail'
import {
  bookingAccessExpiresAt,
  bookingMaterialFrom,
  createBookingLinks,
  type BookingMaterial,
} from '@/lib/booking-materials'
import {
  createEventOrderLink,
  eventOrderAccessExpiresAt,
  eventTicketMaterialFrom,
  type EventTicketMaterial,
} from '@/lib/event-ticket-materials'
import { qrPng } from '@/lib/qr'
import { createTicketToken } from '@/lib/ticket-token'

const MAX_ATTEMPTS = 8
const PROCESSING_STALE_MS = 5 * 60 * 1000

type TransactionDB = { execute: (query: unknown) => Promise<unknown> }

export type NotificationSendResult = { id: string }
export type BookingConfirmationSender = (input: {
  booking: Booking
  notification: Notification
  idempotencyKey: string
}) => Promise<NotificationSendResult>
export type EventTicketsSender = (input: {
  order: EventOrder
  tickets: EventTicket[]
  notification: Notification
  idempotencyKey: string
}) => Promise<NotificationSendResult>

export type NotificationProcessingResult = {
  scanned: number
  sent: number
  failed: number
  deadLetter: number
}

function relationshipID(value: unknown): number | undefined {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    return typeof id === 'number' ? id : undefined
  }
  return undefined
}

function bookingConfirmationKey(bookingID: number): string {
  return `booking-confirmed/${bookingID}/v1`
}

function eventTicketsKey(orderID: number): string {
  return `event-tickets-issued/${orderID}/v1`
}

async function findNotification(
  payload: Payload,
  notificationKey: string,
  req?: PayloadRequest,
): Promise<Notification | undefined> {
  const existing = await payload.find({
    collection: 'notifications',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    where: { notificationKey: { equals: notificationKey } },
  })
  return existing.docs[0]
}

export async function queueBookingConfirmation(
  payload: Payload,
  booking: Booking,
  options: { req?: PayloadRequest } = {},
): Promise<Notification> {
  if (options.req && (await options.req.transactionID)) {
    const db = await transactionDB(options.req)
    await db.execute(sql`SELECT pg_advisory_xact_lock(20260810, ${booking.id})`)
  }
  const notificationKey = bookingConfirmationKey(booking.id)
  const existing = await findNotification(payload, notificationKey, options.req)
  if (existing) return existing

  const populatedBooking = await payload.findByID({
    collection: 'bookings',
    id: booking.id,
    depth: 2,
    overrideAccess: true,
    req: options.req,
  })
  const material = bookingMaterialFrom(populatedBooking)
  const accessExpiresAt = bookingAccessExpiresAt(material.departureDate)

  try {
    return await payload.create({
      collection: 'notifications',
      depth: 0,
      overrideAccess: true,
      req: options.req,
      data: {
        notificationKey,
        type: 'booking_confirmed',
        status: 'queued',
        booking: booking.id,
        recipient: material.bookerEmail,
        accessExpiresAt: accessExpiresAt.toISOString(),
        payloadSnapshot: material,
        attempts: 0,
      },
    })
  } catch (error) {
    const raced = await findNotification(payload, notificationKey, options.req)
    if (raced) return raced
    throw error
  }
}

export async function queueEventTicketsIssued(
  payload: Payload,
  order: EventOrder,
  tickets: EventTicket[],
  options: { req?: PayloadRequest } = {},
): Promise<Notification> {
  if (tickets.length === 0) throw new Error('Event ticket confirmation requires issued tickets.')
  if (options.req && (await options.req.transactionID)) {
    const db = await transactionDB(options.req)
    await db.execute(sql`SELECT pg_advisory_xact_lock(20260811, ${order.id})`)
  }
  const notificationKey = eventTicketsKey(order.id)
  const existing = await findNotification(payload, notificationKey, options.req)
  if (existing) return existing

  const populatedOrder = await payload.findByID({
    collection: 'event-orders',
    id: order.id,
    depth: 1,
    overrideAccess: true,
    req: options.req,
  })
  const material = eventTicketMaterialFrom(populatedOrder, tickets)
  const accessExpiresAt = eventOrderAccessExpiresAt(material.startsAt)

  try {
    return await payload.create({
      collection: 'notifications',
      depth: 0,
      overrideAccess: true,
      req: options.req,
      data: {
        notificationKey,
        type: 'event_tickets_issued',
        status: 'queued',
        eventOrder: order.id,
        recipient: material.buyerEmail,
        accessExpiresAt: accessExpiresAt.toISOString(),
        payloadSnapshot: material,
        attempts: 0,
      },
    })
  } catch (error) {
    const raced = await findNotification(payload, notificationKey, options.req)
    if (raced) return raced
    throw error
  }
}

async function transactionDB(req: PayloadRequest): Promise<TransactionDB> {
  const transactionID = await req.transactionID
  const session = transactionID ? req.payload.db.sessions?.[String(transactionID)] : undefined
  if (!session) throw new Error('Notification transaction is unavailable.')
  return session.db as TransactionDB
}

function selectedID(result: unknown): number | undefined {
  const rows =
    result && typeof result === 'object' && 'rows' in result
      ? (result as { rows?: unknown[] }).rows
      : Array.isArray(result)
        ? result
        : undefined
  const id = rows?.[0] && typeof rows[0] === 'object' ? (rows[0] as { id?: unknown }).id : undefined
  const numberID = Number(id)
  return Number.isSafeInteger(numberID) ? numberID : undefined
}

async function claimNotification(
  payload: Payload,
  now: Date,
  target: { bookingID?: number; eventOrderID?: number } = {},
): Promise<Notification | undefined> {
  const transactionID = await payload.db.beginTransaction()
  if (!transactionID) throw new Error('PostgreSQL transactions are required for email delivery.')
  const req = await createLocalReq({ req: { transactionID } }, payload)

  try {
    const db = await transactionDB(req)
    const staleAt = new Date(now.getTime() - PROCESSING_STALE_MS).toISOString()
    const dueAt = now.toISOString()
    const result = target.bookingID
      ? await db.execute(sql`
          SELECT id FROM notifications
          WHERE booking_id = ${target.bookingID}
            AND (
              (status IN ('queued', 'failed') AND (next_attempt_at IS NULL OR next_attempt_at <= ${dueAt}))
              OR (status = 'processing' AND (locked_at IS NULL OR locked_at <= ${staleAt}))
            )
          ORDER BY created_at
          FOR UPDATE SKIP LOCKED
          LIMIT 1
        `)
      : target.eventOrderID
        ? await db.execute(sql`
            SELECT id FROM notifications
            WHERE event_order_id = ${target.eventOrderID}
              AND (
                (status IN ('queued', 'failed') AND (next_attempt_at IS NULL OR next_attempt_at <= ${dueAt}))
                OR (status = 'processing' AND (locked_at IS NULL OR locked_at <= ${staleAt}))
              )
            ORDER BY created_at
            FOR UPDATE SKIP LOCKED
            LIMIT 1
          `)
        : await db.execute(sql`
            SELECT id FROM notifications
            WHERE (
              (status IN ('queued', 'failed') AND (next_attempt_at IS NULL OR next_attempt_at <= ${dueAt}))
              OR (status = 'processing' AND (locked_at IS NULL OR locked_at <= ${staleAt}))
            )
            ORDER BY created_at
            FOR UPDATE SKIP LOCKED
            LIMIT 1
          `)
    const id = selectedID(result)
    if (!id) {
      await payload.db.commitTransaction(transactionID)
      return undefined
    }

    const current = await payload.findByID({
      collection: 'notifications',
      id,
      depth: 0,
      overrideAccess: true,
      req,
    })
    const claimed = await payload.update({
      collection: 'notifications',
      id,
      depth: 0,
      overrideAccess: true,
      req,
      data: {
        status: 'processing',
        attempts: Number(current.attempts ?? 0) + 1,
        lockedAt: dueAt,
        nextAttemptAt: null,
        lastError: null,
      },
    })
    await payload.db.commitTransaction(transactionID)
    return claimed
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }
}

function safeError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Unknown delivery failure.'
  return message.replace(/[\r\n]+/g, ' ').slice(0, 500)
}

function retryAt(attempts: number, now: Date): string {
  const delayMinutes = Math.min(24 * 60, 2 ** Math.min(attempts, 10))
  return new Date(now.getTime() + delayMinutes * 60 * 1000).toISOString()
}

async function markFailure(
  payload: Payload,
  notification: Notification,
  error: unknown,
  now: Date,
): Promise<'failed' | 'dead_letter' | 'sent'> {
  const current = await payload.findByID({
    collection: 'notifications',
    id: notification.id,
    depth: 0,
    overrideAccess: true,
  })
  if (current.status === 'sent') return 'sent'

  const attempts = Number(notification.attempts ?? 1)
  const exhausted = attempts >= MAX_ATTEMPTS
  await payload.update({
    collection: 'notifications',
    id: notification.id,
    depth: 0,
    overrideAccess: true,
    data: {
      status: exhausted ? 'dead_letter' : 'failed',
      lockedAt: null,
      nextAttemptAt: exhausted ? null : retryAt(attempts, now),
      lastError: safeError(error),
    },
  })
  return exhausted ? 'dead_letter' : 'failed'
}

export const sendBookingConfirmedEmail: BookingConfirmationSender = async ({
  notification,
  idempotencyKey,
}) => {
  const { apiKey, from } = emailConfiguration()
  const material = bookingSnapshot(notification)
  const links = createBookingLinks(material.reference, material.departureDate, {
    expiresAt: new Date(notification.accessExpiresAt),
  })
  const resend = new Resend(apiKey)
  const { data, error } = await resend.emails.send(
    {
      from,
      to: [notification.recipient],
      replyTo: process.env.EMAIL_REPLY_TO || 'info@trivoxoghana.com',
      subject: `Confirmed: ${material.experienceTitle} - ${material.reference}`,
      react: <BookingConfirmedEmail booking={material} links={links} />,
    },
    { idempotencyKey },
  )
  if (error || !data?.id) throw new Error(error?.message || 'Resend did not return a message ID.')
  return { id: data.id }
}

export const sendEventTicketsEmail: EventTicketsSender = async ({
  notification,
  idempotencyKey,
}) => {
  const { apiKey, from } = emailConfiguration()
  const material = eventSnapshot(notification)
  const manageLink = createEventOrderLink(material.orderReference, {
    expiresAt: new Date(notification.accessExpiresAt),
  })
  const qrContentIDs: Record<string, string> = {}
  const attachments = await Promise.all(
    material.tickets.map(async (ticket, index) => {
      const contentId = `trivoxo-ticket-${index + 1}`
      qrContentIDs[ticket.reference] = contentId
      return {
        filename: `${ticket.reference}.png`,
        content: await qrPng(createTicketToken(ticket.reference)),
        contentType: 'image/png',
        contentId,
      }
    }),
  )
  const resend = new Resend(apiKey)
  const { data, error } = await resend.emails.send(
    {
      from,
      to: [notification.recipient],
      replyTo: process.env.EMAIL_REPLY_TO || 'info@trivoxoghana.com',
      subject: `Your tickets: ${material.eventTitle} - ${material.orderReference}`,
      react: (
        <EventTicketsEmail
          order={material}
          manageLink={manageLink}
          qrContentIDs={qrContentIDs}
        />
      ),
      attachments,
    },
    { idempotencyKey },
  )
  if (error || !data?.id) throw new Error(error?.message || 'Resend did not return a message ID.')
  return { id: data.id }
}

function emailConfiguration(): { apiKey: string; from: string } {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  if (!apiKey || !from) {
    throw new Error('Transactional email is not configured. Set RESEND_API_KEY and EMAIL_FROM.')
  }
  return { apiKey, from }
}

function bookingSnapshot(notification: Notification): BookingMaterial {
  const value = notification.payloadSnapshot
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    typeof value.reference !== 'string' ||
    typeof value.bookerEmail !== 'string' ||
    typeof value.experienceTitle !== 'string' ||
    typeof value.departureDate !== 'string' ||
    typeof value.travellers !== 'number' ||
    typeof value.totalAmount !== 'number'
  ) {
    throw new Error('Notification booking snapshot is invalid.')
  }
  return value as unknown as BookingMaterial
}

function eventSnapshot(notification: Notification): EventTicketMaterial {
  const value = notification.payloadSnapshot
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    typeof value.orderReference !== 'string' ||
    typeof value.buyerEmail !== 'string' ||
    typeof value.eventTitle !== 'string' ||
    typeof value.startsAt !== 'string' ||
    typeof value.totalAmount !== 'number' ||
    !Array.isArray(value.tickets) ||
    value.tickets.length === 0
  ) {
    throw new Error('Notification event-ticket snapshot is invalid.')
  }
  return value as unknown as EventTicketMaterial
}

export async function processNotifications(
  payload: Payload,
  options: {
    bookingID?: number
    eventOrderID?: number
    limit?: number
    now?: Date
    bookingSender?: BookingConfirmationSender
    eventSender?: EventTicketsSender
  } = {},
): Promise<NotificationProcessingResult> {
  const now = options.now ?? new Date()
  const bookingSender = options.bookingSender ?? sendBookingConfirmedEmail
  const eventSender = options.eventSender ?? sendEventTicketsEmail
  const limit = Math.max(1, Math.min(options.limit ?? 20, 100))
  const result: NotificationProcessingResult = { scanned: 0, sent: 0, failed: 0, deadLetter: 0 }

  for (let index = 0; index < limit; index += 1) {
    const notification = await claimNotification(payload, now, {
      bookingID: options.bookingID,
      eventOrderID: options.eventOrderID,
    })
    if (!notification) break
    result.scanned += 1

    try {
      let delivered: NotificationSendResult
      if (notification.type === 'event_tickets_issued') {
        const eventOrderID = relationshipID(notification.eventOrder)
        if (!eventOrderID) throw new Error('Notification has no event-order relationship.')
        const order = await payload.findByID({
          collection: 'event-orders',
          id: eventOrderID,
          depth: 1,
          overrideAccess: true,
        })
        if (order.inventoryState !== 'confirmed' || order.paymentState !== 'paid') {
          throw new Error('Event order is no longer paid and confirmed.')
        }
        const tickets = await payload.find({
          collection: 'event-tickets',
          depth: 0,
          limit: 1000,
          overrideAccess: true,
          where: { order: { equals: order.id } },
        })
        if (tickets.totalDocs === 0) throw new Error('Event order has no issued tickets.')
        delivered = await eventSender({
          order,
          tickets: tickets.docs,
          notification,
          idempotencyKey: notification.notificationKey,
        })
      } else {
        const bookingID = relationshipID(notification.booking)
        if (!bookingID) throw new Error('Notification has no booking relationship.')
        const booking = await payload.findByID({
          collection: 'bookings',
          id: bookingID,
          depth: 2,
          overrideAccess: true,
        })
        if (booking.inventoryState !== 'confirmed' || booking.paymentState !== 'paid') {
          throw new Error('Booking is no longer paid and confirmed.')
        }
        delivered = await bookingSender({
          booking,
          notification,
          idempotencyKey: notification.notificationKey,
        })
      }

      await payload.update({
        collection: 'notifications',
        id: notification.id,
        depth: 0,
        overrideAccess: true,
        data: {
          status: 'sent',
          sentAt: now.toISOString(),
          lockedAt: null,
          nextAttemptAt: null,
          providerMessageId: delivered.id,
          lastError: null,
        },
      })
      result.sent += 1
    } catch (error) {
      const state = await markFailure(payload, notification, error, now)
      if (state === 'dead_letter') result.deadLetter += 1
      else if (state === 'failed') result.failed += 1
    }

    if (options.bookingID || options.eventOrderID) break
  }

  return result
}

/** Backwards-compatible booking-only processor used by existing callers/tests. */
export function processBookingNotifications(
  payload: Payload,
  options: {
    bookingID?: number
    limit?: number
    now?: Date
    sender?: BookingConfirmationSender
  } = {},
): Promise<NotificationProcessingResult> {
  return processNotifications(payload, {
    bookingID: options.bookingID,
    limit: options.limit,
    now: options.now,
    bookingSender: options.sender,
  })
}
