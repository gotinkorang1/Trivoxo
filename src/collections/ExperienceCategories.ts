import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access/roles'
import { slugField } from '../fields/slug'

/** Experience categories (§13) — the "Find your kind of adventure" cards. */
export const ExperienceCategories: CollectionConfig = {
  slug: 'experience-categories',
  labels: { singular: 'Category', plural: 'Experience Categories' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'order'],
    group: 'Catalogue',
  },
  access: {
    read: anyone,
    create: hasRole('content-editor', 'operations'),
    update: hasRole('content-editor', 'operations'),
    delete: hasRole('operations'),
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    { name: 'blurb', type: 'text', admin: { description: 'One-line summary shown under the title.' } },
    {
      name: 'icon',
      type: 'text',
      admin: { description: 'lucide-react icon name, e.g. "Mountain".' },
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
