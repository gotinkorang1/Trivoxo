import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access/roles'
import { slugField } from '../fields/slug'
import { seoField } from '../fields/seo'

/**
 * Generic content pages — About, Safety, and the legal set (Booking Terms,
 * Cancellation, Privacy, Refund, Terms of Use) from §10.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status'],
    group: 'Content',
    preview: (doc) => (doc?.slug ? `/${doc.slug}` : null),
  },
  access: {
    read: anyone,
    create: hasRole('content-editor'),
    update: hasRole('content-editor'),
    delete: hasRole('content-editor', 'operations'),
  },
  versions: { drafts: { schedulePublish: true } },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'subtitle', type: 'text' },
            { name: 'content', type: 'richText' },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
    slugField('title'),
  ],
}
