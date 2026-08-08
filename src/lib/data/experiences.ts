/**
 * Trivoxo experience catalogue — the 13 packages from the brochure (§24).
 *
 * This module is the single source of truth used both by the marketing
 * frontend (until it reads from Payload) and by the seed script
 * (src/seed/index.ts) that loads Payload once a database is connected.
 *
 * IMPORTANT — data provenance:
 *  - `name` and `priceFrom` are taken directly from the brochure and are
 *    authoritative.
 *  - Capital Pulse's itinerary / inclusions / exclusions reflect the CONFIRMED
 *    correction in the redesign plan (§25): entry fees included, lunch EXCLUDED.
 *  - `region`, `categorySlug`, `duration`, `difficulty`, `rating` and `reviews`
 *    marked `provisional: true` are inferred placeholders for the scaffold.
 *    The plan lists durations, capacities, group-discount tiers and resident
 *    pricing as still-missing business inputs — see docs/OPEN_DECISIONS.md.
 *    Do not treat provisional values as final.
 */

export type Difficulty = 'Easy' | 'Moderate' | 'Challenging'

export type ItineraryStop = {
  time?: string
  title: string
  description?: string
}

export type Experience = {
  slug: string
  name: string
  /** Whole Ghanaian Cedi. Starting ("from") price per person. */
  priceFrom: number
  destination: string
  region: string
  categorySlug: string
  categoryLabel: string
  duration: string
  difficulty?: Difficulty
  rating?: number
  reviews?: number
  badge?: 'Bestseller' | 'New' | 'Popular' | 'Limited'
  blurb: string
  highlights?: string[]
  included?: string[]
  excluded?: string[]
  itinerary?: ItineraryStop[]
  /** True where region/category/duration/difficulty/rating are inferred, not confirmed. */
  provisional?: boolean
  featured?: boolean
}

export const EXPERIENCES: Experience[] = [
  {
    slug: 'capital-pulse-tour',
    name: 'The Capital Pulse Tour',
    priceFrom: 1400,
    destination: 'Accra',
    region: 'Greater Accra',
    categorySlug: 'tours-culture',
    categoryLabel: 'Culture & History',
    duration: 'Full Day',
    difficulty: 'Easy',
    rating: 4.8,
    reviews: 96,
    badge: 'Popular',
    featured: true,
    blurb:
      'Feel the heartbeat of Accra — markets, memory and the making of a nation, from Makola to the Nkrumah Mausoleum.',
    highlights: [
      'Makola Market',
      'Historic Jamestown',
      'Black Star / Independence Square',
      'Kwame Nkrumah Memorial Park & Mausoleum',
      'National Museum of Ghana',
      'Arts Centre / Centre for National Culture',
    ],
    // §25 — confirmed correction
    included: [
      'Attraction entry fees',
      'Air-conditioned transportation',
      'Tour coordination / guide',
      'Applicable pickup & drop-off arrangement',
    ],
    excluded: [
      'Lunch and meals',
      'Personal shopping',
      'Optional activities',
      'Personal expenses',
      'Anything not stated as included',
    ],
    itinerary: [
      { title: 'Makola Market', description: 'The trading pulse of the capital.' },
      { title: 'Historic Jamestown', description: 'Colonial-era harbour district and lighthouse.' },
      { title: 'Black Star / Independence Square', description: "Ghana's ceremonial heart." },
      { title: 'Kwame Nkrumah Memorial Park & Mausoleum', description: 'Resting place of the founding leader.' },
      { title: 'National Museum of Ghana', description: 'Art, archaeology and ethnography.' },
      { title: 'Arts Centre / Centre for National Culture', description: 'Craft, colour and local makers.' },
    ],
  },
  {
    slug: 'heritage-canopy-quest',
    name: 'Heritage & Canopy Quest',
    priceFrom: 1700,
    destination: 'Cape Coast',
    region: 'Central Region',
    categorySlug: 'tours-culture',
    categoryLabel: 'Heritage & Nature',
    duration: 'Full Day',
    difficulty: 'Moderate',
    rating: 4.9,
    reviews: 74,
    badge: 'Bestseller',
    featured: true,
    provisional: true,
    blurb: 'Castle history and the famous rainforest canopy walkway in a single unforgettable day.',
  },
  {
    slug: 'remembrance-trail',
    name: 'Remembrance Trail',
    priceFrom: 1900,
    destination: 'Cape Coast & Elmina',
    region: 'Central Region',
    categorySlug: 'tours-culture',
    categoryLabel: 'Heritage',
    duration: 'Full Day',
    difficulty: 'Easy',
    rating: 4.9,
    reviews: 61,
    provisional: true,
    blurb: 'A moving journey through the castles and dungeons of the transatlantic story.',
  },
  {
    slug: 'wild-plains-river-cruise',
    name: 'Wild Plains & River Cruise',
    priceFrom: 1750,
    destination: 'Shai Hills',
    region: 'Greater Accra',
    categorySlug: 'nature-wildlife',
    categoryLabel: 'Nature & Cruise',
    duration: 'Full Day',
    difficulty: 'Easy',
    rating: 4.7,
    reviews: 43,
    provisional: true,
    blurb: 'Open savannah wildlife by morning, an easy river cruise by afternoon.',
  },
  {
    slug: 'volta-wave-rider-dodi-island',
    name: 'Volta Wave Rider — Dodi Island Experience',
    priceFrom: 2600,
    destination: 'Akosombo / Volta Lake',
    region: 'Eastern Region',
    categorySlug: 'water-cruises',
    categoryLabel: 'Water & Cruises',
    duration: 'Full Day',
    difficulty: 'Easy',
    rating: 4.8,
    reviews: 52,
    badge: 'Limited',
    featured: true,
    provisional: true,
    // §36 — weekends & public holidays only
    blurb: 'A festive cruise across Volta Lake to Dodi Island. Runs weekends and public holidays only.',
  },
  {
    slug: 'mountain-mist-canopy-cascade',
    name: 'Mountain Mist & Canopy Cascade',
    priceFrom: 1800,
    destination: 'Volta Region',
    region: 'Volta Region',
    categorySlug: 'hiking-adventure',
    categoryLabel: 'Hiking & Adventure',
    duration: 'Full Day',
    difficulty: 'Challenging',
    rating: 4.8,
    reviews: 38,
    provisional: true,
    blurb: 'Misty highland trails and cascading falls for hikers who want the real thing.',
  },
  {
    slug: 'peak-cascade-explorer',
    name: 'Peak & Cascade Explorer',
    priceFrom: 1900,
    destination: 'Volta Region',
    region: 'Volta Region',
    categorySlug: 'hiking-adventure',
    categoryLabel: 'Hiking & Adventure',
    duration: 'Full Day',
    difficulty: 'Challenging',
    rating: 4.9,
    reviews: 57,
    badge: 'Bestseller',
    featured: true,
    provisional: true,
    blurb: "Summit Ghana's highest peaks and chase waterfalls on this flagship adventure day.",
  },
  {
    slug: 'caves-cascades',
    name: 'Caves & Cascades',
    priceFrom: 1700,
    destination: 'Eastern Region',
    region: 'Eastern Region',
    categorySlug: 'hiking-adventure',
    categoryLabel: 'Nature & Adventure',
    duration: 'Full Day',
    difficulty: 'Moderate',
    rating: 4.7,
    reviews: 34,
    provisional: true,
    blurb: 'Rock caves, umbrella stones and twin falls across the Eastern hills.',
  },
  {
    slug: 'luxury-riverfront-escape',
    name: 'Luxury Riverfront Escape',
    priceFrom: 1500,
    destination: 'Akosombo',
    region: 'Eastern Region',
    categorySlug: 'premium-day-outs',
    categoryLabel: 'Premium Day-Out',
    duration: 'Full Day',
    difficulty: 'Easy',
    rating: 4.9,
    reviews: 48,
    badge: 'Popular',
    provisional: true,
    blurb: 'A slow, indulgent day by the river — resort comfort, water and calm.',
  },
  {
    slug: 'eco-luxury-wilderness',
    name: 'Eco-Luxury Wilderness Experience',
    priceFrom: 1200,
    destination: 'Eastern Region',
    region: 'Eastern Region',
    categorySlug: 'premium-day-outs',
    categoryLabel: 'Eco-Luxury',
    duration: 'Full Day',
    difficulty: 'Easy',
    rating: 4.8,
    reviews: 29,
    provisional: true,
    blurb: 'Nature-first luxury: wilderness surrounds, gentle pace, genuine escape.',
  },
  {
    slug: 'legacy-clay-trail',
    name: 'Legacy & Clay Trail',
    priceFrom: 1600,
    destination: 'Eastern Region',
    region: 'Eastern Region',
    categorySlug: 'tours-culture',
    categoryLabel: 'Culture & Craft',
    duration: 'Full Day',
    difficulty: 'Easy',
    rating: 4.7,
    reviews: 22,
    provisional: true,
    blurb: 'Hands-on craft heritage — clay, legacy and the makers who keep it alive.',
  },
  {
    slug: 'garden-gold-trail',
    name: 'Garden & Gold Trail',
    priceFrom: 1500,
    destination: 'Eastern Region',
    region: 'Eastern Region',
    categorySlug: 'tours-culture',
    categoryLabel: 'Gardens & Heritage',
    duration: 'Full Day',
    difficulty: 'Easy',
    rating: 4.8,
    reviews: 31,
    provisional: true,
    blurb: 'Botanical gardens and gold-country heritage on one scenic loop.',
  },
  {
    slug: 'accra-by-night',
    name: 'Accra By Night: Culture & Capital Glow',
    priceFrom: 700,
    destination: 'Accra',
    region: 'Greater Accra',
    categorySlug: 'night-experiences',
    categoryLabel: 'Night Experience',
    duration: 'Evening',
    difficulty: 'Easy',
    rating: 4.8,
    reviews: 66,
    badge: 'Popular',
    featured: true,
    provisional: true,
    blurb: 'The capital after dark — food, music and the glow of the city.',
  },
]

export function getFeaturedExperiences(limit = 6): Experience[] {
  const featured = EXPERIENCES.filter((e) => e.featured)
  return (featured.length >= limit ? featured : EXPERIENCES).slice(0, limit)
}

export function getExperienceBySlug(slug: string): Experience | undefined {
  return EXPERIENCES.find((e) => e.slug === slug)
}
