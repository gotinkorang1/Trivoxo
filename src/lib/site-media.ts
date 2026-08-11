/**
 * Curated local photography (public/images + public/Management). Keep every
 * `alt` truthful to what the photo depicts. These maps are the fallback the
 * live Payload query layers use when a record has no uploaded image yet, so the
 * public site shows real Ghana photography instead of placeholder gradients.
 */
import type { PublicImage } from '@/lib/media'

export const SITE_MEDIA = {
  hero: {
    src: '/images/Clusters-Fotografy80September-15-2024-e1771862173969.webp',
    alt: 'Trivoxo cycling group enjoying an outdoor experience in Ghana',
  },
  outdoorGroup: {
    src: '/images/Clusters-Fotografy174March-30-2025.webp',
    alt: 'Trivoxo outdoor group celebrating together on a green trail',
  },
  hotel: {
    src: '/images/hotel-accommodation.jpg',
    alt: 'Comfortable hotel accommodation arranged by Trivoxo',
  },
  airportTransfer: {
    src: '/images/airport-transfer.jpg',
    alt: 'Professional airport pickup and drop-off with a premium vehicle',
  },
  groupTravel: {
    src: '/images/Untitled-2Artboard-1.jpg',
    alt: 'Friends preparing for a comfortable group road trip',
  },
} as const satisfies Record<string, PublicImage>

/** Destination hubs (§74). */
const DESTINATION_IMAGE: Record<string, PublicImage> = {
  accra: { src: '/images/black-star-gate.jpg', alt: 'Black Star Gate (Independence Arch) in Accra' },
  'cape-coast': { src: '/images/elmina-castle.jpg', alt: 'Historic Elmina Castle on Ghana’s Cape Coast' },
  volta: { src: '/images/wli-waterfalls.jpg', alt: 'Wli Waterfalls in the Volta Region' },
  akosombo: { src: '/images/akosombo.jpg', alt: 'Lakeside calm at Akosombo on the Volta Lake' },
  'eastern-region': { src: '/images/boti-falls-umbrella-rock.jpg', alt: 'Umbrella Rock at Boti Falls, Eastern Region' },
  'shai-hills': { src: '/images/shai-hills.jpg', alt: 'A baboon and its young at Shai Hills Resource Reserve' },
}

/** Experiences (§24). */
const EXPERIENCE_IMAGE: Record<string, PublicImage> = {
  'capital-pulse-tour': { src: '/images/nkrumah-memorial.jpg', alt: 'Kwame Nkrumah Memorial Park, Accra' },
  'accra-by-night': { src: '/images/accra-night.jpg', alt: 'Accra city lights at night' },
  'heritage-canopy-quest': { src: '/images/cape-coast-town.jpg', alt: 'Cape Coast fishing community by the sea' },
  'remembrance-trail': { src: '/images/elmina-castle.jpg', alt: 'Elmina Castle, a Cape Coast heritage site' },
  'volta-wave-rider-dodi-island': { src: '/images/volta-lake-boat.webp', alt: 'A cruise boat on the Volta Lake toward Dodi Island' },
  'mountain-mist-canopy-cascade': { src: '/images/avatime-volta.jpg', alt: 'Misty Avatime hills in the Volta Region' },
  'peak-cascade-explorer': { src: '/images/amedzofe-mount-gemi.jpg', alt: 'Highland view from Mount Gemi above Amedzofe, Volta' },
  'caves-cascades': { src: '/images/boti-falls-umbrella-rock.jpg', alt: 'Umbrella Rock at Boti Falls, Eastern Region' },
  'luxury-riverfront-escape': { src: '/images/akosombo-riverfront.jpg', alt: 'Riverfront escape at Akosombo' },
  'eco-luxury-wilderness': { src: '/images/aburi-hills.avif', alt: 'Forested Aburi hills, Eastern Region' },
  'legacy-clay-trail': { src: '/images/arts-centre-crafts.jpg', alt: 'Ghanaian craft artworks at a cultural centre' },
  'garden-gold-trail': { src: '/images/aburi-gardens.jpg', alt: 'Aburi Botanical Gardens, Eastern Region' },
  'wild-plains-river-cruise': { src: '/images/shai-hills.jpg', alt: 'Wildlife at Shai Hills Resource Reserve' },
}

/** Events (§62). */
const EVENT_IMAGE: Record<string, PublicImage> = {
  '3-days-volta-xcape': { src: '/images/volta-region.jpg', alt: 'Volta Region landscape' },
  'hike-and-chill': { src: '/images/group-ride-hike.jpg', alt: 'A Trivoxo group on an outdoor hike' },
}

/** Ghana Guide articles (§21). */
const GUIDE_IMAGE: Record<string, PublicImage> = {
  'vegetable-hub-of-excellence-commissioning': {
    src: '/images/vegetable-hub-commissioning.jpeg',
    alt: 'Vegetable Hub of Excellence commissioning at the University of Ghana',
  },
  'how-to-plan-a-corporate-event-in-accra': { src: '/images/corporate-event.jpg', alt: 'A corporate event in Accra' },
  'first-timers-guide-accra': { src: '/images/black-star-gate.jpg', alt: 'Black Star Gate, Accra' },
  'what-to-pack-ghana': { src: '/images/Clusters-Fotografy174March-30-2025.webp', alt: 'Travellers geared up for a Ghana outdoor adventure' },
}

/** Corporate & Groups band (§17). */
export const CORPORATE_IMAGE: PublicImage = {
  src: '/images/corporate-travel-retreat.jpg',
  alt: 'A Trivoxo corporate retreat group',
}

/** Leadership team (public/Management). `image` optional — a missing portrait
 * falls back to an initials avatar on the About page. */
export const MANAGEMENT: { name: string; role: string; image?: PublicImage }[] = [
  { name: 'Theo Ayitey-Adjin', role: 'Chief Executive Officer', image: { src: '/Management/theo.jpg', alt: 'Theo Ayitey-Adjin, Chief Executive Officer of Trivoxo' } },
  { name: 'Emmanuel Nelson', role: 'Operations Manager', image: { src: '/Management/emmanuel-nelson.avif', alt: 'Emmanuel Nelson, Operations Manager at Trivoxo' } },
  { name: 'Daniel Awotwe-Pratt', role: 'Finance Manager', image: { src: '/Management/daniel.jpg', alt: 'Daniel Awotwe-Pratt, Finance Manager at Trivoxo' } },
  { name: 'Kingdom Kededor Avisseh', role: 'Executive Assistant', image: { src: '/Management/kingdom.jpg', alt: 'Kingdom Kededor Avisseh, Executive Assistant at Trivoxo' } },
]

export function destinationImage(slug?: string): PublicImage | undefined {
  return slug ? DESTINATION_IMAGE[slug] : undefined
}

export function experienceImageFor(slug?: string): PublicImage | undefined {
  return slug ? EXPERIENCE_IMAGE[slug] : undefined
}

export function eventImageFor(slug?: string): PublicImage | undefined {
  return slug ? EVENT_IMAGE[slug] : undefined
}

export function guideImageFor(slug?: string): PublicImage | undefined {
  return slug ? GUIDE_IMAGE[slug] : undefined
}

/** Legacy helper still used by the experience card as a last resort. */
export function experienceImage(categorySlug?: string): PublicImage | undefined {
  if (categorySlug === 'cycling') return SITE_MEDIA.hero
  return undefined
}

export function travelServiceImage(slug: string): PublicImage | undefined {
  if (slug === 'airport-transfers') return SITE_MEDIA.airportTransfer
  if (slug === 'accommodation') return SITE_MEDIA.hotel
  if (slug === 'car-rentals') return { src: '/images/car-rental.jpg', alt: 'Clean, well-maintained car rentals' }
  if (slug === 'flights') return { src: '/images/ticketing.jpg', alt: 'Local and international ticketing support' }
  return undefined
}
