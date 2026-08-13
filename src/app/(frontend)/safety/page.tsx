import type { Metadata } from 'next'
import { ShieldCheck, Users, MapPinned, HeartPulse, Backpack } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { PageHero } from '@/components/site/page-hero'
import { ButtonLink } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Safety',
  description: 'How Trivoxo keeps experiences safe — experienced guides, vetted partners and careful coordination.',
}

const PRINCIPLES = [
  { icon: Users, title: 'Experienced guides', body: 'Trips are led and coordinated by people who know the routes and the terrain.' },
  { icon: MapPinned, title: 'Planned logistics', body: 'Transport, timing and meeting points are arranged in advance so days run smoothly.' },
  { icon: ShieldCheck, title: 'Vetted partners', body: 'We work with trusted operators, venues and drivers across our destinations.' },
  { icon: HeartPulse, title: 'Prepared for the day', body: 'We share what to expect — fitness level, terrain and what to bring — before you go.' },
]

export default function SafetyPage() {
  return (
    <>
      <PageHero
        eyebrow="Safety"
        title="Adventure with confidence"
        description="Great experiences should also be well-run and safe. Here’s how we plan and coordinate every trip so you can focus on enjoying it."
        image={{ src: '/images/avatime-volta.jpg', alt: 'The Avatime hills in the Volta Region' }}
      />
      <Container className="py-12 sm:py-16">
        <div className="grid gap-5 sm:grid-cols-2">
        {PRINCIPLES.map((p) => (
          <div key={p.title} className="flex gap-4 rounded-card border border-border bg-surface-elevated p-6">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-accent-soft text-brand-accent">
              <p.icon className="size-5" />
            </span>
            <div>
              <p className="font-semibold text-text-primary">{p.title}</p>
              <p className="mt-1 text-sm text-text-secondary">{p.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-card border border-border bg-surface p-6">
        <p className="flex items-center gap-2 font-semibold text-text-primary">
          <Backpack className="size-5 text-brand-primary" /> Before your trip
        </p>
        <p className="mt-2 text-sm text-text-secondary">
          Each experience page lists its difficulty, what’s included and what to bring. For hikes and adventures,
          wear comfortable, grippy footwear and carry water. If you have specific health or accessibility needs,
          let us know when you book and we’ll advise on the best options.
        </p>
        <ButtonLink href="/contact" variant="outline" className="mt-4">
          Talk to us about your trip
        </ButtonLink>
      </div>
      </Container>
    </>
  )
}
