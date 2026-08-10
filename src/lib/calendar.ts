import type { Booking } from '@/payload-types'
import { bookingMaterialFrom, type BookingLinks } from '@/lib/booking-materials'

function escapeText(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('\r\n', '\\n')
    .replaceAll('\n', '\\n')
    .replaceAll(',', '\\,')
    .replaceAll(';', '\\;')
}

function foldLine(line: string): string {
  const output: string[] = []
  let current = ''
  let bytes = 0

  for (const character of line) {
    const characterBytes = Buffer.byteLength(character, 'utf8')
    if (bytes + characterBytes > 73 && current) {
      output.push(current)
      current = ` ${character}`
      bytes = 1 + characterBytes
    } else {
      current += character
      bytes += characterBytes
    }
  }
  if (current) output.push(current)
  return output.join('\r\n')
}

function utcStamp(value: Date): string {
  return value
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z')
}

function dateStamp(value: Date): string {
  return value.toISOString().slice(0, 10).replaceAll('-', '')
}

function durationHours(duration?: string): number {
  if (!duration) return 8
  const normalized = duration.toLowerCase()
  const hours = normalized.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)/)?.[1]
  if (hours) return Math.max(1, Math.min(24, Number(hours)))
  if (normalized.includes('half')) return 4
  if (normalized.includes('night')) return 4
  if (normalized.includes('full')) return 10
  return 8
}

export function createBookingCalendar(
  booking: Booking,
  links: BookingLinks,
  now = new Date(),
): string {
  const material = bookingMaterialFrom(booking)
  const start = new Date(material.departureDate)
  if (Number.isNaN(start.getTime())) throw new Error('Booking departure date is invalid.')

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Trivoxo//Booking Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${escapeText(material.reference.toLowerCase())}@trivoxogh.com`,
    `DTSTAMP:${utcStamp(now)}`,
  ]

  if (material.timeConfirmed) {
    const end = new Date(start.getTime() + durationHours(material.duration) * 60 * 60 * 1000)
    lines.push(`DTSTART:${utcStamp(start)}`, `DTEND:${utcStamp(end)}`)
  } else {
    const end = new Date(start)
    end.setUTCDate(end.getUTCDate() + 1)
    lines.push(`DTSTART;VALUE=DATE:${dateStamp(start)}`, `DTEND;VALUE=DATE:${dateStamp(end)}`)
  }

  lines.push(
    `SUMMARY:${escapeText(`${material.experienceTitle} with Trivoxo`)}`,
    `DESCRIPTION:${escapeText(`Booking ${material.reference}\n${material.travellers} traveller${material.travellers === 1 ? '' : 's'}\nManage trip: ${links.manage}`)}`,
    `LOCATION:${escapeText(material.pickup)}`,
    `URL:${links.manage}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  )

  return `${lines.map(foldLine).join('\r\n')}\r\n`
}
