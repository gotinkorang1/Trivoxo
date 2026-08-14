import type { CollectionConfig } from 'payload'
import { fieldHasRole, hasRole } from '../access/roles'
import { enforceBookingInventory } from '../lib/booking-inventory'
import { queueBookingConfirmationAfterChange } from '../lib/notification-hooks'
import { notifyNewBooking } from '../lib/admin-notification-hooks'
import { bookingReference } from '../lib/reference'

/** Booking lifecycle states (§41). */
export const BOOKING_STATUSES = [
  { label: 'Draft', value: 'draft' },
  { label: 'Held', value: 'held' },
  { label: 'Pending payment', value: 'pending_payment' },
  { label: 'Paid', value: 'paid' },
  { label: 'Paid — inventory review', value: 'payment_review' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Refund pending', value: 'refund_pending' },
  { label: 'Partially refunded', value: 'partially_refunded' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Expired', value: 'expired' },
  { label: 'No show', value: 'no_show' },
]

/** Where the booking originated (§61) — drives marketing reports. */
export const BOOKING_SOURCES = [
  'website',
  'whatsapp',
  'instagram',
  'tiktok',
  'facebook',
  'phone',
  'walk-in',
  'corporate',
  'referral',
  'partner',
  'other',
].map((v) => ({ label: v.replace(/(^|-)\w/g, (m) => m.toUpperCase()).replace('-', ' '), value: v }))

/**
 * Bookings (§38–§42, §60). Staff can create manual bookings for WhatsApp /
 * phone / walk-in business so online and offline sales live in one system.
 * Active website checkouts and staff-created bookings are validated against a
 * locked departure row, so every source shares one authoritative inventory.
 */
export const Bookings: CollectionConfig = {
  slug: 'bookings',
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'experience', 'departureDate', 'status', 'totalAmount'],
    group: 'Operations',
  },
  access: {
    read: hasRole('operations', 'finance'),
    create: hasRole('operations'),
    update: hasRole('operations', 'finance'),
    delete: hasRole('operations'),
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && !data.reference) {
          data.reference = bookingReference()
        }
        return data
      },
      enforceBookingInventory,
    ],
    afterChange: [queueBookingConfirmationAfterChange, notifyNewBooking],
  },
  fields: [
    {
      name: 'reference',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Auto-generated, e.g. TVX-26-A8F41.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: BOOKING_STATUSES,
      admin: { position: 'sidebar' },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'website',
      options: BOOKING_SOURCES,
      admin: { position: 'sidebar' },
    },
    { name: 'experience', type: 'relationship', relationTo: 'experiences', required: true },
    {
      name: 'departure',
      type: 'relationship',
      relationTo: 'departures',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Required when seats are held or confirmed.',
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      admin: { position: 'sidebar' },
    },
    { name: 'departureDate', type: 'date', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'adults',
          label: 'Adults (13+)',
          type: 'number',
          defaultValue: 4,
          min: 1,
          admin: { width: '33%' },
        },
        {
          name: 'children',
          label: 'Children (6–12)',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: { width: '33%', description: '40% off the adult rate.' },
        },
        {
          name: 'youngChildren',
          label: 'Young children (0–5)',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: { width: '34%', description: 'Travel free.' },
        },
      ],
    },
    {
      name: 'inventoryState',
      type: 'select',
      defaultValue: 'none',
      index: true,
      options: [
        { label: 'No inventory', value: 'none' },
        { label: 'Seats held', value: 'held' },
        { label: 'Seats confirmed', value: 'confirmed' },
        { label: 'Seats released', value: 'released' },
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Managed automatically from the booking status.',
      },
    },
    {
      name: 'capacitySeats',
      label: 'Seats consumed',
      type: 'number',
      min: 1,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'holdExpiresAt',
      label: 'Seat hold expires',
      type: 'date',
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy, HH:mm:ss' },
      },
    },
    {
      name: 'booker',
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
            { name: 'phone', type: 'text', required: true, admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'country', type: 'text', admin: { width: '50%' } },
            { name: 'emergencyContact', type: 'text', admin: { width: '50%' } },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'pickup',
          label: 'Pickup area (Greater Accra)',
          type: 'text',
          admin: { width: '50%', description: 'Must be within the Greater Accra region.' },
        },
        {
          name: 'pickupTime',
          label: 'Preferred pickup time',
          type: 'text',
          admin: { width: '50%', placeholder: 'e.g. 07:30' },
        },
      ],
    },
    {
      name: 'travellerIdentity',
      label: 'Lead traveller identity & consent',
      type: 'group',
      admin: {
        description:
          'Ghanaians provide a Ghana Card number; foreign nationals provide country and passport. 13–17s need consent from an accompanying adult.',
      },
      fields: [
        {
          name: 'nationality',
          type: 'select',
          options: [
            { label: 'Ghanaian', value: 'ghanaian' },
            { label: 'Foreign national', value: 'foreign' },
          ],
        },
        {
          name: 'ghanaCardNumber',
          label: 'Ghana Card number',
          type: 'text',
          admin: { condition: (_, sib) => sib?.nationality === 'ghanaian' },
        },
        {
          name: 'passportNumber',
          type: 'text',
          admin: { condition: (_, sib) => sib?.nationality === 'foreign' },
        },
        {
          name: 'bookerAge',
          label: 'Lead traveller age',
          type: 'select',
          options: [
            { label: '18 or older', value: '18-plus' },
            { label: '13–17 (with adult consent)', value: '13-17' },
          ],
        },
        {
          type: 'row',
          admin: { condition: (_, sib) => sib?.bookerAge === '13-17' },
          fields: [
            { name: 'consentAdultName', label: 'Consenting adult name', type: 'text', admin: { width: '50%' } },
            { name: 'consentAdultPhone', label: 'Consenting adult phone', type: 'text', admin: { width: '50%' } },
          ],
        },
      ],
    },
    { name: 'specialRequest', type: 'textarea' },
    { name: 'dietary', type: 'text' },
    {
      name: 'guests',
      label: 'Additional travellers',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '60%' } },
        {
          name: 'category',
          type: 'select',
          options: ['Adult', 'Child', 'Infant'].map((v) => ({ label: v, value: v.toLowerCase() })),
          admin: { width: '40%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'totalAmount',
          label: 'Total (GHS)',
          type: 'number',
          min: 0,
          admin: { width: '50%' },
        },
        {
          name: 'paymentState',
          type: 'select',
          options: [
            { label: 'Paid', value: 'paid' },
            { label: 'Deposit', value: 'deposit' },
            { label: 'Outstanding', value: 'outstanding' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'couponCode',
          label: 'Coupon',
          type: 'text',
          admin: { width: '33%', readOnly: true },
        },
        {
          name: 'couponDiscount',
          label: 'Discount (GHS)',
          type: 'number',
          min: 0,
          admin: { width: '33%', readOnly: true },
        },
        {
          name: 'couponRedeemed',
          label: 'Coupon counted',
          type: 'checkbox',
          defaultValue: false,
          admin: { width: '33%', readOnly: true },
        },
      ],
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      access: { read: fieldHasRole('operations', 'finance') },
    },
  ],
}
