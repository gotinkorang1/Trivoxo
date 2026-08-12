import type { Payload, PayloadRequest } from 'payload'
import type { Role } from '@/access/roles'
import type { AdminNotificationCategory } from '@/collections/AdminNotifications'

/**
 * Which staff roles should receive each kind of alert. Super Admins implicitly
 * receive everything (added in {@link staffRecipientsByRoles}).
 */
const RECIPIENT_ROLES: Record<Exclude<AdminNotificationCategory, 'account'>, Role[]> = {
  booking: ['operations', 'finance'],
  payment: ['operations', 'finance'],
  event_order: ['operations', 'finance', 'event-manager'],
  review: ['content-editor', 'operations'],
  enquiry: ['operations'],
}

type StaffUser = { id: number }

/** Staff whose roles intersect `roles` (Super Admins always included). */
async function staffRecipientsByRoles(payload: Payload, roles: Role[]): Promise<StaffUser[]> {
  const wanted = Array.from(new Set<Role>([...roles, 'super-admin']))
  const { docs } = await payload.find({
    collection: 'users',
    where: { roles: { in: wanted } },
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })
  return docs as StaffUser[]
}

/**
 * A duplicate-dedupeKey collision — i.e. this alert was already emitted. Recognised
 * both as a raw Postgres unique violation and as Payload's own ValidationError
 * (which is what `payload.create` surfaces for a unique field).
 */
function isDuplicate(err: unknown): boolean {
  const e = err as {
    code?: string
    name?: string
    message?: string
    data?: { errors?: Array<{ path?: string; message?: string }> }
    errors?: Array<{ path?: string; message?: string }>
  }
  if (e?.code === '23505') return true
  const msg = String(e?.message ?? '').toLowerCase()
  if (msg.includes('duplicate key') || msg.includes('unique constraint')) return true
  if (e?.name === 'ValidationError') {
    const errors = e.data?.errors ?? e.errors ?? []
    return errors.some(
      (x) =>
        String(x?.path ?? '').includes('dedupeKey') ||
        String(x?.message ?? '')
          .toLowerCase()
          .includes('unique'),
    )
  }
  return false
}

export type AdminNotificationInput = {
  category: Exclude<AdminNotificationCategory, 'account'>
  title: string
  message?: string
  /** Admin path the alert opens, e.g. `/admin/collections/bookings/12`. */
  adminURL?: string
  /**
   * Stable identifier for this source event (e.g. `booking-created:12`). One row
   * is created per recipient as `${dedupeBase}:${userId}`, so a re-firing hook
   * cannot duplicate alerts.
   */
  dedupeBase: string
}

/**
 * Fan a source event out into one in-app alert per relevant staff member.
 *
 * Best-effort by contract: it never throws, so a notification problem can never
 * block the booking/review/enquiry that triggered it. Each row is created in its
 * own request (no shared transaction) so one duplicate-key collision cannot
 * poison the others.
 */
export async function emitAdminNotifications(
  payload: Payload,
  input: AdminNotificationInput,
): Promise<void> {
  try {
    const recipients = await staffRecipientsByRoles(payload, RECIPIENT_ROLES[input.category])
    if (recipients.length === 0) return

    const emailConfigured = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM)

    for (const user of recipients) {
      try {
        await payload.create({
          collection: 'admin-notifications',
          data: {
            recipient: user.id,
            category: input.category,
            title: input.title,
            message: input.message,
            adminURL: input.adminURL,
            dedupeKey: `${input.dedupeBase}:${user.id}`,
            emailStatus: emailConfigured ? 'pending' : 'skipped',
          },
          overrideAccess: true,
        })
      } catch (err) {
        if (!isDuplicate(err)) {
          payload.logger.error({
            msg: 'Failed to create staff alert',
            err,
            dedupeBase: input.dedupeBase,
            recipient: user.id,
          })
        }
      }
    }
  } catch (err) {
    payload.logger.error({ msg: 'emitAdminNotifications failed', err, dedupeBase: input.dedupeBase })
  }
}

/**
 * Await-in-hook wrapper for collection afterChange hooks. We intentionally await
 * (rather than fire-and-forget) so the inserts complete within the request — a
 * serverless function can freeze the moment it returns, dropping detached work.
 * {@link emitAdminNotifications} never throws, so awaiting it cannot fail the save.
 */
export async function emitAdminNotificationsFromHook(
  req: PayloadRequest,
  input: AdminNotificationInput,
): Promise<void> {
  await emitAdminNotifications(req.payload, input)
}
