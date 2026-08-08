/**
 * Ghana Guide articles (§21, §75). Source of truth shared by the guide pages
 * and the seed. Category values match the Posts collection enum
 * (GUIDE_CATEGORIES). Real articles are authored in the admin; these give the
 * section content to render.
 */

export type GuideBlock = { heading?: string; text: string }

export type GuideArticle = {
  slug: string
  title: string
  /** Enum value matching the Posts collection (e.g. 'travel-planning'). */
  category: string
  categoryLabel: string
  excerpt: string
  readMins: number
  publishedAt: string
  gradient: string
  featured?: boolean
  body: GuideBlock[]
}

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    slug: 'first-timers-guide-accra',
    title: 'A First-Timer’s Guide to Accra',
    category: 'travel-planning',
    categoryLabel: 'Travel Planning',
    excerpt: 'Where to start in Ghana’s capital — the neighbourhoods, the pace and the must-sees.',
    readMins: 6,
    publishedAt: '2026-07-02T09:00:00.000Z',
    gradient: 'linear-gradient(135deg,#7a2e12,#e85d2a)',
    featured: true,
    body: [
      { text: 'Accra rewards the curious. It is a city of markets and monuments, ocean breeze and late-night highlife — and it moves at its own rhythm. Here is how to find your feet on a first visit.' },
      { heading: 'Get your bearings', text: 'Start with the Capital Pulse route: Makola Market, Jamestown, Black Star Square and the Kwame Nkrumah Memorial. In a single day you will trace the story of the city and the nation.' },
      { heading: 'Eat well', text: 'Try jollof and grilled tilapia with banku, then chase it with a fresh coconut from a roadside seller. Osu and Labone are good for a relaxed dinner.' },
      { heading: 'Getting around', text: 'Traffic is real — plan mornings for anything across town. A guided tour takes the stress out of navigating and parking, and you will learn far more along the way.' },
    ],
  },
  {
    slug: 'what-to-pack-ghana',
    title: 'What to Pack for a Ghana Adventure',
    category: 'travel-planning',
    categoryLabel: 'Travel Planning',
    excerpt: 'From canopy walks to city nights — a simple, no-overpacking checklist.',
    readMins: 4,
    publishedAt: '2026-07-15T09:00:00.000Z',
    gradient: 'linear-gradient(135deg,#0f3d2e,#1e9e7a)',
    featured: true,
    body: [
      { text: 'Ghana is warm year-round, so pack light — but a few smart choices make outdoor days far more comfortable.' },
      { heading: 'The essentials', text: 'Breathable clothing, a light rain layer, sunscreen, insect repellent and a refillable water bottle. Comfortable, grippy shoes are non-negotiable for hikes and the Kakum canopy walk.' },
      { heading: 'For the trails', text: 'A small daypack, a hat, and quick-dry socks. If you are hiking Afadjato or chasing waterfalls, expect to get a little wet and dusty.' },
      { heading: 'For the city', text: 'One smart-casual outfit covers dinners and nightlife. Bring a power bank — you will be taking a lot of photos.' },
    ],
  },
  {
    slug: 'best-times-cape-coast',
    title: 'The Best Times to Visit Cape Coast',
    category: 'cape-coast',
    categoryLabel: 'Cape Coast',
    excerpt: 'Weather, crowds and the quiet moments — how to time a heritage trip.',
    readMins: 5,
    publishedAt: '2026-07-28T09:00:00.000Z',
    gradient: 'linear-gradient(135deg,#0e2a4d,#2f7fb8)',
    featured: true,
    body: [
      { text: 'Cape Coast is moving and unmissable — the castles, the canopy walk at Kakum, and the coastline in between. When you go shapes the experience.' },
      { heading: 'Dry season (Nov–Mar)', text: 'The most comfortable window: clear skies, easier roads and the best conditions for the canopy walk. It is also the busiest, so start early.' },
      { heading: 'Green season (Apr–Oct)', text: 'Fewer visitors and a lush rainforest, with the occasional heavy shower. Mornings are usually clear — a good time for a quieter, reflective castle visit.' },
      { heading: 'Give it time', text: 'Cape Coast deserves more than a rushed day. The heritage sites carry real weight; leave room to take them in.' },
    ],
  },
  {
    slug: 'accra-after-dark',
    title: 'Accra After Dark: A Night Out Guide',
    category: 'nightlife',
    categoryLabel: 'Nightlife',
    excerpt: 'Live bands, rooftops and street food — how the capital glows at night.',
    readMins: 4,
    publishedAt: '2026-08-05T09:00:00.000Z',
    gradient: 'linear-gradient(135deg,#1a1440,#6d4bd8)',
    featured: false,
    body: [
      { text: 'When the heat lifts, Accra comes alive. The capital’s nightlife is warm, musical and endlessly social.' },
      { heading: 'Start with live music', text: 'Highlife and Afrobeats spill out of bars across Osu and East Legon. A live band on the right night is the best introduction to the city’s sound.' },
      { heading: 'Eat late', text: 'Street-food stalls fire up after dark — grilled meats, kelewele and more. It is half the fun.' },
      { heading: 'Do it with a guide', text: 'The Accra By Night experience takes the guesswork out — the right spots, safe transport, and a local’s read on where the energy is.' },
    ],
  },
]

export function getArticleBySlug(slug: string): GuideArticle | undefined {
  return GUIDE_ARTICLES.find((a) => a.slug === slug)
}

export function getRecentArticles(limit = 3): GuideArticle[] {
  return [...GUIDE_ARTICLES]
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, limit)
}

/** Distinct categories present, for the listing filter. */
export function guideCategories(): { value: string; label: string }[] {
  const seen = new Map<string, string>()
  for (const a of GUIDE_ARTICLES) if (!seen.has(a.category)) seen.set(a.category, a.categoryLabel)
  return [...seen].map(([value, label]) => ({ value, label }))
}
