import type { CollectionConfig } from 'payload'
import { hasRole } from '../access/roles'

/** Categories of staff alert. Drives the icon/colour in the admin bell. */
export const ADMIN_NOTIFICATION_CATEGORIES = [
  { label: 'New booking', value: 'booking' },
  { label: 'Payment received', value: 'payment' },
  { label: 'New review', value: 'review' },
  { label: 'New enquiry', value: 'enquiry' },
  { label: 'New ticket order', value: 'event_order' },
  { label: 'Account update', value: 'account' },
] as const

export type AdminNotificationCategory =
  (typeof ADMIN_NOTIFICATION_CATEGORIES)[number]['value']

/** Email delivery state for the per-recipient alert. */
export const ADMIN_NOTIFICATION_EMAIL_STATUSES = [
  { label: 'Pending', value: 'pending' },
  { label: 'Sent', value: 'sent' },
  { label: 'Skipped (email off)', value: 'skipped' },
  { label: 'Failed', value: 'failed' },
] as const

/** Current user's id from the request, regardless of depth. */
function currentUserId(user: unknown): number | string | undefined {
  if (user && typeof user === 'object' && 'id' in user) {
    return (user as { id: number | string }).id
  }
  return undefined
}

/**
 * In-app staff alerts — one row per recipient so read state is per-user.
 *
 * A source event (new booking, review, enquiry, payment, ticket order) fans out
 * into one row per staff member whose role should see it. `dedupeKey` is unique,
 * so a hook that re-fires (Payload afterChange can run more than once) never
 * creates duplicates. Staff can only ever see and mutate their own rows.
 *
 * This is deliberately separate from the customer-facing `notifications`
 * outbox: mixing staff alerts into that idempotent transactional table would
 * pollute its delivery audit.
 */
export const AdminNotifications: CollectionConfig = {
  slug: 'admin-notifications',
  labels: { singular: 'Staff alert', plural: 'Staff alerts' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'recipient', 'readAt', 'emailStatus'],
    group: 'System',
    description: 'In-app alerts fanned out to staff. Managed automatically.',
    hidden: ({ user }) =>
      // Only Super Admins see the raw feed in the sidebar; everyone consumes
      // their own alerts through the notification bell.
      !((user as { roles?: string[] })?.roles ?? []).includes('super-admin'),
  },
  access: {
    // Staff read only their own alerts; Super Admins/Operations can audit all.
    read: ({ req }) => {
      if (!req.user) return false
      const roles = (req.user as { roles?: string[] }).roles ?? []
      if (roles.includes('super-admin') || roles.includes('operations')) return true
      const id = currentUserId(req.user)
      return id ? { recipient: { equals: id } } : false
    },
    // Recipients may update their own row (to mark it read). Nothing else.
    update: ({ req }) => {
      if (!req.user) return false
      const id = currentUserId(req.user)
      return id ? { recipient: { equals: id } } : false
    },
    // Rows are created by server-side hooks (overrideAccess), never via the API.
    create: () => false,
    delete: hasRole('operations'),
  },
  fields: [
    {
      name: 'recipient',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [...ADMIN_NOTIFICATION_CATEGORIES],
      index: true,
      admin: { readOnly: true, position: 'sidebar' },
    },
    { name: 'title', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'message', type: 'textarea', admin: { readOnly: true } },
    {
      name: 'adminURL',
      label: 'Opens',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Admin path the alert links to, e.g. /admin/collections/bookings/12.',
      },
    },
    {
      name: 'readAt',
      label: 'Read at',
      type: 'date',
      index: true,
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'dedupeKey',
      label: 'Idempotency key',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'emailStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [...ADMIN_NOTIFICATION_EMAIL_STATUSES],
      index: true,
      admin: { readOnly: true, position: 'sidebar' },
    },
    { name: 'emailError', type: 'textarea', admin: { readOnly: true, hidden: true } },
  ],
}
