import type { Metadata } from 'next'
import { Compass, HeartHandshake, Route } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { CustomTripForm } from '@/components/forms/custom-trip-form'

export const metadata: Metadata = {
  title: 'Custom Trips',
  description:
    'Tell us what you enjoy and let Trivoxo design a tailor-made Ghana experience around your interests, budget and pace.',
}

const POINTS = [
  { icon: Compass, title: 'Built around you', body: 'Your interests, your pace, your budget.' },
  { icon: Route, title: 'Multi-day journeys', body: 'From weekend escapes to full itineraries.' },
  {
    icon: HeartHandshake,
    title: 'Diaspora & private groups',
    body: 'Returns, executive escapes and more.',
  },
]

export default function CustomTripsPage() {
  return (
    <>
      <section
        className="relative overflow-hidden text-white"
        style={{ background: 'linear-gradient(120deg,#7a2e12,#e85d2a 70%,#f5b133)' }}
      >
        <Container className="py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/85">
            Your Ghana. Your way.
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold text-white sm:text-5xl">
            Build my Ghana experience
          </h1>
          <p className="mt-4 max-w-xl text-white/90">
            Tell us what you enjoy and let Trivoxo design a trip made just for you — history, food,
            adventure, beaches, wellness, or a bit of everything.
          </p>
        </Container>
      </section>

      <Container className="py-14 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 className="text-2xl font-semibold">How it works</h2>
            <div className="mt-6 space-y-5">
              {POINTS.map((p) => (
                <div key={p.title} className="flex gap-4">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-accent-soft text-brand-accent">
                    <p.icon className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-text-primary">{p.title}</p>
                    <p className="text-sm text-text-secondary">{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-8 rounded-card border border-border bg-surface p-5 text-sm text-text-secondary">
              No obligation — share your ideas and we’ll respond with a suggested itinerary and
              pricing.
            </p>
          </div>

          <div className="rounded-card border border-border bg-surface-elevated p-6 sm:p-8">
            <h2 className="text-xl font-semibold">Tell us about your trip</h2>
            <div className="mt-6">
              <CustomTripForm />
            </div>
          </div>
        </div>
      </Container>
    </>
  )
}
