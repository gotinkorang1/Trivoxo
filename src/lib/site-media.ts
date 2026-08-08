/** Curated local photography. Keep mappings truthful to what each image depicts. */
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
    src: '/images/Untitled-2Artboard-1-copy-5.jpg',
    alt: 'Traveller receiving professional assistance at a hotel reception',
  },
  airportTransfer: {
    src: '/images/Untitled-2Artboard-1-copy.jpg',
    alt: 'Professional chauffeur welcoming a traveller beside a premium vehicle',
  },
  groupTravel: {
    src: '/images/Untitled-2Artboard-1.jpg',
    alt: 'Friends preparing for a comfortable group road trip',
  },
} as const

export function experienceImage(categorySlug?: string) {
  if (categorySlug === 'cycling') return SITE_MEDIA.hero
  return undefined
}

export function travelServiceImage(slug: string) {
  if (slug === 'airport-transfers') return SITE_MEDIA.airportTransfer
  if (slug === 'accommodation') return SITE_MEDIA.hotel
  if (slug === 'car-rentals') return SITE_MEDIA.groupTravel
  return undefined
}
