import type { CollectionConfig } from 'payload'
import { hasRole } from '../access/roles'

/**
 * Customers (§44). Distinct from staff Users. Accountless booking is the
 * default (§39); full customer auth (Supabase Auth, magic-link/OTP) is a
 * later addition. This stores the person behind bookings.
 */
export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['firstName', 'lastName', 'email', 'country'],
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
      type: 'row',
      fields: [
        { name: 'firstName', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'lastName', type: 'text', required: true, admin: { width: '50%' } },
      ],
    },
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'phone', type: 'text' },
    { name: 'country', type: 'text' },
    { name: 'marketingOptIn', type: 'checkbox', defaultValue: false },
  ],
}
