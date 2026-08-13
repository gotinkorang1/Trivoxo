import { BRAND, CONTACT, SOCIALS } from '@/lib/constants'
import type { Experience } from '@/lib/data/experiences'
import type { EventItem } from '@/lib/data/events'
import type { GuideArticle } from '@/lib/data/guide'

const BASE = process.env.NEXT_PUBLIC_SERVER_URL || 'https://trivoxogh.com'

/**
 * Serialise JSON-LD safely for embedding in a <script> tag. JSON.stringify does
 * not escape `<`, so CMS-authored fields (titles, descriptions) containing
 * `</script>` could otherwise break out of the script element. Replacing the
 * angle brackets and ampersand with their JSON \uXXXX escapes closes that XSS
 * vector while keeping the JSON valid for consumers.
 *
 * String.fromCharCode(92) is the backslash — used directly to avoid any
 * source-level backslash-escaping ambiguity.
 */
function serializeJsonLd(data: Record<string, unknown>): string {
  const bs = String.fromCharCode(92)
  return JSON.stringify(data)
    .split('<')
    .join(bs + 'u003c')
    .split('>')
    .join(bs + 'u003e')
    .split('&')
    .join(bs + 'u0026')
}

/** Renders a JSON-LD <script> with the payload safely escaped. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />
  )
}

export function organizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': `${BASE}/#organization`,
    name: `${BRAND.name} Limited`,
    legalName: `${BRAND.name} Limited Company`,
    description: BRAND.description,
    url: BASE,
    slogan: BRAND.tagline,
    logo: `${BASE}/logo/colored.webp`,
    image: `${BASE}/icon-512.png`,
    telephone: `+233${CONTACT.primaryPhone.replace(/^0/, '')}`,
    email: CONTACT.email,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: CONTACT.address,
      addressLocality: 'Accra',
      addressRegion: 'Greater Accra',
      addressCountry: 'GH',
    },
    areaServed: { '@type': 'Country', name: 'Ghana' },
    foundingLocation: { '@type': 'Place', name: 'Accra, Ghana' },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: `+233${CONTACT.primaryPhone.replace(/^0/, '')}`,
        email: CONTACT.email,
        areaServed: 'GH',
        availableLanguage: ['en'],
      },
    ],
    knowsAbout: [
      'Ghana tours',
      'travel and tourism',
      'event planning',
      'corporate retreats',
      'airport transfers',
      'ticketing',
    ],
    sameAs: [SOCIALS.instagram, SOCIALS.tiktok, SOCIALS.linkedin],
  }
}

/** WebSite schema with a Sitelinks Search Box action (Google/Bing). */
export function websiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE}/#website`,
    url: BASE,
    name: BRAND.name,
    description: BRAND.description,
    inLanguage: 'en-GH',
    publisher: { '@id': `${BASE}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE}/experiences?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/** BreadcrumbList — pass ordered crumbs from home to the current page. */
export function breadcrumbSchema(items: { name: string; path: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE}${item.path}`,
    })),
  }
}

/** Service schema for a travel-service page (airport transfers, etc.). */
export function serviceSchema(s: { title: string; blurb: string; slug: string }): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.title,
    serviceType: s.title,
    description: s.blurb,
    url: `${BASE}/travel-services/${s.slug}`,
    areaServed: { '@type': 'Country', name: 'Ghana' },
    provider: { '@id': `${BASE}/#organization` },
  }
}

/** FAQPage — rich results for a question/answer list. */
export function faqSchema(faqs: { q: string; a: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
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
      availability:
        exp.badge === 'Limited'
          ? 'https://schema.org/LimitedAvailability'
          : 'https://schema.org/InStock',
      url: `${BASE}/experiences/${exp.slug}`,
    },
    ...(exp.rating != null
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: exp.rating,
            reviewCount: exp.reviews ?? 0,
          },
        }
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
