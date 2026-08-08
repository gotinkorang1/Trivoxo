/**
 * Curated destination hubs (§15, §74). Unlike the auto-derived destinations the
 * seed first produced, these are clean, browsable places. Each maps to the
 * catalogue experiences that belong to it (by slug), so the destination pages
 * and the seed share one source of truth.
 */
import { EXPERIENCES, getExperienceBySlug, type Experience } from './experiences'

export type Destination = {
  slug: string
  title: string
  region: string
  blurb: string
  gradient: string
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
    experienceSlugs: ['caves-cascades', 'eco-luxury-wilderness', 'legacy-clay-trail', 'garden-gold-trail'],
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

export function getDestinationBySlug(slug: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.slug === slug)
}

export function getFeaturedDestinations(limit = 6): Destination[] {
  return DESTINATIONS.filter((d) => d.featured).slice(0, limit)
}

/** Resolve a destination's experiences from the catalogue. */
export function getDestinationExperiences(slug: string): Experience[] {
  const dest = getDestinationBySlug(slug)
  if (!dest) return []
  return dest.experienceSlugs
    .map((s) => getExperienceBySlug(s))
    .filter((e): e is Experience => Boolean(e))
}

/** Slug → curated destination slug, for the seed to link experiences. */
export const EXPERIENCE_TO_DESTINATION: Record<string, string> = Object.fromEntries(
  DESTINATIONS.flatMap((d) => d.experienceSlugs.map((s) => [s, d.slug])),
)

// Compile-time sanity: every catalogue experience maps to a destination.
export const UNMAPPED_EXPERIENCES = EXPERIENCES.filter((e) => !(e.slug in EXPERIENCE_TO_DESTINATION))
