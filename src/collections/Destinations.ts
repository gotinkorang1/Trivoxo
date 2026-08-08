import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access/roles'
import { slugField } from '../fields/slug'
import { seoField } from '../fields/seo'

/** Ghana regions used across the platform. */
export const REGIONS = [
  'Greater Accra',
  'Central Region',
  'Volta Region',
  'Eastern Region',
  'Ashanti Region',
  'Western Region',
  'Northern Region',
  'Other',
] as const

/**
 * Destinations (§74) — each is an SEO/content hub that experiences, events and
 * guide articles relate back to.
 */
export const Destinations: CollectionConfig = {
  slug: 'destinations',
  labels: { singular: 'Destination', plural: 'Destinations' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'region', 'featured'],
    group: 'Catalogue',
  },
  access: {
    read: anyone,
    create: hasRole('content-editor', 'operations'),
    update: hasRole('content-editor', 'operations'),
    delete: hasRole('operations'),
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    {
      name: 'region',
      type: 'select',
      required: true,
      options: [...REGIONS],
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Show on the homepage "Explore Ghana" section.' },
    },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'shortDescription', type: 'textarea', maxLength: 220 },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'whyVisit', type: 'richText' },
            {
              name: 'thingsToDo',
              type: 'array',
              labels: { singular: 'Thing to do', plural: 'Things to do' },
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'textarea' },
              ],
            },
            { name: 'bestTimeToVisit', type: 'text' },
            { name: 'travelTips', type: 'richText' },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
  ],
}
