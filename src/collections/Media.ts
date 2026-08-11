import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access/roles'

const cloudinaryEnabled = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET,
)

/**
 * Media library (§59). Photography is Trivoxo's biggest visual asset, so we
 * pre-define responsive sizes and keep alt text required for accessibility.
 * In production, delivery is intended to run through Cloudinary (§8) — this
 * local adapter is the development default.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
  access: {
    read: anyone,
    create: hasRole('content-editor', 'operations', 'event-manager'),
    update: hasRole('content-editor', 'operations', 'event-manager'),
    delete: hasRole('content-editor', 'operations'),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Describe the image for screen readers and SEO.' },
    },
    {
      name: 'credit',
      type: 'text',
      admin: { description: 'Optional photographer / source credit.' },
    },
    {
      name: 'category',
      type: 'select',
      admin: { description: 'Loose grouping for the media library (Accra, Volta, Hiking, …).' },
      options: [
        'Accra',
        'Cape Coast',
        'Volta',
        'Eastern Region',
        'Hiking',
        'Cycling',
        'Corporate',
        'Events',
        'Food',
        'People',
        'Other',
      ].map((v) => ({ label: v, value: v.toLowerCase().replace(/[^a-z0-9]+/g, '-') })),
    },
  ],
  upload: {
    disableLocalStorage: cloudinaryEnabled,
    focalPoint: true,
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 576, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
}
