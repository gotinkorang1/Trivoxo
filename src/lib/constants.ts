/**
 * Trivoxo brand + site constants.
 *
 * Several values below are flagged in the redesign plan as "needs confirmation"
 * (primary phone, canonical slogan, WhatsApp number). They are marked TODO and
 * should be finalised with Trivoxo before launch — see docs/OPEN_DECISIONS.md.
 */

export const BRAND = {
  name: 'Trivoxo',
  // §7 recommended positioning (brochure) — supersedes the site's older
  // "Experience. Explore. Express." Pending final sign-off.
  tagline: 'Explore. Adventure. Connect.',
  headline: 'Experience Ghana Beyond the Ordinary',
  description:
    'Curated tours, outdoor adventures, cultural journeys, premium escapes and memorable events across Ghana.',
  domain: 'trivoxogh.com',
} as const

export const CONTACT = {
  // TODO(confirm): canonical primary phone / WhatsApp. The site lists
  // 0593962111; the brochure lists +233 531 014 111 and +233 244 833 280.
  primaryPhone: '+233531014111',
  altPhone: '+233244833280',
  whatsapp: '233531014111', // digits only, for wa.me links
  email: 'info@trivoxoghana.com',
  address: 'Plantsville Residence, Poultry Farm Ave, Accra, Ghana',
} as const

export const SOCIALS = {
  instagram: 'https://instagram.com/trivoxo',
  tiktok: 'https://tiktok.com/@trivoxo',
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
