import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { PageHero } from '@/components/site/page-hero'
import { TRAVEL_SERVICES } from '@/lib/data/travel-services'
import { travelServiceImage } from '@/lib/site-media'

export const metadata: Metadata = {
  title: 'Travel Services',
  description: 'Airport transfers, flights and ticketing, accommodation and car rentals across Ghana.',
}

export default function TravelServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Travel services"
        title="Every detail, already handled"
        description="Transfers, ticketing, accommodation and rentals — tell us what you need and travel with less friction."
        image={{ src: '/images/airport-transfer.jpg', alt: 'An airport transfer vehicle ready for pickup' }}
      />
      <Container className="py-16 sm:py-20">
        <div className="grid gap-6 sm:grid-cols-2">
          {TRAVEL_SERVICES.map((service) => {
            const image = travelServiceImage(service.slug)
            return (
              <Link
                key={service.slug}
                href={`/travel-services/${service.slug}`}
                className="card-lift group overflow-hidden rounded-card border border-border bg-surface-elevated shadow-soft"
              >
                {image ? (
                  <div className="relative aspect-[16/8] overflow-hidden">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                  </div>
                ) : (
                  <div className="soft-grid flex aspect-[16/8] items-center justify-center bg-brand-navy text-brand-secondary">
                    <service.icon className="size-12" aria-hidden="true" />
                  </div>
                )}
                <div className="flex items-start gap-4 p-6">
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary-soft text-brand-link transition group-hover:rotate-3 group-hover:bg-brand-primary group-hover:text-brand-navy">
                    <service.icon className="size-6" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-sans text-lg font-bold tracking-normal text-text-primary transition-colors group-hover:text-brand-link">{service.title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">{service.blurb}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-link">
                      Get started <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
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
