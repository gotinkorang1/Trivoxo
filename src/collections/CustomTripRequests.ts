import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access/roles'

/** Custom / tailor-made trip requests (§69). */
export const CustomTripRequests: CollectionConfig = {
  slug: 'custom-trip-requests',
  labels: { singular: 'Custom Trip Request', plural: 'Custom Trip Requests' },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['contact.name', 'travellers', 'visitDates', 'status'],
    group: 'Enquiries',
  },
  access: {
    create: anyone,
    read: hasRole('operations'),
    update: hasRole('operations'),
    delete: hasRole('operations'),
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: ['New', 'In review', 'Itinerary sent', 'Confirmed', 'Closed'].map((v) => ({
        label: v,
        value: v.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      })),
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        { name: 'visitDates', type: 'text', admin: { width: '33%', placeholder: 'e.g. Mid-March 2027' } },
        { name: 'travellers', type: 'number', min: 1, admin: { width: '33%' } },
        { name: 'days', type: 'number', min: 1, admin: { width: '34%' } },
      ],
    },
    {
      name: 'interests',
      type: 'select',
      hasMany: true,
      options: [
        'History',
        'Culture',
        'Food',
        'Hiking',
        'Adventure',
        'Beaches',
        'Nature',
        'Nightlife',
        'Art',
        'Wellness',
      ].map((v) => ({ label: v, value: v.toLowerCase() })),
    },
    { name: 'budget', type: 'text' },
    {
      name: 'needs',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'accommodation', type: 'checkbox', admin: { width: '25%' } },
            { name: 'transport', type: 'checkbox', admin: { width: '25%' } },
            { name: 'airportTransfer', type: 'checkbox', admin: { width: '25%' } },
            { name: 'privateGuide', type: 'checkbox', admin: { width: '25%' } },
          ],
        },
      ],
    },
    { name: 'notes', type: 'textarea' },
    {
      name: 'contact',
      type: 'group',
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          type: 'row',
          fields: [
            { name: 'email', type: 'email', required: true, admin: { width: '50%' } },
            { name: 'phone', type: 'text', admin: { width: '50%' } },
          ],
        },
      ],
    },
  ],
}
