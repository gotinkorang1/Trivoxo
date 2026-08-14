/**
 * Legal pages. Booking / cancellation / refund content is built from the shared
 * business rules in src/lib/policies.ts, so the published terms and the enforced
 * pricing/cancellation logic can't drift.
 *
 * Privacy and website terms are practical operational drafts based on the
 * platform's current behaviour. They must receive Ghanaian legal review before
 * production launch (see docs/OPEN_DECISIONS.md).
 */
import {
  GROUP_DISCOUNT_TIERS,
  CHILD_RATE,
  CAPACITY,
  BOOKING_AGE,
  PICKUP,
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

const LEGAL_REVIEW_NOTICE: LegalSection = {
  heading: 'Document status',
  text: 'Last updated 8 August 2026. This is Trivoxo’s operational policy for this platform and should receive final Ghanaian legal review before production launch. Contact info@trivoxoghana.com if anything is unclear.',
}

const childPct = Math.round(CHILD_RATE * 100)
const groupTier = GROUP_DISCOUNT_TIERS[0]!

export const LEGAL_PAGES: LegalPage[] = [
  {
    slug: 'booking-terms',
    title: 'Booking Terms',
    subtitle: 'The terms that apply when you book a Trivoxo experience.',
    sections: [
      {
        text: 'These terms apply when you book any Trivoxo experience, event or travel service. By making a booking you agree to them.',
      },
      {
        heading: 'Bookings & confirmation',
        text: `Submit a booking request with your date, number of travellers, pickup details and contact information. We confirm availability and share payment details; a booking is confirmed once payment (or the required deposit) is received. Standard online bookings run from ${CAPACITY.minGuests} to ${CAPACITY.maxGuests} travellers — groups outside that range are arranged as a custom or private trip. You must be ${BOOKING_AGE.minUnaccompanied} or older to book; ${BOOKING_AGE.minWithConsent}–${BOOKING_AGE.minUnaccompanied - 1} year-olds may book only with the consent of an accompanying adult. Ghanaian travellers provide a Ghana Card number and foreign nationals provide their country and passport details. Pickup location and time are chosen by you and must be within the ${PICKUP.region} region.`,
      },
      {
        heading: 'Pricing & group discounts',
        text: `Prices are per person in Ghanaian Cedi. A single group discount applies: parties of ${groupTier.minGuests} or more travellers receive ${groupTier.discountPct}% off. Children aged 6–12 pay ${childPct}% of the adult rate, children aged 5 and under travel free, and travellers 13 and over are charged as adults (every traveller occupies a vehicle seat). Payment processing fees are already included in our prices — you are not surcharged.`,
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
      {
        text: 'Plans change — here’s how cancellations work across our experiences, trips and events. Cancellation times are measured from the experience start time.',
      },
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
      {
        text: 'This explains how refunds are calculated and paid. It works alongside our Cancellation Policy.',
      },
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
      {
        text: 'This policy explains what Trivoxo Limited Company collects through this website, why we use it, who may receive it and the choices available to you. We aim to collect only what is reasonably needed to serve you.',
      },
      {
        heading: 'Information we collect',
        text: 'Depending on how you use the platform, we may collect your name, email address, phone or WhatsApp number, country, trip dates, traveller numbers, pickup details, service preferences, dietary or accessibility information you choose to provide, booking references, payment status, enquiry messages and newsletter preferences. Staff may also record bookings received by phone, WhatsApp, social media or in person.',
      },
      {
        heading: 'How we use your information',
        text: 'We use this information to answer enquiries, check availability, prepare itineraries and proposals, manage bookings, coordinate suppliers, process and reconcile payments, send confirmations and service updates, provide customer support, prevent misuse, maintain business records and improve our services. Marketing messages are sent only where you have asked for them or where otherwise permitted, and you can unsubscribe.',
      },
      {
        heading: 'Payments',
        text: 'Payments are processed by approved payment providers. Trivoxo stores transaction references, amounts, channels and payment status for reconciliation, but does not store card numbers, Mobile Money PINs or card security codes.',
      },
      {
        heading: 'Who receives information',
        text: 'We may share only the necessary details with staff and service providers involved in your request, such as guides, drivers, accommodation providers, venues, airlines or ticketing partners, payment providers, email providers, website hosting and security providers, and professional advisers. We may also disclose information where required by law or to protect customers, Trivoxo or the public. We do not sell personal information.',
      },
      {
        heading: 'Sensitive and safety information',
        text: 'Some experiences may require limited health, dietary, accessibility or emergency-contact information for safety and service delivery. Please provide only relevant information. Access is restricted to people who need it for the trip, and it is not used for unrelated marketing.',
      },
      {
        heading: 'Cookies and analytics',
        text: 'The website may use essential cookies for security, preferences and account or booking functions. If analytics or marketing tools are enabled, Trivoxo will configure an appropriate consent notice before using non-essential tracking. You can also control cookies through your browser.',
      },
      {
        heading: 'Retention and security',
        text: 'We keep information only as long as reasonably needed for the service, accounting, legal, safety, dispute and fraud-prevention purposes, then delete or anonymise it where practical. We use access controls, encrypted connections, restricted administrator roles, validation, backups and monitoring, but no internet service can guarantee absolute security.',
      },
      {
        heading: 'Your choices and rights',
        text: 'Subject to Ghana’s Data Protection Act, 2012 (Act 843), you may ask whether we hold your personal data, request access or correction, object to certain processing, or ask us to stop direct marketing. We may need to verify your identity and may retain information where law or an active transaction requires it.',
      },
      {
        heading: 'International services',
        text: 'Some technology or travel providers may process information outside Ghana. Where this is necessary, Trivoxo will take reasonable steps to use reputable providers and appropriate safeguards.',
      },
      {
        heading: 'Contact and complaints',
        text: 'Send privacy questions or requests to info@trivoxoghana.com or contact Trivoxo at Plantsville Residence, Poultry Farm Ave, Accra, Ghana. If a concern is not resolved, you may contact Ghana’s Data Protection Commission.',
      },
      LEGAL_REVIEW_NOTICE,
    ],
  },
  {
    slug: 'terms-of-use',
    title: 'Terms of Use',
    subtitle: 'The terms for using the Trivoxo website.',
    sections: [
      {
        text: 'These terms apply when you visit or use the Trivoxo website. Booking Terms, Cancellation Policy and Refund Policy also apply when you request or purchase a tour, event ticket or travel service.',
      },
      {
        heading: 'Using the website',
        text: 'You may use the website for lawful personal or business travel planning. You agree to provide accurate information, keep booking-management links and references secure, and avoid any activity that could damage, overload, scrape, reverse engineer, disrupt or gain unauthorised access to the website, accounts or data.',
      },
      {
        heading: 'Availability and quotations',
        text: 'Website availability calendars show normal operating patterns unless expressly marked as live inventory. A request is not confirmed until Trivoxo verifies availability and receives the required payment or deposit. Prices, schedules and inclusions may change before confirmation. Custom trips, corporate services, flights, accommodation and some transfers are quotation requests rather than instant purchases.',
      },
      {
        heading: 'Payments and third-party services',
        text: 'Payments and some travel services are provided through third parties. Their secure pages and service terms may also apply. Trivoxo is not responsible for a third-party website’s content or availability, but remains responsible for the Trivoxo services confirmed in your booking.',
      },
      {
        heading: 'Website content',
        text: 'We work to keep descriptions, dates and prices accurate. Photographs may illustrate a destination or activity and do not guarantee identical weather, views, vehicles, rooms or group composition. If a material website error affects your request, Trivoxo will correct it before confirmation or offer a suitable remedy.',
      },
      {
        heading: 'Intellectual property',
        text: 'The Trivoxo name, logos, website design, original text, photographs and other material are owned by Trivoxo or used with permission. You may share public page links for personal planning, but may not copy, republish or commercially exploit protected material without written permission.',
      },
      {
        heading: 'Reviews and submissions',
        text: 'If you submit a review, enquiry or other content, it must be truthful, lawful and respectful. You permit Trivoxo to store and use it to respond to you and, for an approved review, to display it with the name or initials you supplied. We may reject or remove fraudulent, abusive, irrelevant or unlawful material.',
      },
      {
        heading: 'Liability',
        text: 'Nothing in these terms excludes liability that cannot lawfully be excluded. To the extent permitted by law, Trivoxo is not liable for indirect losses caused solely by your device, internet connection, unauthorised use of a link you failed to secure, or an independent third-party website. Tour and service responsibilities are governed by the terms confirmed with your booking.',
      },
      {
        heading: 'Changes, suspension and governing law',
        text: 'We may update or temporarily suspend parts of the website for security, maintenance or business changes. Material term changes apply from the published update date and do not retrospectively reduce confirmed booking rights. These website terms are governed by the laws of Ghana.',
      },
      {
        heading: 'Contact',
        text: 'Questions about these terms can be sent to info@trivoxoghana.com or raised by phone or WhatsApp using the contact details on this website.',
      },
      LEGAL_REVIEW_NOTICE,
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
