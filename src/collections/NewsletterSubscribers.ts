import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access/roles'

/** Newsletter subscribers (§23). */
export const NewsletterSubscribers: CollectionConfig = {
  slug: 'newsletter-subscribers',
  labels: { singular: 'Subscriber', plural: 'Newsletter Subscribers' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'source', 'active', 'createdAt'],
    group: 'Content',
  },
  access: {
    create: anyone,
    read: hasRole('operations', 'content-editor'),
    update: hasRole('operations', 'content-editor'),
    delete: hasRole('operations'),
  },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true, index: true },
    { name: 'source', type: 'text', admin: { description: 'Where they subscribed, e.g. homepage-footer.' } },
    { name: 'active', type: 'checkbox', defaultValue: true },
  ],
}
