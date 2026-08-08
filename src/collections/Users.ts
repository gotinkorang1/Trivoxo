import type { CollectionConfig } from 'payload'
import { ROLES, hasRole, isSuperAdmin } from '../access/roles'

/**
 * Staff / admin users (§80). Customers are NOT stored here — see the
 * `customers` collection. Only staff authenticate into /admin.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'roles'],
    group: 'System',
  },
  auth: true,
  access: {
    // Only Super Admins manage other staff accounts.
    create: isSuperAdmin,
    delete: isSuperAdmin,
    update: hasRole(), // super-admin only (empty allowed list) — tighten per need
    read: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['content-editor'],
      options: [...ROLES],
      access: {
        // Only Super Admins may change someone's roles.
        update: ({ req }) => ((req.user as { roles?: string[] })?.roles ?? []).includes('super-admin'),
      },
      admin: {
        description: 'Determines what this staff member can access across the admin.',
      },
    },
  ],
  versions: false,
}
