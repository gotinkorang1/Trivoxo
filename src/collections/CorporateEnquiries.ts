import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access/roles'
import { makeEnquiryNotifier } from '../lib/admin-notification-hooks'

/** Corporate & events pipeline (§67, §68). */
export const CorporateEnquiries: CollectionConfig = {
  slug: 'corporate-enquiries',
  labels: { singular: 'Corporate Enquiry', plural: 'Corporate Enquiries' },
  admin: {
    useAsTitle: 'organisation',
    defaultColumns: ['organisation', 'eventType', 'preferredDate', 'pipelineStatus'],
    group: 'Enquiries',
  },
  access: {
    // Public submits the form; only staff can read/manage.
    create: anyone,
    read: hasRole('operations', 'event-manager', 'finance'),
    update: hasRole('operations', 'event-manager'),
    delete: hasRole('operations'),
  },
  hooks: {
    afterChange: [makeEnquiryNotifier('corporate-enquiries', 'corporate')],
  },
  fields: [
    {
      name: 'pipelineStatus',
      type: 'select',
      defaultValue: 'new',
      options: [
        'New',
        'Contacted',
        'Consultation',
        'Proposal preparation',
        'Proposal sent',
        'Negotiation',
        'Awaiting deposit',
        'Confirmed',
        'In progress',
        'Completed',
        'Lost',
      ].map((v) => ({ label: v, value: v.toLowerCase().replace(/[^a-z0-9]+/g, '-') })),
      admin: { position: 'sidebar' },
    },
    {
      name: 'eventType',
      type: 'select',
      required: true,
      options: [
        'Conference',
        'Corporate Retreat',
        'Company Outing',
        'Team Building',
        'Product Launch',
        'Private Event',
        'Other',
      ].map((v) => ({ label: v, value: v.toLowerCase().replace(/[^a-z0-9]+/g, '-') })),
    },
    { name: 'organisation', type: 'text' },
    {
      type: 'row',
      fields: [
        { name: 'expectedGuests', type: 'number', min: 1, admin: { width: '33%' } },
        { name: 'preferredDate', type: 'date', admin: { width: '33%' } },
        { name: 'durationDays', type: 'number', min: 1, admin: { width: '34%' } },
      ],
    },
    { name: 'location', type: 'text' },
    { name: 'budget', type: 'text' },
    {
      name: 'services',
      type: 'select',
      hasMany: true,
      options: [
        'Venue',
        'Catering',
        'Transport',
        'Hotel',
        'AV',
        'Photography',
        'Branding',
        'Registration',
        'Entertainment',
        'Security',
        'Logistics',
        'Event staffing',
      ].map((v) => ({ label: v, value: v.toLowerCase().replace(/[^a-z0-9]+/g, '-') })),
    },
    {
      name: 'contact',
      type: 'group',
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          type: 'row',
          fields: [
            { name: 'email', type: 'email', required: true, admin: { width: '50%' } },
            { name: 'phone', type: 'text', required: true, admin: { width: '50%' } },
          ],
        },
      ],
    },
    { name: 'message', type: 'textarea' },
  ],
}
