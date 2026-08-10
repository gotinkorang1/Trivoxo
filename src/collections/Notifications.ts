import type { CollectionConfig } from 'payload'
import { hasRole } from '../access/roles'

export const NOTIFICATION_STATUSES = [
  { label: 'Queued', value: 'queued' },
  { label: 'Processing', value: 'processing' },
  { label: 'Sent', value: 'sent' },
  { label: 'Retry scheduled', value: 'failed' },
  { label: 'Action needed', value: 'dead_letter' },
] as const

/**
 * Durable transactional-message outbox. A booking transaction creates one
 * deterministic notification row; delivery happens only after the transaction
 * commits and can safely be retried without sending the same email twice.
 */
export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'notificationKey',
    defaultColumns: ['type', 'recipient', 'status', 'attempts', 'sentAt'],
    group: 'Operations',
    description: 'Booking emails awaiting delivery, sent messages, and items that need attention.',
  },
  access: {
    read: hasRole('operations', 'finance'),
    create: hasRole('operations'),
    update: hasRole('operations'),
    delete: hasRole('operations'),
  },
  fields: [
    {
      name: 'notificationKey',
      label: 'Idempotency key',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'booking_confirmed',
      options: [{ label: 'Booking confirmed', value: 'booking_confirmed' }],
      index: true,
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'queued',
      options: [...NOTIFICATION_STATUSES],
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'booking',
      type: 'relationship',
      relationTo: 'bookings',
      index: true,
      admin: {
        readOnly: true,
        description:
          'Set automatically. Kept nullable so deleting a booking does not corrupt the outbox audit.',
      },
    },
    {
      name: 'recipient',
      type: 'email',
      required: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'accessExpiresAt',
      label: 'Private link expires',
      type: 'date',
      required: true,
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'payloadSnapshot',
      label: 'Confirmation snapshot',
      type: 'json',
      required: true,
      admin: {
        hidden: true,
        readOnly: true,
        description: 'Immutable customer-facing data used to make provider retries byte-stable.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'attempts',
          type: 'number',
          required: true,
          defaultValue: 0,
          min: 0,
          admin: { width: '33%', readOnly: true },
        },
        {
          name: 'nextAttemptAt',
          label: 'Next attempt',
          type: 'date',
          index: true,
          admin: { width: '33%', readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
        },
        {
          name: 'lockedAt',
          label: 'Processing since',
          type: 'date',
          index: true,
          admin: { width: '34%', readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
        },
      ],
    },
    {
      name: 'sentAt',
      type: 'date',
      index: true,
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'providerMessageId', type: 'text', admin: { readOnly: true } },
    { name: 'lastError', type: 'textarea', admin: { readOnly: true } },
  ],
}
