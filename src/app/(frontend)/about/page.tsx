import type { Metadata } from 'next'
import {
  Gem,
  HeartHandshake,
  ShieldCheck,
  BadgeCheck,
  Coins,
  Lightbulb,
  Leaf,
  Church,
  MapPinned,
  Plane,
  BedDouble,
  Car,
  Briefcase,
  CalendarCheck,
  Ticket,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Container } from '@/components/ui/container'
import { ButtonLink } from '@/components/ui/button'
import { BRAND } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'About',
  description: `${BRAND.name} is a Ghanaian-owned tours, events and ticketing company creating safe, memorable experiences across Ghana.`,
}

const SERVICES: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: MapPinned, title: 'Tours & Experiences', body: 'City, heritage and beach days, adventure getaways and multi-day journeys designed around your pace.' },
  { icon: Plane, title: 'Airport Pickup & Drop-off', body: 'Arrive stress-free with professional drivers, reliable schedules and comfortable vehicles.' },
  { icon: BedDouble, title: 'Hotel Booking & Accommodation', body: 'Selected hotels and serviced apartments across Ghana for comfort and convenience.' },
  { icon: Car, title: 'Car Rentals', body: 'Clean, well-maintained options with experienced support — for personal and corporate travel.' },
  { icon: Briefcase, title: 'Corporate Travel & Retreats', body: 'Logistics, schedules, destinations and premium experiences built for organizations.' },
  { icon: CalendarCheck, title: 'Events, Conferences & Coordination', body: 'From planning to execution, detail-driven coordination for events and group experiences.' },
  { icon: Ticket, title: 'Ticketing (Local & International)', body: 'Fast, reliable ticketing support — so you can focus on the experience.' },
  { icon: Users, title: 'Group Tour Organization', body: 'For schools, churches, companies and families — transport, timing, accommodation and activities.' },
]

const VALUES: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Gem, title: 'Excellence in the Details', body: 'We don’t “rush and hope.” We plan carefully and pay attention to the details that make an experience smooth and premium.' },
  { icon: HeartHandshake, title: 'Client-Centered Service', body: 'You are the focus. We listen, personalize every experience and deliver with warm hospitality.' },
  { icon: ShieldCheck, title: 'Safety First', body: 'Professional drivers, well-maintained vehicles and reliable support — always prepared, always responsible.' },
  { icon: BadgeCheck, title: 'Professionalism', body: 'Discipline and class: timely execution, clear coordination and a standard of service you can trust.' },
  { icon: Coins, title: 'Value for Money', body: 'The best return on every cedi — quality experiences that feel premium and truly worth it.' },
  { icon: Lightbulb, title: 'Innovation & Creativity', body: 'Fresh ideas and modern approaches that design experiences beyond the ordinary.' },
  { icon: Leaf, title: 'Responsible Tourism', body: 'Sustainable, community-friendly travel that creates positive value for the places and people we engage.' },
  { icon: Church, title: 'God Factor', body: 'We lead with faith, integrity and humility — doing the right thing and treating every client with respect.' },
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
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold sm:text-5xl">Experience Ghana the Trivoxo way</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/85">
            Trivoxo Limited Company is a Ghanaian-owned travel and tour company specializing in Tours, Events and
            Ticketing. We curate immersive experiences that showcase Ghana’s rich culture, history and lifestyle —
            safe, affordable and luxurious.
          </p>
        </Container>
      </section>

      <Container className="py-14 sm:py-20">
        {/* Who we are */}
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold">Professional planning, unforgettable moments</h2>
            <div className="mt-4 space-y-4 text-text-secondary">
              <p>
                We design well-organized journeys, coordinate successful events and support professional
                conferences — making every project smooth, enjoyable and stress-free. Our tours are personalized,
                well-organized and customer-focused, combining fun, cultural immersion and healthy living.
              </p>
              <p>
                Our services are tailored to expatriates, corporate organizations and leisure travelers, with a
                focus on delivering experiences that create lasting memories.
              </p>
            </div>
          </div>
          <div className="rounded-card border border-border bg-surface p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-link">Part of the group</p>
            <p className="mt-2 text-text-secondary">
              Trivoxo operates as a subsidiary under <strong className="text-text-primary">Nii Plants Group</strong>,
              built to deliver premium experience services with the same commitment to quality, structure and
              client satisfaction.
            </p>
          </div>
        </div>

        {/* Services */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold">What we offer</h2>
          <p className="mt-2 max-w-2xl text-text-secondary">
            Reliable travel, tour and event services designed to make every trip in Ghana smooth, safe and
            unforgettable.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s) => (
              <div key={s.title} className="rounded-card border border-border bg-surface-elevated p-5">
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
                  <s.icon className="size-5" />
                </span>
                <p className="mt-3 font-semibold text-text-primary">{s.title}</p>
                <p className="mt-1 text-sm text-text-secondary">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold">Our values</h2>
          <p className="mt-2 max-w-2xl text-text-secondary">
            Our values guide how we plan, host and deliver every tour, event and conference — down to the smallest
            detail.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-card border border-border bg-surface-elevated p-5">
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-brand-accent-soft text-brand-accent">
                  <v.icon className="size-5" />
                </span>
                <p className="mt-3 font-semibold text-text-primary">{v.title}</p>
                <p className="mt-1 text-sm text-text-secondary">{v.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
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
