import type { Metadata } from 'next'
import { Building2, Users, CalendarCheck, Truck } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { HeroBackground } from '@/components/site/hero-background'
import { CorporateForm } from '@/components/forms/corporate-form'

export const metadata: Metadata = {
  title: 'Corporate & Groups',
  description:
    'Corporate retreats, conferences, company outings and full event management across Ghana — planned and run end to end by Trivoxo.',
}

const CAPABILITIES = [
  {
    icon: Building2,
    title: 'Venue & logistics',
    body: 'Sourcing, setup and on-ground coordination.',
  },
  { icon: Users, title: 'Team experiences', body: 'Retreats, outings and team-building days.' },
  { icon: CalendarCheck, title: 'Conferences', body: 'Registration, AV, catering and staffing.' },
  { icon: Truck, title: 'End-to-end delivery', body: 'Transport, accommodation and management.' },
]

export default function CorporatePage() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative isolate overflow-hidden text-white"
        style={{ background: 'linear-gradient(120deg,#0e1c2b,#13273a 60%,#1e3350)' }}
      >
        <HeroBackground
          src="/images/corporate-travel-retreat.jpg"
          alt="A corporate travel retreat in Ghana"
        />
        <Container className="relative py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-secondary">
            Corporate & Groups
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold text-white sm:text-5xl">
            Bring your team somewhere memorable
          </h1>
          <p className="mt-4 max-w-xl text-white/85">
            Corporate retreats, conferences, company outings and complete event coordination —
            planned and run end to end, so your team just shows up.
          </p>
        </Container>
      </section>

      <Container className="py-14 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          {/* What we handle */}
          <div>
            <h2 className="text-2xl font-semibold">What we handle</h2>
            <div className="mt-6 space-y-5">
              {CAPABILITIES.map((c) => (
                <div key={c.title} className="flex gap-4">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
                    <c.icon className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-text-primary">{c.title}</p>
                    <p className="text-sm text-text-secondary">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="rounded-card border border-border bg-surface-elevated p-6 sm:p-8">
            <h2 className="text-xl font-semibold">Request a proposal</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Share a few details and we’ll come back with a tailored plan.
            </p>
            <div className="mt-6">
              <CorporateForm />
            </div>
          </div>
        </div>
      </Container>
    </>
  )
}
