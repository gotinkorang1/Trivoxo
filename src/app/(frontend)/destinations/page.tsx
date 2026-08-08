import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { DESTINATIONS, getDestinationExperiences } from '@/lib/data/destinations'

export const metadata: Metadata = {
  title: 'Destinations',
  description: 'Explore Ghana by destination — Accra, Cape Coast, Volta, Akosombo and more.',
}

export default function DestinationsPage() {
  return (
    <Container className="py-10 sm:py-14">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-primary">Destinations</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Explore Ghana</h1>
        <p className="mt-2 max-w-2xl text-text-secondary">
          Pick a place to see the experiences waiting there — from the capital’s pulse to highland waterfalls and
          lakeside escapes.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DESTINATIONS.map((dest) => {
          const count = getDestinationExperiences(dest.slug).length
          return (
            <Link
              key={dest.slug}
              href={`/destinations/${dest.slug}`}
              className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-card p-6 text-white transition-transform hover:-translate-y-1"
              style={{ background: dest.gradient }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent transition-opacity group-hover:from-black/75" />
              <div className="relative">
                <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-white/80">
                  <MapPin className="size-3.5" /> {dest.region}
                </p>
                <p className="mt-1 font-display text-2xl font-semibold">{dest.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-white/85">{dest.blurb}</p>
                <p className="mt-3 text-xs font-semibold text-white/90">
                  {count} experience{count === 1 ? '' : 's'}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </Container>
  )
}
