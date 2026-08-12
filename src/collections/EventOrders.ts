import type { CollectionConfig } from 'payload'
import { hasRole } from '../access/roles'
import { notifyNewEventOrder } from '../lib/admin-notification-hooks'
import { BOOKING_SOURCES } from './Bookings'

/** Event ticket order lifecycle. Mirrors the booking states so the two revenue
 * paths behave the same. */
export const EVENT_ORDER_STATUSES = [
  { label: 'Held', value: 'held' },
  { label: 'Pending payment', value: 'pending_payment' },
  { label: 'Paid', value: 'paid' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Payment review', value: 'payment_review' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Expired', value: 'expired' },
] as const

/**
 * Event ticket orders (§64–§65). A customer buys one or more ticket types for an
 * event; on paid, individual EventTickets (each with a signed QR) are issued.
 * Ticket stock is protected transactionally in src/lib/event-inventory.ts — the
 * public checkout goes through that service, never a raw create.
 */
export const EventOrders: CollectionConfig = {
  slug: 'event-orders',
  labels: { singular: 'Event Order', plural: 'Event Orders' },
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'event', 'quantityTotal', 'status', 'totalAmount'],
    group: 'Events',
  },
  access: {
    read: hasRole('operations', 'finance', 'event-manager'),
    create: hasRole('operations', 'event-manager'),
    update: hasRole('operations', 'event-manager', 'finance'),
    delete: hasRole('operations'),
  },
  hooks: {
    afterChange: [notifyNewEventOrder],
  },
  fields: [
    {
      name: 'reference',
      type: 'text',
      unique: true,
      index: true,
      admin: { readOnly: true, position: 'sidebar', description: 'Auto-generated, e.g. TVXO-26-A8F41.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'held',
      options: [...EVENT_ORDER_STATUSES],
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'inventoryState',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Held', value: 'held' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Released', value: 'released' },
      ],
      index: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'holdExpiresAt',
      type: 'date',
      index: true,
      admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'website',
      options: BOOKING_SOURCES,
      admin: { position: 'sidebar' },
    },
    { name: 'event', type: 'relationship', relationTo: 'events', required: true, index: true },
    {
      name: 'buyer',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'firstName', type: 'text', required: true, admin: { width: '50%' } },
            { name: 'lastName', type: 'text', required: true, admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'email', type: 'email', required: true, admin: { width: '50%' } },
            { name: 'phone', type: 'text', admin: { width: '50%' } },
          ],
        },
      ],
    },
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'Line item', plural: 'Line items' },
      admin: { description: 'Ticket types and quantities at the price captured when the order was placed.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'ticketTypeName', type: 'text', required: true, admin: { width: '50%' } },
            { name: 'unitPrice', label: 'Unit price (GHS)', type: 'number', required: true, min: 0, admin: { width: '25%' } },
            { name: 'quantity', type: 'number', required: true, min: 1, admin: { width: '25%' } },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'quantityTotal', type: 'number', min: 0, admin: { width: '50%', readOnly: true } },
        { name: 'totalAmount', label: 'Total (GHS)', type: 'number', min: 0, admin: { width: '50%', readOnly: true } },
      ],
    },
    {
      name: 'paymentState',
      type: 'select',
      defaultValue: 'outstanding',
      options: [
        { label: 'Paid', value: 'paid' },
        { label: 'Outstanding', value: 'outstanding' },
        { label: 'Refunded', value: 'refunded' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'internalNotes', type: 'textarea' },
  ],
}
