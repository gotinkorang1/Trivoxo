import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { emitAdminNotifications } from '@/lib/admin-notifications'

let payload: Payload
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const createdUserIDs: number[] = []
let userSeq = 0

async function makeStaff(roles: string[]): Promise<number> {
  userSeq += 1
  const user = await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: {
      name: `Staff ${roles.join('-')} ${userSeq}`,
      email: `staff-${userSeq}-${suffix}@example.com`,
      password: 'test-password-123',
      roles: roles as ('operations' | 'finance' | 'content-editor')[],
    },
  })
  createdUserIDs.push(user.id)
  return user.id
}

/**
 * Rows this specific emit produced for a user, matched by the exact dedupeKey
 * (`${dedupeBase}:${userId}`). Matching the key rather than the category keeps
 * assertions immune to booking/review alerts other test files create
 * concurrently against the shared database.
 */
async function alertsFor(recipient: number, dedupeBase: string) {
  const { docs } = await payload.find({
    collection: 'admin-notifications',
    where: { dedupeKey: { equals: `${dedupeBase}:${recipient}` } },
    overrideAccess: true,
  })
  return docs
}

beforeAll(async () => {
  payload = await getPayload({ config })
})

afterAll(async () => {
  // Remove alerts then the users they reference.
  for (const id of createdUserIDs) {
    await payload.delete({
      collection: 'admin-notifications',
      where: { recipient: { equals: id } },
      overrideAccess: true,
    })
  }
  for (const id of createdUserIDs) {
    await payload.delete({ collection: 'users', id, overrideAccess: true }).catch(() => {})
  }
})

describe('admin notification fan-out', () => {
  it('routes a booking alert to Operations but not to a Content Editor', async () => {
    const ops = await makeStaff(['operations'])
    const content = await makeStaff(['content-editor'])
    const dedupeBase = `booking-created:${suffix}-route`

    await emitAdminNotifications(payload, { category: 'booking', title: 'New booking', dedupeBase })

    expect(await alertsFor(ops, dedupeBase)).toHaveLength(1)
    expect(await alertsFor(content, dedupeBase)).toHaveLength(0)
  })

  it('routes a review alert to both Operations and Content Editor', async () => {
    const ops = await makeStaff(['operations'])
    const content = await makeStaff(['content-editor'])
    const dedupeBase = `review-created:${suffix}-route`

    await emitAdminNotifications(payload, { category: 'review', title: 'New review', dedupeBase })

    expect(await alertsFor(ops, dedupeBase)).toHaveLength(1)
    expect(await alertsFor(content, dedupeBase)).toHaveLength(1)
  })

  it('is idempotent — re-emitting the same event does not duplicate', async () => {
    const ops = await makeStaff(['operations'])
    const dedupeBase = `enquiry-corporate:${suffix}-idem`

    await emitAdminNotifications(payload, { category: 'enquiry', title: 'Enquiry', dedupeBase })
    await emitAdminNotifications(payload, { category: 'enquiry', title: 'Enquiry', dedupeBase })

    expect(await alertsFor(ops, dedupeBase)).toHaveLength(1)
  })

  it('marks email skipped when Resend is not configured', async () => {
    const ops = await makeStaff(['operations'])
    const dedupeBase = `payment-succeeded:${suffix}-skip`

    await emitAdminNotifications(payload, { category: 'payment', title: 'Payment received', dedupeBase })

    const docs = await alertsFor(ops, dedupeBase)
    expect(docs).toHaveLength(1)
    // No RESEND_API_KEY/EMAIL_FROM in the test env → created as skipped, not pending.
    expect(docs[0]!.emailStatus).toBe('skipped')
  })
})
