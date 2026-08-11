import config from '@payload-config'
import { getPayload } from 'payload'
import { evaluateDateAvailability, getBookingWindow, isIsoDate } from '@/lib/availability'
import { getDateInventory } from '@/lib/booking-inventory'
import { CAPACITY } from '@/lib/policies'
import {
  checkRateLimit,
  rateLimitMessage,
  rateLimitResponseHeaders,
} from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const slug = url.searchParams.get('experience')?.trim() ?? ''
  const date = url.searchParams.get('date')?.trim() ?? ''
  const partySize = Number(url.searchParams.get('travellers') ?? 1)

  if (!slug || !isIsoDate(date) || !Number.isInteger(partySize) || partySize < 1) {
    return Response.json({ error: 'Invalid availability request.' }, { status: 400 })
  }

  const rateLimit = await checkRateLimit('availability', request.headers)
  const limitHeaders = rateLimitResponseHeaders(rateLimit)
  if (!rateLimit.allowed) {
    return Response.json(
      { error: rateLimitMessage(rateLimit) },
      { status: 429, headers: limitHeaders },
    )
  }

  const payload = await getPayload({ config })
  const found = await payload.find({
    collection: 'experiences',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: slug } },
  })
  const experience = found.docs[0]
  if (!experience)
    return Response.json({ error: 'Experience not found.' }, { status: 404, headers: limitHeaders })

  const rules = {
    availabilityType: experience.availabilityType,
    weekdays: experience.weekdays ?? undefined,
    minNoticeHours: experience.minNoticeHours ?? undefined,
    maxAdvanceDays: experience.maxAdvanceDays ?? undefined,
    soldOut: Boolean(experience.soldOut),
  }
  const dateRule = evaluateDateAvailability(date, rules, getBookingWindow(rules))
  if (!dateRule.requestable) {
    return Response.json(
      {
        available: false,
        maxRemainingSeats: 0,
        message: dateRule.reason ?? 'Choose another date.',
        status: 'closed',
      },
      { headers: { ...limitHeaders, 'Cache-Control': 'no-store' } },
    )
  }

  const inventory = await getDateInventory(payload, experience, date, { partySize })
  let message = 'Seats are available for this date.'
  if (!inventory.available && inventory.status === 'no-departure') {
    message = 'No departure is scheduled on this date.'
  } else if (!inventory.available && inventory.status === 'closed') {
    message = 'Trivoxo has closed this date.'
  } else if (!inventory.available) {
    message = 'This date is sold out for your group size.'
  } else if (inventory.autoProvisioned) {
    message = 'This date is available on request. Your seats will be held when you continue.'
  } else if (inventory.maxRemainingSeats <= Math.max(partySize + 3, 5)) {
    message = `Only ${inventory.maxRemainingSeats} seat${inventory.maxRemainingSeats === 1 ? '' : 's'} remain on one departure.`
  }

  return Response.json(
    { ...inventory, message, maxOnlineGuests: experience.maxGuests ?? CAPACITY.maxGuests },
    { headers: { ...limitHeaders, 'Cache-Control': 'no-store' } },
  )
}
