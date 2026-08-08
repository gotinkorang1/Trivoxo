import type { Metadata } from 'next'
import { ChevronDown } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { ButtonLink } from '@/components/ui/button'

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
    q: 'Do I pay online right now?',
    a: 'Online payment (Mobile Money and cards) is coming soon. For now, after you submit a booking request our team reaches out to confirm and arrange payment.',
  },
  {
    q: 'Is there a discount for groups?',
    a: 'Yes. Standard pricing assumes at least two travellers, and groups of three or more can receive reduced per-person rates. Your exact group price is confirmed with your quote.',
  },
  {
    q: 'What’s the minimum group size?',
    a: 'Most experiences run from two travellers. Some experiences also offer private options — just ask.',
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
    <Container className="max-w-3xl py-12 sm:py-16">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-link">FAQs</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Frequently asked questions</h1>
      </header>

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
  )
}
