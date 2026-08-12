import type { Payload } from 'payload'
import { Resend } from 'resend'
import type { AdminNotification, User } from '@/payload-types'
import { ADMIN_NOTIFICATION_CATEGORIES } from '@/collections/AdminNotifications'
import { AdminAlertEmail } from '@/emails/AdminAlertEmail'

const CATEGORY_LABEL = new Map(ADMIN_NOTIFICATION_CATEGORIES.map((c) => [c.value, c.label]))

export type AdminNotificationDeliveryResult = {
  processed: number
  sent: number
  failed: number
  skipped: number
}

/** Absolute admin URL for the email button (relative path stored on the row). */
function absoluteURL(path?: string | null): string | undefined {
  if (!path) return undefined
  const base = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, '')
  if (!base) return undefined
  return path.startsWith('http') ? path : `${base}${path}`
}

/**
 * Deliver pending staff-alert emails. Idempotent per row (Resend idempotency key
 * = the row's dedupeKey), and gated on email configuration — with email off,
 * rows are created 'skipped' at write time and never reach here, so in-app
 * alerts work regardless. Called from the process-notifications cron.
 */
export async function processAdminNotifications(
  payload: Payload,
  { limit = 50 }: { limit?: number } = {},
): Promise<AdminNotificationDeliveryResult> {
  const from = process.env.EMAIL_FROM
  const apiKey = process.env.RESEND_API_KEY
  if (!from || !apiKey) {
    return { processed: 0, sent: 0, failed: 0, skipped: 0 }
  }

  const { docs } = await payload.find({
    collection: 'admin-notifications',
    where: { emailStatus: { equals: 'pending' } },
    depth: 1,
    limit,
    sort: 'createdAt',
    overrideAccess: true,
  })

  const resend = new Resend(apiKey)
  const result: AdminNotificationDeliveryResult = {
    processed: docs.length,
    sent: 0,
    failed: 0,
    skipped: 0,
  }

  for (const doc of docs as AdminNotification[]) {
    const recipient = typeof doc.recipient === 'object' ? (doc.recipient as User) : null
    const email = recipient?.email
    if (!email) {
      await markStatus(payload, doc.id, 'failed', 'Recipient has no email address.')
      result.failed += 1
      continue
    }

    // Respect the per-user opt-out — the in-app alert already exists, so we
    // simply skip the email rather than fail it.
    if (recipient?.emailAlerts === false) {
      await markStatus(payload, doc.id, 'skipped')
      result.skipped += 1
      continue
    }

    try {
      const { data, error } = await resend.emails.send(
        {
          from,
          to: email,
          subject: `[Trivoxo] ${doc.title}`,
          react: (
            <AdminAlertEmail
              recipientName={recipient?.name ?? undefined}
              categoryLabel={CATEGORY_LABEL.get(doc.category) ?? 'Update'}
              title={doc.title}
              message={doc.message ?? undefined}
              actionURL={absoluteURL(doc.adminURL)}
            />
          ),
        },
        { idempotencyKey: `admin-alert:${doc.dedupeKey}` },
      )
      if (error || !data?.id) throw new Error(error?.message || 'Resend returned no message ID.')
      await markStatus(payload, doc.id, 'sent')
      result.sent += 1
    } catch (err) {
      await markStatus(payload, doc.id, 'failed', err instanceof Error ? err.message : 'Send failed')
      result.failed += 1
    }
  }

  return result
}

async function markStatus(
  payload: Payload,
  id: number | string,
  emailStatus: 'sent' | 'failed' | 'skipped',
  emailError?: string,
): Promise<void> {
  await payload.update({
    collection: 'admin-notifications',
    id,
    data: emailStatus === 'failed' ? { emailStatus, emailError } : { emailStatus },
    overrideAccess: true,
  })
}
