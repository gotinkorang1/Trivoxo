/**
 * Legal pages. Booking / cancellation / refund content is built from the shared
 * business rules in src/lib/policies.ts, so the published terms and the enforced
 * pricing/cancellation logic can't drift.
 *
 * Privacy Policy and Terms of Use remain "being finalised" placeholders: the
 * privacy wording needs Trivoxo's actual data-handling practices and a local
 * legal review before publishing (see docs/OPEN_DECISIONS.md).
 */
import {
  GROUP_DISCOUNT_TIERS,
  CHILD_RATE,
  CAPACITY,
  BOOKING_NOTICE,
  DEPOSIT,
  CANCELLATION,
  RESCHEDULE,
  REFUND_WINDOW,
  GUIDE_LANGUAGES,
} from '../policies'

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

const childPct = Math.round(CHILD_RATE * 100)
const discountLadder = GROUP_DISCOUNT_TIERS.filter((t) => !t.requestQuote)
  .map((t) => `${t.discountPct}% for ${t.minGuests}–${t.maxGuests}`)
  .join(', ')

export const LEGAL_PAGES: LegalPage[] = [
  {
    slug: 'booking-terms',
    title: 'Booking Terms',
    subtitle: 'The terms that apply when you book a Trivoxo experience.',
    sections: [
      { text: 'These terms apply when you book any Trivoxo experience, event or travel service. By making a booking you agree to them.' },
      {
        heading: 'Bookings & confirmation',
        text: `Submit a booking request with your date, number of travellers and contact details. We confirm availability and share payment details; a booking is confirmed once payment (or the required deposit) is received. Most experiences run from a minimum of ${CAPACITY.minGuests} travellers, with private options available for solo travellers on request.`,
      },
      {
        heading: 'Pricing & group discounts',
        text: `Prices are per person in Ghanaian Cedi and assume ${CAPACITY.minGuests} travellers. Groups of 3 or more receive a reduced per-person rate (${discountLadder}; groups of 15+ are priced by custom quote). Children aged 3–11 pay ${childPct}% of the adult rate and infants under 3 travel free. Payment processing fees are already included in our prices — you are not surcharged.`,
      },
      {
        heading: 'Payment & deposits',
        text: `Day experiences are paid in full to confirm. Multi-day, premium and corporate bookings require a ${DEPOSIT.pct}% deposit, with the balance due ${DEPOSIT.balanceDueDays} days before departure. We accept Mobile Money, cards and bank transfer through our secure payment provider.`,
      },
      {
        heading: 'Booking notice & capacity',
        text: `Day experiences need at least ${BOOKING_NOTICE.dayTourHours} hours’ notice (${BOOKING_NOTICE.permitTourHours} hours where park permits are required); multi-day trips need ${BOOKING_NOTICE.multiDayDays} days. Group sizes typically run ${CAPACITY.minGuests}–${CAPACITY.maxGuests} travellers; larger groups are welcome by arrangement.`,
      },
      {
        heading: 'What’s included',
        text: 'Each experience page lists exactly what is and isn’t included. Anything not stated as included is excluded.',
      },
      {
        heading: 'Your responsibilities',
        text: `Please arrive on time at the meeting point, follow your guide’s safety instructions, and let us know of any relevant health or accessibility needs when you book. Guiding is in ${GUIDE_LANGUAGES.default} by default; ${GUIDE_LANGUAGES.onRequest.join(', ')} are available on request, and other languages with ${GUIDE_LANGUAGES.advanceNoticeDays} days’ notice.`,
      },
      {
        heading: 'Changes by Trivoxo',
        text: 'We may adjust or reschedule an experience for safety, weather or circumstances beyond our control. Where we do, we’ll offer you a suitable alternative, a reschedule or a refund.',
      },
      {
        heading: 'Cancellations',
        text: 'Cancellations are governed by our Cancellation Policy and Refund Policy.',
      },
    ],
  },
  {
    slug: 'cancellation-policy',
    title: 'Cancellation Policy',
    subtitle: 'What happens if you need to cancel or change your trip.',
    sections: [
      { text: 'Plans change — here’s how cancellations work across our experiences, trips and events. Cancellation times are measured from the experience start time.' },
      {
        heading: 'Day experiences & activities',
        text: `Free cancellation up to ${CANCELLATION.dayTour.freeHours} hours before — full refund. Between ${CANCELLATION.dayTour.partialFromHours} and ${CANCELLATION.dayTour.freeHours} hours before — ${CANCELLATION.dayTour.partialPct}% refund. Less than ${CANCELLATION.dayTour.partialFromHours} hours before, or a no-show — no refund.`,
      },
      {
        heading: 'Multi-day trips',
        text: `Because accommodation and suppliers are booked in advance: free cancellation up to ${CANCELLATION.multiDay.freeDays} days before — full refund. Between ${CANCELLATION.multiDay.partialFromDays} and ${CANCELLATION.multiDay.freeDays} days before — ${CANCELLATION.multiDay.partialPct}% refund. Less than ${CANCELLATION.multiDay.partialFromDays} days before, or a no-show — no refund.`,
      },
      {
        heading: 'Event tickets',
        text: `Event tickets are non-refundable, but they are transferable — to another person, or to another date where we run recurring editions — with at least ${CANCELLATION.event.transferHours} hours’ notice.`,
      },
      {
        heading: 'Corporate & custom trips',
        text: 'These are governed by the terms of your signed proposal; deposits are non-refundable.',
      },
      {
        heading: 'Rescheduling',
        text: `You may reschedule once, free of charge, if you tell us at least ${RESCHEDULE.dayTourHours} hours before a day experience or ${RESCHEDULE.multiDayDays} days before a multi-day trip, subject to availability. After that, a change is treated as a cancellation.`,
      },
      {
        heading: 'If we cancel',
        text: 'If Trivoxo cancels an experience (for example for safety, weather, or if the minimum group size isn’t met), you’ll be offered a reschedule or a full refund.',
      },
      {
        heading: 'How to cancel',
        text: 'Contact us with your booking reference as early as possible — the earlier you tell us, the more we can do to help.',
      },
    ],
  },
  {
    slug: 'refund-policy',
    title: 'Refund Policy',
    subtitle: 'How and when refunds are issued.',
    sections: [
      { text: 'This explains how refunds are calculated and paid. It works alongside our Cancellation Policy.' },
      {
        heading: 'How refunds are calculated',
        text: 'The refund you receive depends on when you cancel, as set out in our Cancellation Policy (full, partial or none).',
      },
      {
        heading: 'Method & timing',
        text: `Approved refunds are returned to your original payment method within ${REFUND_WINDOW} of approval. Mobile Money and card timelines depend on your provider.`,
      },
      {
        heading: 'Non-refundable elements',
        text: `Deposits on multi-day and corporate bookings, event tickets (which are transferable instead), and any third-party costs already committed on your behalf are non-refundable.`,
      },
      {
        heading: 'If we cancel',
        text: 'If Trivoxo cancels an experience, or in the event of circumstances beyond our control, you’ll be offered a full refund or a reschedule.',
      },
      {
        heading: 'Questions',
        text: 'If anything about a refund is unclear, contact us with your booking reference and we’ll walk you through it.',
      },
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
