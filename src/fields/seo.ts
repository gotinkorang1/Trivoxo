import type { Field } from 'payload'

/**
 * Shared SEO metadata group (§83). Attach to any publicly indexed collection.
 * Empty values fall back to the document's own title / description at render.
 */
export const seoField: Field = {
  name: 'meta',
  label: 'SEO',
  type: 'group',
  admin: {
    description: 'Search & social preview. Leave blank to inherit from the page content.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: { description: 'Overrides the <title>. ~60 characters.' },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Meta description / social preview. ~155 characters.' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Open Graph / social share image (1200×630).' },
    },
  ],
}
