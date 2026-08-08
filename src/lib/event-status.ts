import type { EventItem } from '@/lib/data/events'

export type EventStatus = 'upcoming' | 'ongoing' | 'past'

function endOfEventDay(startsAt: string): number {
  const start = new Date(startsAt)
  return Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), 23, 59, 59, 999)
}

/** Ghana uses UTC, so a single-day event remains current until 23:59 that day. */
export function getEventStatus(
  event: Pick<EventItem, 'startsAt' | 'endsAt'>,
  now = new Date(),
): EventStatus {
  const startsAt = Date.parse(event.startsAt)
  const endsAt = event.endsAt ? Date.parse(event.endsAt) : endOfEventDay(event.startsAt)
  const current = now.getTime()

  if (current < startsAt) return 'upcoming'
  if (current <= endsAt) return 'ongoing'
  return 'past'
}

export function isCurrentEvent(
  event: Pick<EventItem, 'startsAt' | 'endsAt'>,
  now = new Date(),
): boolean {
  return getEventStatus(event, now) !== 'past'
}
