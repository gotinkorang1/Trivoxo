import type { CollectionConfig } from 'payload'
import { ROLES, isSuperAdmin } from '../access/roles'
import { notifyAccountChange } from '../lib/account-notifications'

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
    // Only Super Admins create or remove staff accounts.
    create: isSuperAdmin,
    delete: isSuperAdmin,
    // Super Admins manage anyone; every staff member may edit their OWN profile
    // (name, avatar, alert preference). Roles stay locked to Super Admins via
    // the field-level access below, so self-editing can't escalate privileges.
    update: ({ req }) => {
      if (!req.user) return false
      const roles = (req.user as { roles?: string[] }).roles ?? []
      if (roles.includes('super-admin')) return true
      return { id: { equals: req.user.id } }
    },
    read: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterChange: [notifyAccountChange],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'avatar',
      label: 'Profile picture',
      type: 'upload',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
        description: 'Shown in the admin header and on your profile.',
      },
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
    {
      name: 'emailAlerts',
      label: 'Email me staff alerts',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description:
          'New bookings, reviews and enquiries relevant to your role. In-app alerts always show regardless.',
      },
    },
  ],
  versions: false,
}
