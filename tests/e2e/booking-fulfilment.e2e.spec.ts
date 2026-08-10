import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { createBookingAccessToken } from '@/lib/booking-access'

test('a confirmed guest can download a private voucher and calendar event', async ({ page }) => {
  const payload = await getPayload({ config: await config })
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const startsAt = new Date()
  startsAt.setUTCDate(startsAt.getUTCDate() + 45)
  startsAt.setUTCHours(7, 0, 0, 0)

  const experience = await payload.create({
    collection: 'experiences',
    depth: 0,
    overrideAccess: true,
    data: {
      title: `Voucher QA ${suffix}`,
      slug: `voucher-qa-${suffix}`,
      pricingStrategy: 'fixed',
      priceFrom: 1400,
      availabilityType: 'everyday',
      minGuests: 1,
      maxGuests: 5,
      minNoticeHours: 0,
      maxAdvanceDays: 365,
      duration: 'Full Day',
      meetingPoint: 'Plantsville Residence, Accra',
      whatToBring: [{ text: 'Comfortable walking shoes' }],
      _status: 'published',
    },
  })
  const departure = await payload.create({
    collection: 'departures',
    depth: 0,
    overrideAccess: true,
    data: {
      experience: experience.id,
      startsAt: startsAt.toISOString(),
      timeConfirmed: true,
      capacity: 5,
      status: 'scheduled',
      inventoryKey: `${experience.id}:${startsAt.toISOString()}`,
    },
  })
  const booking = await payload.create({
    collection: 'bookings',
    depth: 0,
    overrideAccess: true,
    data: {
      status: 'paid',
      source: 'website',
      experience: experience.id,
      departure: departure.id,
      departureDate: startsAt.toISOString(),
      adults: 2,
      children: 0,
      booker: {
        firstName: 'Ama',
        lastName: 'Mensah',
        email: `voucher-${suffix}@example.com`,
        phone: '0593962111',
      },
      pickup: 'Plantsville Residence, Poultry Farm Ave, Accra',
      totalAmount: 2800,
      paymentState: 'paid',
    },
  })

  try {
    const access = createBookingAccessToken(booking.reference!, { ttlSeconds: 10 * 60 })
    await page.goto(
      `http://localhost:3000/booking/${encodeURIComponent(booking.reference!)}?access=${encodeURIComponent(access)}`,
    )

    await expect(page.getByRole('heading', { name: /Your booking is confirmed/ })).toBeVisible()
    await expect(page.getByText('Your trip documents are ready')).toBeVisible()

    const voucherDownload = page.waitForEvent('download')
    await page.getByRole('link', { name: 'Download voucher' }).click()
    const voucher = await voucherDownload
    const voucherPath = await voucher.path()
    expect(voucher.suggestedFilename()).toMatch(/^Trivoxo-TVX-.*-voucher\.pdf$/)
    expect(voucherPath).toBeTruthy()
    const voucherBytes = await readFile(voucherPath!)
    expect(voucherBytes.subarray(0, 4).toString()).toBe('%PDF')

    const calendarDownload = page.waitForEvent('download')
    await page.getByRole('link', { name: 'Add to calendar' }).click()
    const calendar = await calendarDownload
    const calendarPath = await calendar.path()
    expect(calendar.suggestedFilename()).toMatch(/^Trivoxo-TVX-.*\.ics$/)
    expect(calendarPath).toBeTruthy()
    const calendarText = await readFile(calendarPath!, 'utf8')
    expect(calendarText).toContain('BEGIN:VCALENDAR')
    expect(calendarText).toContain(`UID:${booking.reference!.toLowerCase()}@trivoxogh.com`)
  } finally {
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
    await payload.delete({ collection: 'bookings', id: booking.id, overrideAccess: true })
    await payload.delete({ collection: 'departures', id: departure.id, overrideAccess: true })
    await payload.delete({ collection: 'experiences', id: experience.id, overrideAccess: true })
  }
})
