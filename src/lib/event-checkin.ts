import { sql } from '@payloadcms/db-postgres'
import { createLocalReq, type Payload, type PayloadRequest } from 'payload'
import type { EventTicket } from '@/payload-types'

/**
 * Event check-in (§66). A ticket is validated and flipped to `checked_in`
 * exactly once, under a row lock so two simultaneous scans can't both succeed.
 * A second scan reports the prior check-in time instead of admitting again.
 */
export type CheckInResult =
  | { result: 'valid'; ticket: EventTicket }
  | { result: 'already'; ticket: EventTicket }
  | { result: 'void'; ticket: EventTicket }
  | { result: 'not_found' }

async function lockTicket(req: PayloadRequest, ticketID: number): Promise<void> {
  const transactionID = await req.transactionID
  const session = transactionID ? req.payload.db.sessions?.[String(transactionID)] : undefined
  if (!session) throw new Error('Check-in transaction is unavailable.')
  await (session.db as { execute: (q: unknown) => Promise<unknown> }).execute(
    sql`SELECT id FROM event_tickets WHERE id = ${ticketID} FOR UPDATE`,
  )
}

export async function checkInTicket(
  payload: Payload,
  input: { reference: string; gate?: string; userID?: number },
): Promise<CheckInResult> {
  const found = await payload.find({
    collection: 'event-tickets',
    depth: 1,
    limit: 1,
    overrideAccess: true,
    where: { reference: { equals: input.reference.toUpperCase() } },
  })
  const initial = found.docs[0]
  if (!initial) return { result: 'not_found' }

  const transactionID = await payload.db.beginTransaction()
  if (!transactionID) throw new Error('PostgreSQL transactions are unavailable.')
  const req = await createLocalReq({ req: { transactionID } }, payload)
  try {
    await lockTicket(req, initial.id)
    const ticket = await payload.findByID({
      collection: 'event-tickets',
      id: initial.id,
      depth: 1,
      overrideAccess: true,
      req,
    })

    if (ticket.status === 'void') {
      await payload.db.commitTransaction(transactionID)
      return { result: 'void', ticket }
    }
    if (ticket.status === 'checked_in') {
      await payload.db.commitTransaction(transactionID)
      return { result: 'already', ticket }
    }

    const updated = await payload.update({
      collection: 'event-tickets',
      id: ticket.id,
      depth: 1,
      overrideAccess: true,
      req,
      data: {
        status: 'checked_in',
        checkedInAt: new Date().toISOString(),
        checkedInBy: input.userID,
        checkedInGate: input.gate || undefined,
      },
    })
    await payload.db.commitTransaction(transactionID)
    return { result: 'valid', ticket: updated }
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }
}
