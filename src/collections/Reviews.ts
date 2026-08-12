import type { CollectionConfig } from 'payload'
import { hasRole } from '../access/roles'
import { notifyNewReview } from '../lib/admin-notification-hooks'

/**
 * Reviews (§77). Only approved reviews are public. Verified reviews originate
 * from completed bookings; manual/admin reviews can be added too.
 */
export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'experience', 'rating', 'status', 'verified'],
    group: 'Catalogue',
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      // Public visitors only see approved reviews.
      return { status: { equals: 'approved' } }
    },
    create: hasRole('operations', 'content-editor'),
    update: hasRole('operations', 'content-editor'),
    delete: hasRole('operations'),
  },
  hooks: {
    afterChange: [notifyNewReview],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'body', type: 'textarea', required: true },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      admin: { position: 'sidebar' },
    },
    { name: 'authorName', type: 'text', required: true },
    {
      name: 'travellerType',
      type: 'select',
      options: ['Solo', 'Couples', 'Friends', 'Family', 'Corporate'].map((v) => ({
        label: v,
        value: v.toLowerCase(),
      })),
    },
    { name: 'experience', type: 'relationship', relationTo: 'experiences' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Linked to a completed booking.' },
    },
    { name: 'bookingReference', type: 'text', admin: { position: 'sidebar' } },
  ],
}
