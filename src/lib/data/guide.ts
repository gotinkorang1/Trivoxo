/**
 * Ghana Guide articles (§21, §75). The public site now reads live from
 * Payload (src/lib/payload/guide.ts); this module remains the seed's source
 * of truth and defines the `GuideArticle` shape the live layer maps into.
 * Category values match the Posts collection enum (GUIDE_CATEGORIES).
 */

import type { PublicImage } from '@/lib/media'

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
  image?: PublicImage
  featured?: boolean
  body: GuideBlock[]
}

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    slug: 'how-to-plan-a-corporate-event-in-accra',
    title: 'How to Plan a Corporate Event or Conference in Accra',
    category: 'corporate-travel',
    categoryLabel: 'Corporate Travel',
    excerpt:
      'Retreat, training, conference or stakeholder meeting — how to plan a smooth corporate event in Accra.',
    readMins: 5,
    publishedAt: '2026-02-10T09:00:00.000Z',
    gradient: 'linear-gradient(135deg,#0e1c2b,#13273a)',
    featured: true,
    body: [
      {
        text: 'Planning a corporate event in Accra can be very smooth — if you handle the key details early. Whether it’s a retreat, training, conference or stakeholder meeting, the goal is simple: a great guest experience and zero stress.',
      },
      {
        heading: '1) Start with your purpose',
        text: 'Be clear on the goal of the event (training, celebration, strategy, launch), the expected number of attendees, and your budget range and style (formal vs relaxed).',
      },
      {
        heading: '2) Choose the right date and time',
        text: 'Accra traffic is real — timing affects attendance and mood. Consider morning start times for conferences, avoiding peak traffic windows, and weekday vs weekend depending on your audience.',
      },
      {
        heading: '3) Lock down a suitable venue',
        text: 'A good venue matches your program: seating style (theatre, classroom, round table), sound system and microphones, power backup, and parking and accessibility.',
      },
      {
        heading: '4) Plan the guest experience',
        text: 'Great events feel easy — think registration flow, clear signage, seating plan, refreshments timing and a strong guest/MC schedule.',
      },
      {
        heading: '5) Coordinate logistics like a pro',
        text: 'This is where most events win or fail: vendor coordination, program timing and transitions, a run-of-show document, and a point person for troubleshooting. A well-managed program isn’t loud — it’s smooth, calm and on time.',
      },
      {
        heading: 'Need a hand?',
        text: 'If you want a professional team to coordinate your corporate event or conference in Accra, Trivoxo can support planning and execution from start to finish.',
      },
    ],
  },
  {
    slug: 'first-timers-guide-accra',
    title: 'A First-Timer’s Guide to Accra',
    category: 'travel-planning',
    categoryLabel: 'Travel Planning',
    excerpt: 'Where to start in Ghana’s capital — the neighbourhoods, the pace and the must-sees.',
    readMins: 6,
    publishedAt: '2026-01-20T09:00:00.000Z',
    gradient: 'linear-gradient(135deg,#7a2e12,#e85d2a)',
    featured: true,
    body: [
      {
        text: 'Accra rewards the curious. It is a city of markets and monuments, ocean breeze and late-night highlife — and it moves at its own rhythm. Here is how to find your feet on a first visit.',
      },
      {
        heading: 'Get your bearings',
        text: 'Start with the Capital Pulse route: Makola Market, Jamestown, Black Star Square and the Kwame Nkrumah Memorial. In a single day you will trace the story of the city and the nation.',
      },
      {
        heading: 'Eat well',
        text: 'Try jollof and grilled tilapia with banku, then chase it with a fresh coconut from a roadside seller. Osu and Labone are good for a relaxed dinner.',
      },
      {
        heading: 'Getting around',
        text: 'Traffic is real — plan mornings for anything across town. A guided tour takes the stress out of navigating and parking, and you will learn far more along the way.',
      },
    ],
  },
  {
    slug: 'what-to-pack-ghana',
    title: 'What to Pack for a Ghana Adventure',
    category: 'travel-planning',
    categoryLabel: 'Travel Planning',
    excerpt: 'From canopy walks to city nights — a simple, no-overpacking checklist.',
    readMins: 4,
    publishedAt: '2026-01-10T09:00:00.000Z',
    gradient: 'linear-gradient(135deg,#0f3d2e,#1e9e7a)',
    featured: false,
    body: [
      {
        text: 'Ghana is warm year-round, so pack light — but a few smart choices make outdoor days far more comfortable.',
      },
      {
        heading: 'The essentials',
        text: 'Breathable clothing, a light rain layer, sunscreen, insect repellent and a refillable water bottle. Comfortable, grippy shoes are non-negotiable for hikes and the Kakum canopy walk.',
      },
      {
        heading: 'For the trails',
        text: 'A small daypack, a hat, and quick-dry socks. If you are hiking Afadjato or chasing waterfalls, expect to get a little wet and dusty.',
      },
      {
        heading: 'For the city',
        text: 'One smart-casual outfit covers dinners and nightlife. Bring a power bank — you will be taking a lot of photos.',
      },
    ],
  },
  {
    slug: 'vegetable-hub-of-excellence-commissioning',
    title: 'Commissioning the Vegetable Hub of Excellence at the University of Ghana',
    category: 'events',
    categoryLabel: 'Events',
    excerpt: 'How Trivoxo planned and executed the commissioning ceremony for the MTN Foundation.',
    readMins: 3,
    publishedAt: '2025-12-03T09:00:00.000Z',
    gradient: 'linear-gradient(135deg,#4d3a12,#f5b133)',
    featured: false,
    body: [
      {
        text: 'On 3rd December 2025, Trivoxo Limited Company successfully planned and executed the commissioning ceremony for the Vegetable Hub of Excellence at the University of Ghana, on behalf of the MTN Foundation.',
      },
      {
        heading: 'A milestone event',
        text: 'The ceremony brought together key stakeholders from academia, industry and the development community to celebrate an initiative aimed at strengthening practical learning, agricultural innovation and capacity-building within the university environment.',
      },
      {
        heading: 'End-to-end delivery',
        text: 'Trivoxo provided end-to-end event management — a smooth, professional experience from arrival to closing, with seamless coordination, clear stakeholder flow and a well-structured program that reflected the significance of the project and the values of the MTN Foundation.',
      },
      {
        heading: 'Event details',
        text: 'Event: Commissioning of the Vegetable Hub of Excellence. Client: MTN Foundation. Venue: University of Ghana. Date: 3rd December 2025.',
      },
    ],
  },
]
