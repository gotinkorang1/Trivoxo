import type { AvailabilityType, Weekday } from '@/lib/data/experiences'
import { CAPACITY } from '@/lib/policies'

const DAY_MS = 24 * 60 * 60 * 1000
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const WEEKDAY_BY_INDEX: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export type AvailabilityRules = {
  availabilityType?: AvailabilityType
  weekdays?: Weekday[]
  minNoticeHours?: number
  maxAdvanceDays?: number
  soldOut?: boolean
}

export type DateWindow = {
  minDate: string
  maxDate: string
}

export type DateAvailability = {
  requestable: boolean
  label: string
  reason?: string
}

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false
  const parsed = new Date(`${value}T12:00:00.000Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

export function getBookingWindow(rules: AvailabilityRules = {}, now = new Date()): DateWindow {
  const minNoticeHours = rules.minNoticeHours ?? CAPACITY.minNoticeHours
  const maxAdvanceDays = rules.maxAdvanceDays ?? CAPACITY.maxAdvanceDays
  const earliest = new Date(now.getTime() + minNoticeHours * 60 * 60 * 1000)
  const latest = new Date(now.getTime() + maxAdvanceDays * DAY_MS)
  const earliestDay = new Date(
    Date.UTC(earliest.getUTCFullYear(), earliest.getUTCMonth(), earliest.getUTCDate()),
  )
  if (earliestDay.getTime() < earliest.getTime())
    earliestDay.setUTCDate(earliestDay.getUTCDate() + 1)
  return {
    // A tour departure time is not known at this stage, so only expose a full
    // calendar day that safely clears the minimum-notice threshold.
    minDate: earliestDay.toISOString().slice(0, 10),
    maxDate: latest.toISOString().slice(0, 10),
  }
}

export function evaluateDateAvailability(
  date: string,
  rules: AvailabilityRules,
  window: DateWindow,
): DateAvailability {
  if (!isIsoDate(date))
    return { requestable: false, label: 'Unavailable', reason: 'Choose a valid date.' }
  if (rules.soldOut) {
    return {
      requestable: false,
      label: 'Sold out',
      reason: 'This experience is currently sold out.',
    }
  }
  if (date < window.minDate) {
    return {
      requestable: false,
      label: 'Too soon',
      reason: `Bookings require at least ${rules.minNoticeHours ?? CAPACITY.minNoticeHours} hours’ notice.`,
    }
  }
  if (date > window.maxDate) {
    return {
      requestable: false,
      label: 'Not open yet',
      reason: 'This date is outside the current booking window.',
    }
  }

  const availabilityType = rules.availabilityType ?? 'everyday'
  if (availabilityType === 'weekdays') {
    // getUTCDay() is 0–6, and WEEKDAY_BY_INDEX has all seven days.
    const weekday = WEEKDAY_BY_INDEX[new Date(`${date}T12:00:00.000Z`).getUTCDay()]!
    if (!rules.weekdays?.includes(weekday)) {
      return {
        requestable: false,
        label: 'Not running',
        reason: 'This experience does not normally run that day.',
      }
    }
  }

  if (availabilityType === 'on-request') return { requestable: true, label: 'Ask for this date' }
  if (availabilityType === 'private-only') return { requestable: true, label: 'Private request' }
  if (availabilityType === 'specific-dates') return { requestable: true, label: 'Date request' }
  return { requestable: true, label: 'Runs this day' }
}

export function firstRequestableDate(
  rules: AvailabilityRules,
  window: DateWindow,
): string | undefined {
  let cursor = new Date(`${window.minDate}T12:00:00.000Z`)
  const end = new Date(`${window.maxDate}T12:00:00.000Z`)

  while (cursor <= end) {
    const date = cursor.toISOString().slice(0, 10)
    if (evaluateDateAvailability(date, rules, window).requestable) return date
    cursor = new Date(cursor.getTime() + DAY_MS)
  }

  return undefined
}
