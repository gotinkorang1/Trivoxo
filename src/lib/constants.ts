/**
 * Trivoxo brand + site constants.
 *
 * Several values below are flagged in the redesign plan as "needs confirmation"
 * (primary phone, canonical slogan, WhatsApp number). They are marked TODO and
 * should be finalised with Trivoxo before launch — see docs/OPEN_DECISIONS.md.
 */

export const BRAND = {
  name: 'Trivoxo',
  // Confirmed from the official site copy.
  tagline: 'Experience. Explore. Express.',
  headline: 'Experience Ghana the Trivoxo Way',
  description:
    'A Ghanaian-owned travel, tour and events company — curating immersive, safe and memorable experiences across Ghana for expatriates, corporates and leisure travellers.',
  domain: 'trivoxogh.com',
} as const

export const CONTACT = {
  // Confirmed canonical number from the official site.
  primaryPhone: '0593962111',
  whatsapp: '233593962111', // digits only, for wa.me links (+233 59 396 2111)
  email: 'info@trivoxoghana.com',
  address: 'Plantsville Residence, Poultry Farm Ave, Accra, Ghana',
} as const

export const SOCIALS = {
  instagram: 'https://instagram.com/trivoxo_gh',
  tiktok: 'https://tiktok.com/@trivoxo_gh',
  linkedin: 'https://linkedin.com/company/trivoxo',
} as const

/** Build a pre-filled WhatsApp deep link (§51 — contextual conversations). */
export function whatsappLink(message: string): string {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`
}

/** Primary header navigation (§11). */
export const PRIMARY_NAV: { label: string; href: string }[] = [
  { label: 'Experiences', href: '/experiences' },
  { label: 'Destinations', href: '/destinations' },
  { label: 'Events', href: '/events' },
  { label: 'Corporate & Groups', href: '/corporate' },
  { label: 'Custom Trips', href: '/custom-trips' },
  { label: 'Ghana Guide', href: '/guide' },
  { label: 'About', href: '/about' },
]

/** Experience categories (§13 / §9). `slug` matches the ExperienceCategories collection. */
export const EXPERIENCE_CATEGORIES: {
  slug: string
  title: string
  blurb: string
  icon: string // lucide-react icon name
}[] = [
  { slug: 'hiking-adventure', title: 'Hiking & Adventure', blurb: 'Peaks, trails and canopy walks', icon: 'Mountain' },
  { slug: 'tours-culture', title: 'Tours & Culture', blurb: 'City, heritage and history', icon: 'Landmark' },
  { slug: 'cycling', title: 'Cycling', blurb: 'Recreational and adventure rides', icon: 'Bike' },
  { slug: 'nature-wildlife', title: 'Nature & Wildlife', blurb: 'Reserves, plains and parks', icon: 'Trees' },
  { slug: 'water-cruises', title: 'Water & Cruises', blurb: 'Lakes, rivers and island runs', icon: 'Ship' },
  { slug: 'premium-day-outs', title: 'Premium Day-Outs', blurb: 'Resorts and luxury escapes', icon: 'Sparkles' },
  { slug: 'night-experiences', title: 'Night Experiences', blurb: 'Capital nightlife and culture', icon: 'MoonStar' },
]
