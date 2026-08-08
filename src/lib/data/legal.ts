/**
 * Legal pages. The actual policy text is a business decision still pending
 * (see docs/OPEN_DECISIONS.md — cancellation, refund, no-show, rescheduling
 * terms are not finalised), so these render an honest "being finalised" notice
 * rather than fabricated legal terms. Staff can publish the real policies via
 * the admin Pages collection, and this route can later read from there.
 */

export type LegalSection = { heading?: string; text: string }
export type LegalPage = {
  slug: string
  title: string
  subtitle: string
  sections: LegalSection[]
}

const PENDING: LegalSection = {
  heading: 'This policy is being finalised',
  text: 'We’re finalising the full details of this policy. In the meantime, the terms that apply to your trip are confirmed with your booking. If you have any questions, please contact us and we’ll be glad to help.',
}

export const LEGAL_PAGES: LegalPage[] = [
  {
    slug: 'booking-terms',
    title: 'Booking Terms',
    subtitle: 'The terms that apply when you book a Trivoxo experience.',
    sections: [
      { text: 'These terms will cover how bookings are made and confirmed, what your booking includes, group requirements and your responsibilities as a traveller.' },
      PENDING,
    ],
  },
  {
    slug: 'cancellation-policy',
    title: 'Cancellation Policy',
    subtitle: 'What happens if you need to cancel or change your trip.',
    sections: [
      { text: 'This policy will set out cancellation windows and any applicable charges. If your plans change, contact us as early as possible and we’ll do our best to help.' },
      PENDING,
    ],
  },
  {
    slug: 'refund-policy',
    title: 'Refund Policy',
    subtitle: 'How refunds are handled.',
    sections: [
      { text: 'This policy will explain when and how refunds are issued, including any non-refundable elements and processing times.' },
      PENDING,
    ],
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    subtitle: 'How we handle your personal information.',
    sections: [
      { text: 'This policy will describe what information we collect when you book or enquire, how we use it to deliver your experience, and the choices you have. We only collect what we need to serve you.' },
      PENDING,
    ],
  },
  {
    slug: 'terms-of-use',
    title: 'Terms of Use',
    subtitle: 'The terms for using the Trivoxo website.',
    sections: [
      { text: 'These terms will govern your use of this website, acceptable use, and the limits of our liability.' },
      PENDING,
    ],
  },
]

export function getLegalPage(slug: string): LegalPage | undefined {
  return LEGAL_PAGES.find((p) => p.slug === slug)
}

/**
 * All content pages (dedicated + legal), used by the seed to populate the admin
 * Pages collection as stubs staff can edit. Slugs match the live routes.
 */
export const CONTENT_PAGE_STUBS: { slug: string; title: string; subtitle: string }[] = [
  { slug: 'about', title: 'About Trivoxo', subtitle: 'Our story and what we do.' },
  { slug: 'contact', title: 'Contact', subtitle: 'How to reach us.' },
  { slug: 'safety', title: 'Safety', subtitle: 'How we keep experiences safe.' },
  { slug: 'faqs', title: 'FAQs', subtitle: 'Common questions answered.' },
  ...LEGAL_PAGES.map((p) => ({ slug: p.slug, title: p.title, subtitle: p.subtitle })),
]
