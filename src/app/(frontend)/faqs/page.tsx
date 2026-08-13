import type { Metadata } from 'next'
import { ChevronDown } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { PageHero } from '@/components/site/page-hero'
import { ButtonLink } from '@/components/ui/button'
import { JsonLd, faqSchema, breadcrumbSchema } from '@/components/seo/structured-data'

export const metadata: Metadata = {
  title: 'FAQs',
  description: 'Answers to common questions about booking Trivoxo experiences, pricing, groups and more.',
}

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How do I book an experience?',
    a: 'Choose an experience, click “Book this experience”, and tell us your date, group size and contact details. We confirm availability and send you the next steps — you’re not charged at that point.',
  },
  {
    q: 'How do I pay?',
    a: 'You pay securely online with Mobile Money, cards or bank transfer through Paystack. We hold your place while you complete checkout, and your booking is confirmed as soon as the payment is verified — you’re never charged before your seats are held.',
  },
  {
    q: 'Is there a discount for groups?',
    a: 'Yes. Parties of 10 or more travellers receive a 5% group discount, applied automatically to your quote. Children aged 6–12 pay 60% of the adult rate and children 5 and under travel free.',
  },
  {
    q: 'What’s the group size for an online booking?',
    a: 'Standard online bookings run from 4 to 30 travellers (the smallest vehicle seats 4 passengers, the largest 30). For a smaller or larger group, request a custom or private trip and we’ll arrange it. Pickup is within Greater Accra, at a location and time you choose.',
  },
  {
    q: 'What’s included in the price?',
    a: 'It varies by experience. Each experience page lists exactly what’s included and excluded (for example, attraction entry fees and transport included, meals excluded unless stated).',
  },
  {
    q: 'Can you plan a custom or private trip?',
    a: 'Absolutely — that’s a core part of what we do. Tell us your interests, dates and budget on the Custom Trips page and we’ll design an itinerary around you.',
  },
  {
    q: 'Do you handle corporate events?',
    a: 'Yes. We plan and run corporate retreats, conferences, team-building days and company outings end to end. Start on the Corporate & Groups page.',
  },
  {
    q: 'What are your cancellation and refund terms?',
    a: 'For day experiences: free cancellation up to 48 hours before (full refund), 50% between 24 and 48 hours, and no refund under 24 hours or for a no-show. Multi-day trips use a 7-day window. Event tickets are non-refundable but transferable. You can also reschedule once for free within the same windows. Full details are on our Cancellation and Refund policy pages.',
  },
  {
    q: 'Are the experiences safe?',
    a: 'Safety-conscious planning is built into every trip — experienced guides, vetted partners and prepared logistics. See our Safety page for more.',
  },
]

export default function FaqsPage() {
  return (
    <>
      <JsonLd data={faqSchema(FAQS)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'FAQs', path: '/faqs' },
        ])}
      />
      <PageHero
        eyebrow="FAQs"
        title="Frequently asked questions"
        description="Answers to common questions about booking, pricing, groups, safety and more."
        image={{ src: '/images/aburi-hills.avif', alt: 'The Aburi hills in the Eastern Region' }}
      />
      <Container className="max-w-3xl py-12 sm:py-16">
        <div className="divide-y divide-border rounded-card border border-border bg-surface-elevated">
        {FAQS.map((item) => (
          <details key={item.q} className="group px-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium text-text-primary marker:hidden">
              {item.q}
              <ChevronDown className="size-5 shrink-0 text-text-muted transition-transform group-open:rotate-180" />
            </summary>
            <p className="pb-4 text-sm leading-relaxed text-text-secondary">{item.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 rounded-card border border-border bg-surface p-8 text-center">
        <p className="font-semibold text-text-primary">Still have a question?</p>
        <ButtonLink href="/contact">Get in touch</ButtonLink>
      </div>
      </Container>
    </>
  )
}
