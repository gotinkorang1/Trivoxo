import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import {
  createBookingHold,
  expireStaleBookingHolds,
  getDateInventory,
  InventoryError,
} from '@/lib/booking-inventory'
import type { Experience } from '@/payload-types'

let payload: Payload
const createdExperienceIDs: number[] = []
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

function futureDate(days: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

async function createInventoryExperience(name: string, capacity: number): Promise<Experience> {
  const experience = await payload.create({
    collection: 'experiences',
    depth: 0,
    overrideAccess: true,
    data: {
      title: `${name} ${suffix}`,
      slug: `${name.toLowerCase().replaceAll(' ', '-')}-${suffix}`,
      pricingStrategy: 'fixed',
      priceFrom: 100,
      availabilityType: 'everyday',
      minGuests: 1,
      maxGuests: capacity,
      minNoticeHours: 0,
      maxAdvanceDays: 365,
      _status: 'published',
    },
  })
  createdExperienceIDs.push(experience.id)
  return experience
}

function holdInput(experience: Experience, date: string, adults: number, now?: Date) {
  return {
    experience,
    date,
    adults,
    children: 0,
    booker: {
      firstName: 'Inventory',
      lastName: 'Test',
      email: `inventory-${suffix}@example.com`,
      phone: '0200000000',
    },
    totalAmount: adults * 100,
    now,
  }
}

describe('transactional booking inventory', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(async () => {
    for (const experienceID of createdExperienceIDs) {
      const bookings = await payload.find({
        collection: 'bookings',
        depth: 0,
        limit: 100,
        overrideAccess: true,
        where: { experience: { equals: experienceID } },
      })
      for (const booking of bookings.docs) {
        await payload.delete({ collection: 'bookings', id: booking.id, overrideAccess: true })
      }

      const departures = await payload.find({
        collection: 'departures',
        depth: 0,
        limit: 100,
        overrideAccess: true,
        where: { experience: { equals: experienceID } },
      })
      for (const departure of departures.docs) {
        await payload.delete({ collection: 'departures', id: departure.id, overrideAccess: true })
      }

      await payload.delete({
        collection: 'experiences',
        id: experienceID,
        overrideAccess: true,
      })
    }
  })

  it('serializes simultaneous holds so capacity cannot be oversold', async () => {
    const experience = await createInventoryExperience('Concurrent Hold', 3)
    const date = futureDate(35)

    const results = await Promise.allSettled([
      createBookingHold(payload, holdInput(experience, date, 2)),
      createBookingHold(payload, holdInput(experience, date, 2)),
    ])

    const fulfilled = results.filter((result) => result.status === 'fulfilled')
    const rejected = results.filter((result) => result.status === 'rejected')
    expect(fulfilled).toHaveLength(1)
    expect(rejected).toHaveLength(1)
    expect(rejected[0]).toMatchObject({
      reason: expect.objectContaining({
        name: 'InventoryError',
        code: 'CAPACITY_UNAVAILABLE',
        remainingSeats: 1,
      }),
    })

    const departures = await payload.find({
      collection: 'departures',
      depth: 0,
      overrideAccess: true,
      where: { experience: { equals: experience.id } },
    })
    expect(departures.totalDocs).toBe(1)
    expect(departures.docs[0]?.capacity).toBe(3)

    const inventory = await getDateInventory(payload, experience, date, { partySize: 2 })
    expect(inventory).toMatchObject({
      available: false,
      departureCount: 1,
      maxRemainingSeats: 1,
      status: 'sold-out',
    })
  })

  it('returns expired seats to inventory by timestamp and reconciles the booking status', async () => {
    const experience = await createInventoryExperience('Expiring Hold', 2)
    const date = futureDate(42)
    const now = new Date()
    const first = await createBookingHold(payload, {
      ...holdInput(experience, date, 2, now),
      holdMinutes: 1,
    })
    const afterExpiry = new Date(now.getTime() + 2 * 60 * 1000)

    // Capacity is available immediately after expiresAt, even before cleanup.
    const availableAgain = await getDateInventory(payload, experience, date, {
      now: afterExpiry,
      partySize: 2,
    })
    expect(availableAgain).toMatchObject({ available: true, maxRemainingSeats: 2 })

    const cleanup = await expireStaleBookingHolds(payload, { now: afterExpiry })
    expect(cleanup.expired).toBeGreaterThanOrEqual(1)
    const expired = await payload.findByID({
      collection: 'bookings',
      id: first.booking.id,
      depth: 0,
      overrideAccess: true,
    })
    expect(expired).toMatchObject({ status: 'expired', inventoryState: 'released' })

    const second = await createBookingHold(payload, holdInput(experience, date, 2, afterExpiry))
    expect(second.booking).toMatchObject({ status: 'held', capacitySeats: 2 })
  })

  it('rejects active inventory mutations that do not have a departure', async () => {
    const experience = await createInventoryExperience('Manual Guard', 4)

    await expect(
      payload.create({
        collection: 'bookings',
        overrideAccess: true,
        data: {
          status: 'confirmed',
          source: 'phone',
          experience: experience.id,
          departureDate: `${futureDate(50)}T12:00:00.000Z`,
          adults: 2,
          children: 0,
          booker: {
            firstName: 'Manual',
            lastName: 'Test',
            email: `manual-${suffix}@example.com`,
            phone: '0200000001',
          },
        },
      }),
    ).rejects.toBeInstanceOf(InventoryError)
  })
})
