import type { GlobalConfig } from 'payload'
import { anyone, hasRole } from '../access/roles'

/**
 * Site-wide settings editable without code (§52) — contact details, socials and
 * the canonical slogan. Several of these are flagged "needs confirmation" in the
 * plan (§98); this global is where Trivoxo finalises them.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: { group: 'System' },
  access: {
    read: anyone,
    update: hasRole('operations', 'content-editor'),
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Brand',
          fields: [
            { name: 'tagline', type: 'text', defaultValue: 'Experience. Explore. Express.' },
            { name: 'headline', type: 'text', defaultValue: 'Experience Ghana the Trivoxo Way' },
            { name: 'description', type: 'textarea' },
          ],
        },
        {
          label: 'Contact',
          fields: [
            { name: 'primaryPhone', type: 'text' },
            { name: 'altPhone', type: 'text' },
            { name: 'whatsapp', type: 'text', admin: { description: 'Digits only, for wa.me links.' } },
            { name: 'email', type: 'email' },
            { name: 'address', type: 'textarea' },
          ],
        },
        {
          label: 'Social',
          fields: [
            { name: 'instagram', type: 'text' },
            { name: 'tiktok', type: 'text' },
            { name: 'linkedin', type: 'text' },
            { name: 'facebook', type: 'text' },
          ],
        },
      ],
    },
  ],
}
