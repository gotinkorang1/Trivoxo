import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access/roles'
import { slugField } from '../fields/slug'
import { seoField } from '../fields/seo'

/** Ghana Guide article categories (§75). */
export const GUIDE_CATEGORIES = [
  'Things to Do',
  'Travel Planning',
  'Accra',
  'Cape Coast',
  'Volta',
  'Food & Culture',
  'Adventure',
  'Events',
  'Corporate Travel',
  'Nightlife',
].map((v) => ({ label: v, value: v.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))

/** Ghana Guide (§21, §75) — the blog, renamed for the customer. */
export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Guide Article', plural: 'Ghana Guide' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
    group: 'Content',
    preview: (doc) => (doc?.slug ? `/guide/${doc.slug}` : null),
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
          label: 'Article',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'excerpt', type: 'textarea', maxLength: 280 },
            { name: 'coverImage', type: 'upload', relationTo: 'media' },
            {
              name: 'body',
              label: 'Body',
              type: 'array',
              labels: { singular: 'Block', plural: 'Blocks' },
              admin: { description: 'Structured content blocks — an optional heading plus a paragraph.' },
              fields: [
                { name: 'heading', type: 'text' },
                { name: 'text', type: 'textarea', required: true },
              ],
            },
            { name: 'content', type: 'richText', admin: { description: 'Optional long-form alternative to the body blocks above.' } },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
    slugField('title'),
    { name: 'category', type: 'select', options: GUIDE_CATEGORIES, admin: { position: 'sidebar' } },
    { name: 'relatedDestination', type: 'relationship', relationTo: 'destinations', admin: { position: 'sidebar' } },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Eligible for the homepage Ghana Guide section.' },
    },
  ],
}
