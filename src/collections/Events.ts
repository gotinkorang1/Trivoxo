import type { CollectionConfig } from 'payload'
import { indexNowOnPublish } from '../lib/indexnow'
import { anyone, hasRole } from '../access/roles'
import { slugField } from '../fields/slug'
import { seoField } from '../fields/seo'

/**
 * Public events (§62–§64). Ticket types are embedded as an array for MVP
 * simplicity; QR ticket issuance + check-in (§65, §66) attach to orders in a
 * later Phase-1 slice.
 */
export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startsAt', 'venue', '_status'],
    group: 'Events',
    preview: (doc) => (doc?.slug ? `/events/${doc.slug}` : null),
  },
  access: {
    read: anyone,
    create: hasRole('event-manager', 'operations'),
    update: hasRole('event-manager', 'operations'),
    delete: hasRole('event-manager', 'operations'),
  },
  versions: { drafts: { schedulePublish: true } },
  hooks: {
    afterChange: [indexNowOnPublish((slug) => `/events/${slug}`)],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Details',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'shortDescription', type: 'textarea', maxLength: 240 },
            { name: 'description', type: 'richText' },
            { name: 'coverImage', type: 'upload', relationTo: 'media' },
            {
              type: 'row',
              fields: [
                { name: 'startsAt', type: 'date', required: true, admin: { width: '50%', date: { pickerAppearance: 'dayAndTime' } } },
                { name: 'endsAt', type: 'date', admin: { width: '50%', date: { pickerAppearance: 'dayAndTime' } } },
              ],
            },
            { name: 'venue', type: 'text' },
            { name: 'location', type: 'text', admin: { description: 'City/area shown to customers, e.g. "Aburi".' } },
            { name: 'destination', type: 'relationship', relationTo: 'destinations' },
            { name: 'about', type: 'textarea' },
            {
              name: 'highlights',
              label: 'What to expect',
              type: 'array',
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            {
              name: 'included',
              label: "What's included",
              type: 'array',
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            { name: 'whatToExpect', type: 'richText', admin: { description: 'Optional long-form alternative to the bullet list above.' } },
          ],
        },
        {
          label: 'Tickets',
          fields: [
            {
              name: 'ticketTypes',
              type: 'array',
              labels: { singular: 'Ticket type', plural: 'Ticket types' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', required: true, admin: { width: '50%', placeholder: 'e.g. Early Bird, VIP' } },
                    { name: 'price', label: 'Price (GHS)', type: 'number', required: true, min: 0, admin: { width: '25%' } },
                    { name: 'quantity', type: 'number', min: 0, admin: { width: '25%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'saleStart', type: 'date', admin: { width: '33%' } },
                    { name: 'saleEnd', type: 'date', admin: { width: '33%' } },
                    { name: 'perOrderLimit', type: 'number', min: 1, admin: { width: '34%' } },
                  ],
                },
                { name: 'soldOut', type: 'checkbox', defaultValue: false },
              ],
            },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
    slugField('title'),
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Show in the homepage "Upcoming events" section.' },
    },
  ],
}
