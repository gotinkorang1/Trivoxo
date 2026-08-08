import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { TRAVEL_SERVICES } from '@/lib/data/travel-services'

export const metadata: Metadata = {
  title: 'Travel Services',
  description: 'Airport transfers, flights & ticketing, accommodation and car rentals across Ghana.',
}

export default function TravelServicesPage() {
  return (
    <Container className="py-10 sm:py-14">
      <header className="mb-8 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-primary">Travel Services</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Everything for a smooth trip</h1>
        <p className="mt-2 text-text-secondary">
          Transfers, ticketing, accommodation and rentals — tell us what you need and we’ll take care of the details.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        {TRAVEL_SERVICES.map((s) => (
          <Link
            key={s.slug}
            href={`/travel-services/${s.slug}`}
            className="group flex items-start gap-4 rounded-card border border-border bg-surface-elevated p-6 transition-all hover:-translate-y-1 hover:border-brand-primary hover:shadow-md"
          >
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
              <s.icon className="size-6" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-text-primary group-hover:text-brand-primary">{s.title}</p>
              <p className="mt-1 text-sm text-text-secondary">{s.blurb}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary">
                Get started <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  )
}
