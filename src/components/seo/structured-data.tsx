import { BRAND, CONTACT, SOCIALS } from '@/lib/constants'
import type { Experience } from '@/lib/data/experiences'
import type { EventItem } from '@/lib/data/events'
import type { GuideArticle } from '@/lib/data/guide'

const BASE = process.env.NEXT_PUBLIC_SERVER_URL || 'https://trivoxogh.com'

/** Renders a JSON-LD <script>. Data is trusted (built server-side from our own content). */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

export function organizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: `${BRAND.name} Limited`,
    description: BRAND.description,
    url: BASE,
    slogan: BRAND.tagline,
    telephone: CONTACT.primaryPhone,
    email: CONTACT.email,
    address: { '@type': 'PostalAddress', streetAddress: CONTACT.address, addressLocality: 'Accra', addressCountry: 'GH' },
    areaServed: 'Ghana',
    sameAs: [SOCIALS.instagram, SOCIALS.linkedin],
  }
}

export function experienceSchema(exp: Experience): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: exp.name,
    description: exp.blurb,
    touristType: exp.categoryLabel,
    offers: {
      '@type': 'Offer',
      price: exp.priceFrom,
      priceCurrency: 'GHS',
      availability: exp.badge === 'Limited' ? 'https://schema.org/LimitedAvailability' : 'https://schema.org/InStock',
      url: `${BASE}/experiences/${exp.slug}`,
    },
    ...(exp.rating != null
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: exp.rating, reviewCount: exp.reviews ?? 0 } }
      : {}),
  }
}

export function eventSchema(ev: EventItem): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: ev.title,
    description: ev.about,
    startDate: ev.startsAt,
    ...(ev.endsAt ? { endDate: ev.endsAt } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Place', name: ev.venue, address: `${ev.location}, Ghana` },
    organizer: { '@type': 'Organization', name: BRAND.name, url: BASE },
    offers: ev.ticketTypes.map((t) => ({
      '@type': 'Offer',
      name: t.name,
      price: t.price,
      priceCurrency: 'GHS',
      availability: t.soldOut ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      url: `${BASE}/events/${ev.slug}`,
    })),
  }
}

export function articleSchema(a: GuideArticle): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.excerpt,
    datePublished: a.publishedAt,
    articleSection: a.categoryLabel,
    author: { '@type': 'Organization', name: BRAND.name },
    publisher: { '@type': 'Organization', name: BRAND.name },
  }
}
