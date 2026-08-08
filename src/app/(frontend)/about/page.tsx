import type { Metadata } from 'next'
import { Compass, Sparkles, ShieldCheck, Users } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { ButtonLink } from '@/components/ui/button'
import { BRAND } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'About',
  description: `${BRAND.name} designs curated tours, outdoor adventures, cultural journeys and events across Ghana.`,
}

const VALUES = [
  { icon: Compass, title: 'Local expertise', body: 'We build experiences around Ghana, led by people who know it best.' },
  { icon: Sparkles, title: 'Curated, not generic', body: 'Handpicked routes, partners and moments — never off-the-shelf.' },
  { icon: ShieldCheck, title: 'Safety-conscious', body: 'Careful planning and coordination on every trip.' },
  { icon: Users, title: 'Built around you', body: 'Private, group and fully tailor-made options.' },
]

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-brand-navy text-white">
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(120% 120% at 20% 10%, rgba(232,93,42,0.5), transparent 45%), linear-gradient(160deg,#0e1c2b,#10202e)' }}
        />
        <Container className="relative py-16 sm:py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-secondary">{BRAND.tagline}</p>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold sm:text-5xl">
            We help people experience Ghana beyond the ordinary
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/85">
            Trivoxo is a Ghanaian travel, adventure and events company. We craft tours, hikes, cultural journeys,
            premium escapes and memorable events — for individuals, groups, expatriates and the diaspora coming home.
          </p>
        </Container>
      </section>

      <Container className="py-14 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold">Who we are</h2>
            <div className="mt-4 space-y-4 text-text-secondary">
              <p>
                We started Trivoxo to make exploring Ghana effortless and genuinely memorable. From the pulse of
                Accra to Volta’s waterfalls and the heritage of the coast, there is so much to discover — and it
                should feel welcoming, well-organised and safe.
              </p>
              <p>
                Today we run curated day tours and adventures, plan corporate retreats and events, and design
                tailor-made trips for private groups and returning diaspora travellers.
              </p>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-card border border-border bg-surface-elevated p-5">
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
                  <v.icon className="size-5" />
                </span>
                <p className="mt-3 font-semibold text-text-primary">{v.title}</p>
                <p className="mt-1 text-sm text-text-secondary">{v.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 rounded-3xl border border-border bg-surface p-10 text-center">
          <h2 className="text-2xl font-semibold">Ready to explore?</h2>
          <p className="max-w-lg text-text-secondary">
            Browse our experiences or tell us what you enjoy and we’ll design something around you.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/experiences">Browse experiences</ButtonLink>
            <ButtonLink href="/custom-trips" variant="outline">Plan a custom trip</ButtonLink>
          </div>
        </div>
      </Container>
    </>
  )
}
