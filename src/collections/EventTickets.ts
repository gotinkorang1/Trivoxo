import type { CollectionConfig } from 'payload'
import { hasRole } from '../access/roles'

/**
 * Individual event tickets (§65–§66). One per ticket purchased, issued when an
 * order is paid. The QR encodes a signed token derived from `reference` (see
 * src/lib/ticket-token.ts) — the reference alone is never enough to validate a
 * ticket. Check-in flips `status` to `checked_in` exactly once.
 */
export const EventTickets: CollectionConfig = {
  slug: 'event-tickets',
  labels: { singular: 'Event Ticket', plural: 'Event Tickets' },
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'event', 'ticketTypeName', 'status', 'checkedInAt'],
    group: 'Events',
  },
  access: {
    // Check-in staff can read tickets in the admin scanner; writes happen through
    // the server-side check-in action (overrideAccess), never the API directly.
    read: hasRole('operations', 'finance', 'event-manager', 'checkin'),
    create: hasRole('operations', 'event-manager'),
    update: hasRole('operations', 'event-manager'),
    delete: hasRole('operations'),
  },
  fields: [
    {
      name: 'reference',
      type: 'text',
      unique: true,
      index: true,
      admin: { readOnly: true, position: 'sidebar', description: 'Auto-generated, e.g. TVXE-49C82.' },
    },
    { name: 'order', type: 'relationship', relationTo: 'event-orders', required: true, index: true },
    { name: 'event', type: 'relationship', relationTo: 'events', required: true, index: true },
    { name: 'ticketTypeName', type: 'text', required: true },
    { name: 'attendeeName', type: 'text' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'valid',
      options: [
        { label: 'Valid', value: 'valid' },
        { label: 'Checked in', value: 'checked_in' },
        { label: 'Void', value: 'void' },
      ],
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'checkedInAt',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'checkedInBy', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar', readOnly: true } },
    { name: 'checkedInGate', type: 'text', admin: { position: 'sidebar', readOnly: true } },
  ],
}
