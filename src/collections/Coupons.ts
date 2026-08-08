import type { CollectionConfig } from 'payload'
import { hasRole } from '../access/roles'

/** Coupons (§79). Validation/redemption logic lands with checkout in Phase 1. */
export const Coupons: CollectionConfig = {
  slug: 'coupons',
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'type', 'value', 'active', 'validTo'],
    group: 'Operations',
  },
  access: {
    read: hasRole('operations', 'finance'),
    create: hasRole('operations'),
    update: hasRole('operations'),
    delete: hasRole('operations'),
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: { beforeValidate: [({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value)] },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'percentage',
          options: [
            { label: 'Percentage', value: 'percentage' },
            { label: 'Fixed amount (GHS)', value: 'fixed' },
          ],
          admin: { width: '50%' },
        },
        { name: 'value', type: 'number', required: true, min: 0, admin: { width: '50%' } },
      ],
    },
    {
      name: 'appliesTo',
      type: 'select',
      defaultValue: 'all',
      options: [
        { label: 'All experiences & events', value: 'all' },
        { label: 'Selected experiences', value: 'experiences' },
        { label: 'Selected events', value: 'events' },
      ],
    },
    {
      name: 'experiences',
      type: 'relationship',
      relationTo: 'experiences',
      hasMany: true,
      admin: { condition: (data) => data?.appliesTo === 'experiences' },
    },
    {
      name: 'events',
      type: 'relationship',
      relationTo: 'events',
      hasMany: true,
      admin: { condition: (data) => data?.appliesTo === 'events' },
    },
    { name: 'minOrder', label: 'Minimum order (GHS)', type: 'number', min: 0 },
    {
      type: 'row',
      fields: [
        { name: 'validFrom', type: 'date', admin: { width: '50%' } },
        { name: 'validTo', type: 'date', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'maxUses', type: 'number', min: 0, admin: { width: '50%' } },
        { name: 'usedCount', type: 'number', defaultValue: 0, admin: { width: '50%', readOnly: true } },
      ],
    },
    { name: 'active', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
}
