import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access/roles'

/** Travel services (§70–§73) — airport transfers, flights, accommodation, car
 * rentals. V1 is enquiry-based: leads land here for the team to quote. The
 * type-specific fields are captured in `details` (JSON) so one collection serves
 * all four services. */
export const TravelServiceRequests: CollectionConfig = {
  slug: 'travel-service-requests',
  labels: { singular: 'Travel Service Request', plural: 'Travel Service Requests' },
  admin: {
    useAsTitle: 'summary',
    defaultColumns: ['summary', 'serviceType', 'status', 'createdAt'],
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
      options: ['New', 'Contacted', 'Quoted', 'Confirmed', 'Closed'].map((v) => ({
        label: v,
        value: v.toLowerCase(),
      })),
      admin: { position: 'sidebar' },
    },
    {
      name: 'serviceType',
      type: 'select',
      required: true,
      options: [
        { label: 'Airport Transfer', value: 'airport-transfer' },
        { label: 'Flights', value: 'flights' },
        { label: 'Accommodation', value: 'accommodation' },
        { label: 'Car Rental', value: 'car-rental' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'summary', type: 'text', admin: { readOnly: true } },
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
    {
      name: 'details',
      type: 'json',
      admin: { description: 'The service-specific request details submitted by the customer.' },
    },
  ],
}
