'use server'

import { getPayload } from 'payload'
import { headers as nextHeaders } from 'next/headers'
import config from '@payload-config'
import { checkInTicket } from '@/lib/event-checkin'
import { ticketReferenceFromScan } from '@/lib/ticket-token'
import type { Role } from '@/access/roles'

export type CheckInState = {
  result?: 'valid' | 'already' | 'void' | 'not_found' | 'invalid' | 'error'
  message?: string
  detail?: {
    reference: string
    ticketType?: string
    attendee?: string
    event?: string
    checkedInAt?: string
  }
}

const ALLOWED: Role[] = ['super-admin', 'operations', 'event-manager', 'checkin']

export async function checkInTicketAction(
  _prev: CheckInState,
  formData: FormData,
): Promise<CheckInState> {
  const input = String(formData.get('code') ?? '').trim()
  const gate = String(formData.get('gate') ?? '').trim() || undefined
  if (!input) return { result: 'invalid', message: 'Scan or enter a ticket to continue.' }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  const roles = ((user as { roles?: Role[] } | null)?.roles ?? []) as Role[]
  const authorized = ALLOWED.some((r) => roles.includes(r))
  if (!user || !authorized) {
    return { result: 'error', message: 'You are not authorized to check in tickets.' }
  }

  const reference = ticketReferenceFromScan(input)
  if (!reference) {
    return { result: 'invalid', message: 'That is not a valid Trivoxo ticket QR code.' }
  }

  try {
    const userID =
      typeof user === 'object' && user && 'id' in user ? Number((user as { id: number }).id) : undefined
    const outcome = await checkInTicket(payload, { reference, gate, userID })
    if (outcome.result === 'not_found') {
      return { result: 'not_found', message: `No ticket found for ${reference}.`, detail: { reference } }
    }
    const t = outcome.ticket
    const detail = {
      reference: t.reference || reference,
      ticketType: t.ticketTypeName,
      attendee: t.attendeeName || undefined,
      event: typeof t.event === 'object' && t.event ? t.event.title : undefined,
      checkedInAt: t.checkedInAt || undefined,
    }
    if (outcome.result === 'valid') return { result: 'valid', message: 'Checked in ✓', detail }
    if (outcome.result === 'already') return { result: 'already', message: 'Already checked in', detail }
    return { result: 'void', message: 'This ticket has been voided.', detail }
  } catch (error) {
    console.error('Check-in failed', error)
    return { result: 'error', message: 'Check-in failed. Please try again.' }
  }
}
