import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import {
  createBookingHold,
  expireStaleBookingHolds,
  getDateInventory,
  settleVerifiedBookingPayment,
} from '@/lib/booking-inventory'
import type { Experience, Payment } from '@/payload-types'

let payload: Payload
const experienceIDs: number[] = []
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

function futureDate(days: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

async function createExperience(name: string, capacity = 2): Promise<Experience> {
  const experience = await payload.create({
    collection: 'experiences',
    depth: 0,
    overrideAccess: true,
    data: {
      title: `${name} ${suffix}`,
      slug: `${name.toLowerCase().replaceAll(' ', '-')}-${suffix}`,
      pricingStrategy: 'fixed',
      priceFrom: 1400,
      availabilityType: 'everyday',
      minGuests: 1,
      maxGuests: capacity,
      minNoticeHours: 0,
      maxAdvanceDays: 365,
      _status: 'published',
    },
  })
  experienceIDs.push(experience.id)
  return experience
}

function holdInput(experience: Experience, date: string, now = new Date()) {
  return {
    experience,
    date,
    adults: 2,
    children: 0,
    booker: {
      firstName: 'Payment',
      lastName: 'Tester',
      email: `payment-${suffix}@example.com`,
      phone: '0200000000',
    },
    totalAmount: 2800,
    now,
    holdMinutes: 1,
  }
}

async function createPayment(bookingID: number, reference: string): Promise<Payment> {
  return payload.create({
    collection: 'payments',
    depth: 0,
    overrideAccess: true,
    data: {
      reference,
      booking: bookingID,
      gateway: 'paystack',
      gatewayReference: reference,
      status: 'initialized',
      amountMinor: 280000,
      currency: 'GHS',
    },
  })
}

function audit(transactionID: string) {
  return {
    gatewayTransactionId: transactionID,
    channel: 'mobile_money',
    paidAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
    verificationSnapshot: { status: 'success', amountMinor: 280000, currency: 'GHS' },
  }
}

describe('payment and inventory settlement', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(async () => {
    for (const experienceID of experienceIDs) {
      const bookings = await payload.find({
        collection: 'bookings',
        depth: 0,
        limit: 100,
        overrideAccess: true,
        where: { experience: { equals: experienceID } },
      })
      for (const booking of bookings.docs) {
        const payments = await payload.find({
          collection: 'payments',
          depth: 0,
          limit: 100,
          overrideAccess: true,
          where: { booking: { equals: booking.id } },
        })
        for (const payment of payments.docs) {
          await payload.delete({ collection: 'payments', id: payment.id, overrideAccess: true })
        }
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
      await payload.delete({ collection: 'experiences', id: experienceID, overrideAccess: true })
    }
  })

  it('confirms seats once and treats duplicate gateway delivery idempotently', async () => {
    const experience = await createExperience('Verified Payment')
    const held = await createBookingHold(payload, holdInput(experience, futureDate(60), new Date()))
    const payment = await createPayment(held.booking.id, `TVXP-IDEMPOTENT-${suffix}`)

    const results = await Promise.all([
      settleVerifiedBookingPayment(payload, payment.id, audit('10000000001')),
      settleVerifiedBookingPayment(payload, payment.id, audit('10000000001')),
    ])
    expect(results.map((result) => result.outcome).sort()).toEqual([
      'already_processed',
      'confirmed',
    ])

    const booking = await payload.findByID({
      collection: 'bookings',
      id: held.booking.id,
      depth: 0,
      overrideAccess: true,
    })
    const storedPayment = await payload.findByID({
      collection: 'payments',
      id: payment.id,
      depth: 0,
      overrideAccess: true,
    })
    expect(booking).toMatchObject({
      status: 'paid',
      inventoryState: 'confirmed',
      paymentState: 'paid',
    })
    expect(storedPayment).toMatchObject({ status: 'succeeded', channel: 'mobile_money' })
  })

  it('flags a late successful payment instead of overbooking reallocated capacity', async () => {
    const experience = await createExperience('Late Payment')
    const now = new Date()
    const date = futureDate(70)
    const first = await createBookingHold(payload, holdInput(experience, date, now))
    const payment = await createPayment(first.booking.id, `TVXP-LATE-${suffix}`)
    const afterExpiry = new Date(now.getTime() + 2 * 60 * 1000)
    await expireStaleBookingHolds(payload, { now: afterExpiry })
    await createBookingHold(payload, holdInput(experience, date, afterExpiry))

    const result = await settleVerifiedBookingPayment(payload, payment.id, audit('10000000002'))
    expect(result).toMatchObject({ outcome: 'review' })
    expect(result.reason).toContain('inventory could not be confirmed')
    expect(result.booking).toMatchObject({
      status: 'payment_review',
      inventoryState: 'released',
      paymentState: 'paid',
    })
    expect(result.payment).toMatchObject({ status: 'review' })

    const inventory = await getDateInventory(payload, experience, date, {
      now: afterExpiry,
      partySize: 1,
    })
    expect(inventory).toMatchObject({ available: false, maxRemainingSeats: 0 })
  })
})
