import type { Field } from 'payload'

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

/**
 * Reusable URL slug field. Auto-fills from `source` when left blank, but stays
 * editable so staff can override. Unique + indexed for fast lookups.
 */
export function slugField(source = 'title'): Field {
  return {
    name: 'slug',
    type: 'text',
    index: true,
    unique: true,
    admin: {
      position: 'sidebar',
      description: `URL path segment. Leave blank to auto-generate from "${source}".`,
    },
    hooks: {
      beforeValidate: [
        ({ value, data }) => {
          if (typeof value === 'string' && value.length > 0) return slugify(value)
          const src = data?.[source]
          return typeof src === 'string' ? slugify(src) : value
        },
      ],
    },
  }
}
