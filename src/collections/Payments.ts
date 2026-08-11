import type { CollectionConfig } from 'payload'
import { hasRole } from '../access/roles'

export const PAYMENT_STATUSES = [
  { label: 'Initializing', value: 'initializing' },
  { label: 'Checkout ready', value: 'initialized' },
  { label: 'Pending', value: 'pending' },
  { label: 'Succeeded', value: 'succeeded' },
  { label: 'Failed', value: 'failed' },
  { label: 'Abandoned', value: 'abandoned' },
  { label: 'Finance review', value: 'review' },
  { label: 'Refunded', value: 'refunded' },
] as const

/**
 * Gateway payment attempts. Amounts are stored in the currency's minor unit
 * (pesewas for GHS) so equality checks never depend on floating-point maths.
 *
 * A payment settles exactly one of two revenue paths: a `booking` (experience)
 * or an `eventOrder` (event tickets). The checkout services set exactly one;
 * `beforeValidate` enforces it.
 */
export const Payments: CollectionConfig = {
  slug: 'payments',
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'booking', 'eventOrder', 'status', 'amountMinor', 'paidAt'],
    group: 'Operations',
    description: 'Paystack attempts, verification results, and Finance review items.',
  },
  access: {
    read: hasRole('operations', 'finance'),
    create: hasRole('finance'),
    update: hasRole('finance'),
    delete: hasRole('finance'),
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        const hasBooking = Boolean(data.booking)
        const hasEventOrder = Boolean(data.eventOrder)
        if (hasBooking === hasEventOrder) {
          throw new Error('A payment must reference exactly one of a booking or an event order.')
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'reference',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'booking',
      type: 'relationship',
      relationTo: 'bookings',
      index: true,
      admin: { description: 'Set for experience bookings. Event-ticket payments use Event Order instead.' },
    },
    {
      name: 'eventOrder',
      type: 'relationship',
      relationTo: 'event-orders',
      index: true,
      admin: { description: 'Set for event ticket orders.' },
    },
    {
      name: 'gateway',
      type: 'select',
      required: true,
      defaultValue: 'paystack',
      options: [{ label: 'Paystack', value: 'paystack' }],
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'initializing',
      options: [...PAYMENT_STATUSES],
      index: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'amountMinor',
          label: 'Amount (pesewas)',
          type: 'number',
          required: true,
          min: 1,
          admin: { width: '50%', readOnly: true },
        },
        {
          name: 'currency',
          type: 'select',
          required: true,
          defaultValue: 'GHS',
          options: [{ label: 'GHS', value: 'GHS' }],
          admin: { width: '50%', readOnly: true },
        },
      ],
    },
    {
      name: 'gatewayReference',
      type: 'text',
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'gatewayTransactionId',
      label: 'Paystack transaction ID',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
        description: 'Stored as text because Paystack IDs can exceed signed 32-bit integer range.',
      },
    },
    { name: 'channel', type: 'text', admin: { readOnly: true } },
    {
      name: 'checkoutURL',
      label: 'Hosted checkout URL',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'paidAt',
      type: 'date',
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'lastVerifiedAt',
      type: 'date',
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'reviewReason',
      type: 'textarea',
      admin: { readOnly: true, condition: (_, siblingData) => siblingData?.status === 'review' },
    },
    { name: 'failureReason', type: 'textarea', admin: { readOnly: true } },
    {
      name: 'verificationSnapshot',
      type: 'json',
      admin: {
        readOnly: true,
        description: 'A deliberately limited, non-card verification record for audit purposes.',
      },
    },
  ],
}
