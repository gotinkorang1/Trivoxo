/**
 * Curated destination hubs (§15, §74). The public site now reads live from
 * Payload (src/lib/payload/destinations.ts); this module remains the seed's
 * source of truth and defines the `Destination` shape the live layer maps into.
 */
import { EXPERIENCES } from './experiences'
import type { PublicImage } from '@/lib/media'

export type Destination = {
  slug: string
  title: string
  region: string
  blurb: string
  gradient: string
  image?: PublicImage
  featured?: boolean
  experienceSlugs: string[]
}

export const DESTINATIONS: Destination[] = [
  {
    slug: 'accra',
    title: 'Accra',
    region: 'Greater Accra',
    blurb: 'The capital’s pulse — markets, monuments, food and nightlife.',
    gradient: 'linear-gradient(135deg,#7a2e12,#e85d2a)',
    featured: true,
    experienceSlugs: ['capital-pulse-tour', 'accra-by-night'],
  },
  {
    slug: 'cape-coast',
    title: 'Cape Coast',
    region: 'Central Region',
    blurb: 'Castles, dungeons and the famous rainforest canopy walk.',
    gradient: 'linear-gradient(135deg,#0e2a4d,#2f7fb8)',
    featured: true,
    experienceSlugs: ['heritage-canopy-quest', 'remembrance-trail'],
  },
  {
    slug: 'volta',
    title: 'Volta',
    region: 'Volta Region',
    blurb: 'Highland trails, waterfalls and Ghana’s tallest peaks.',
    gradient: 'linear-gradient(135deg,#0f3d2e,#1e9e7a)',
    featured: true,
    experienceSlugs: ['mountain-mist-canopy-cascade', 'peak-cascade-explorer'],
  },
  {
    slug: 'akosombo',
    title: 'Akosombo',
    region: 'Eastern Region',
    blurb: 'Riverfront calm and cruises across Volta Lake to Dodi Island.',
    gradient: 'linear-gradient(135deg,#133a4d,#2a9fb8)',
    featured: true,
    experienceSlugs: ['volta-wave-rider-dodi-island', 'luxury-riverfront-escape'],
  },
  {
    slug: 'eastern-region',
    title: 'Eastern Region',
    region: 'Eastern Region',
    blurb: 'Caves, falls, gardens and craft heritage across the hills.',
    gradient: 'linear-gradient(135deg,#3d4a12,#8bae2a)',
    featured: true,
    experienceSlugs: [
      'caves-cascades',
      'eco-luxury-wilderness',
      'legacy-clay-trail',
      'garden-gold-trail',
    ],
  },
  {
    slug: 'shai-hills',
    title: 'Shai Hills',
    region: 'Greater Accra',
    blurb: 'Open savannah wildlife and easy river cruising near Accra.',
    gradient: 'linear-gradient(135deg,#4d3a12,#f5b133)',
    featured: true,
    experienceSlugs: ['wild-plains-river-cruise'],
  },
]

/** Slug → curated destination slug, for the seed to link experiences. */
export const EXPERIENCE_TO_DESTINATION: Record<string, string> = Object.fromEntries(
  DESTINATIONS.flatMap((d) => d.experienceSlugs.map((s) => [s, d.slug])),
)

// Compile-time sanity: every catalogue experience maps to a destination.
export const UNMAPPED_EXPERIENCES = EXPERIENCES.filter(
  (e) => !(e.slug in EXPERIENCE_TO_DESTINATION),
)
