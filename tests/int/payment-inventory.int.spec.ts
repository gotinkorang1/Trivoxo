import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import {
  createBookingHold,
  expireStaleBookingHolds,
  getDateInventory,
  settleVerifiedBookingPayment,
} from '@/lib/booking-inventory'
import type { Experience, Payment } from '@/payload-types'
import { processBookingNotifications, type BookingConfirmationSender } from '@/lib/notifications'

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
        const notifications = await payload.find({
          collection: 'notifications',
          depth: 0,
          limit: 100,
          overrideAccess: true,
          where: { booking: { equals: booking.id } },
        })
        for (const notification of notifications.docs) {
          await payload.delete({
            collection: 'notifications',
            id: notification.id,
            overrideAccess: true,
          })
        }
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

    const queued = await payload.find({
      collection: 'notifications',
      depth: 0,
      limit: 10,
      overrideAccess: true,
      where: { booking: { equals: booking.id } },
    })
    expect(queued.totalDocs).toBe(1)
    expect(queued.docs[0]).toMatchObject({
      type: 'booking_confirmed',
      status: 'queued',
      recipient: booking.booker.email,
      payloadSnapshot: {
        reference: booking.reference,
        experienceTitle: expect.stringContaining('Verified Payment'),
        totalAmount: 2800,
      },
    })
    expect(queued.docs[0].accessExpiresAt).toBeTruthy()

    const sender = vi.fn(async (_input: Parameters<BookingConfirmationSender>[0]) => ({
      id: 'email_test_idempotent',
    }))
    const deliveries = await Promise.all([
      processBookingNotifications(payload, { bookingID: booking.id, limit: 1, sender }),
      processBookingNotifications(payload, { bookingID: booking.id, limit: 1, sender }),
    ])
    expect(deliveries.reduce((total, delivery) => total + delivery.sent, 0)).toBe(1)
    expect(sender).toHaveBeenCalledTimes(1)
    expect(sender.mock.calls[0][0].idempotencyKey).toBe(`booking-confirmed/${booking.id}/v1`)

    const sent = await payload.findByID({
      collection: 'notifications',
      id: queued.docs[0].id,
      depth: 0,
      overrideAccess: true,
    })
    expect(sent).toMatchObject({
      status: 'sent',
      attempts: 1,
      providerMessageId: 'email_test_idempotent',
    })
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

    const notifications = await payload.find({
      collection: 'notifications',
      depth: 0,
      limit: 10,
      overrideAccess: true,
      where: { booking: { equals: first.booking.id } },
    })
    expect(notifications.totalDocs).toBe(0)

    const inventory = await getDateInventory(payload, experience, date, {
      now: afterExpiry,
      partySize: 1,
    })
    expect(inventory).toMatchObject({ available: false, maxRemainingSeats: 0 })
  })

  it('schedules a backoff after email failure and retries only when due', async () => {
    const experience = await createExperience('Email Retry')
    const held = await createBookingHold(payload, holdInput(experience, futureDate(80), new Date()))
    const payment = await createPayment(held.booking.id, `TVXP-EMAIL-${suffix}`)
    const settlement = await settleVerifiedBookingPayment(payload, payment.id, audit('10000000003'))
    const now = new Date('2026-08-10T18:00:00.000Z')

    const failed = await processBookingNotifications(payload, {
      bookingID: held.booking.id,
      limit: 1,
      now,
      sender: async () => {
        throw new Error('Temporary provider outage')
      },
    })
    expect(settlement.outcome).toBe('confirmed')
    expect(failed).toMatchObject({ scanned: 1, failed: 1, sent: 0 })

    const notification = (
      await payload.find({
        collection: 'notifications',
        depth: 0,
        limit: 1,
        overrideAccess: true,
        where: { booking: { equals: held.booking.id } },
      })
    ).docs[0]
    expect(notification).toMatchObject({ status: 'failed', attempts: 1 })
    expect(new Date(notification.nextAttemptAt!).getTime()).toBeGreaterThan(now.getTime())

    const tooEarly = await processBookingNotifications(payload, {
      bookingID: held.booking.id,
      limit: 1,
      now,
      sender: async () => ({ id: 'must-not-send' }),
    })
    expect(tooEarly.scanned).toBe(0)

    const retry = await processBookingNotifications(payload, {
      bookingID: held.booking.id,
      limit: 1,
      now: new Date(new Date(notification.nextAttemptAt!).getTime() + 1),
      sender: async () => ({ id: 'email_retry_success' }),
    })
    expect(retry).toMatchObject({ scanned: 1, sent: 1, failed: 0 })

    const sent = await payload.findByID({
      collection: 'notifications',
      id: notification.id,
      depth: 0,
      overrideAccess: true,
    })
    expect(sent).toMatchObject({
      status: 'sent',
      attempts: 2,
      providerMessageId: 'email_retry_success',
    })
  })
})
