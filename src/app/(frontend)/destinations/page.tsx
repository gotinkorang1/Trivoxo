import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { PageHero } from '@/components/site/page-hero'
import { getAllDestinations } from '@/lib/payload/destinations'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Destinations',
  description: 'Explore Ghana by destination — Accra, Cape Coast, Volta, Akosombo and more.',
}

export default async function DestinationsPage() {
  const destinations = await getAllDestinations()

  return (
    <>
      <PageHero
        eyebrow="Destinations"
        title="Explore Ghana, one rhythm at a time"
        description="Follow the capital’s pulse, the coast’s stories, highland waterfalls and slow lakeside escapes."
      />
      <Container className="py-16 sm:py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => {
            const count = destination.experienceSlugs.length
            return (
              <Link
                key={destination.slug}
                href={`/destinations/${destination.slug}`}
                className="card-lift group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-card border border-white/10 p-6 text-white shadow-soft"
                style={{ background: destination.gradient }}
              >
                {destination.image && (
                  <Image
                    src={destination.image.src}
                    alt={destination.image.alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/15 to-transparent transition group-hover:from-black/62" />
                <div className="relative">
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white/82">
                    <MapPin className="size-3.5" aria-hidden="true" /> {destination.region}
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">{destination.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/82">
                    {destination.blurb}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <p className="text-xs font-bold text-white/86">
                      {count} experience{count === 1 ? '' : 's'}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white">
                      Explore{' '}
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </Container>
    </>
  )
}
