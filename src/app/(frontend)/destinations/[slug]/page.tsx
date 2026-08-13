import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, MapPin } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { ButtonLink } from '@/components/ui/button'
import { ExperienceCard } from '@/components/experiences/experience-card'
import { JsonLd, breadcrumbSchema } from '@/components/seo/structured-data'
import {
  getAllDestinations,
  getDestinationBySlug,
  getDestinationExperiences,
} from '@/lib/payload/destinations'

export const revalidate = 60

export async function generateStaticParams() {
  const destinations = await getAllDestinations()
  return destinations.map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const dest = await getDestinationBySlug(slug)
  if (!dest) return { title: 'Destination not found' }
  return {
    title: dest.title,
    description: dest.blurb,
    alternates: { canonical: `/destinations/${dest.slug}` },
    openGraph: {
      title: dest.title,
      description: dest.blurb,
      url: `/destinations/${dest.slug}`,
      images: dest.image ? [{ url: dest.image.src, alt: dest.image.alt }] : ['/og'],
    },
    twitter: {
      card: 'summary_large_image',
      title: dest.title,
      description: dest.blurb,
      images: [dest.image?.src || '/og'],
    },
  }
}

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const dest = await getDestinationBySlug(slug)
  if (!dest) notFound()

  const experiences = await getDestinationExperiences(slug)

  return (
    <article>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Destinations', path: '/destinations' },
          { name: dest.title, path: `/destinations/${dest.slug}` },
        ])}
      />
      {/* Hero */}
      <div className="relative overflow-hidden text-white" style={{ background: dest.gradient }}>
        {dest.image && (
          <Image
            src={dest.image.src}
            alt={dest.image.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-black/20" />
        <Container className="relative flex min-h-[280px] flex-col justify-end py-8 sm:min-h-[340px]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-white/75">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/destinations" className="hover:text-white">
              Destinations
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-white">{dest.title}</span>
          </nav>
          <div className="mt-auto max-w-2xl">
            <p className="flex items-center gap-1.5 text-sm text-white/85">
              <MapPin className="size-4" /> {dest.region}
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">{dest.title}</h1>
            <p className="mt-3 max-w-xl text-white/85">{dest.blurb}</p>
          </div>
        </Container>
      </div>

      <Container className="py-12 sm:py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold">
            Experiences in {dest.title}
            <span className="ml-2 text-base font-normal text-text-muted">
              ({experiences.length})
            </span>
          </h2>
          <Link
            href="/experiences"
            className="text-sm font-semibold text-brand-link hover:underline"
          >
            All experiences
          </Link>
        </div>

        {experiences.length === 0 ? (
          <div className="rounded-card border border-dashed border-border-strong p-12 text-center">
            <p className="font-semibold text-text-primary">New experiences here are coming soon.</p>
            <ButtonLink href="/custom-trips" variant="outline" className="mt-4">
              Request a custom trip
            </ButtonLink>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map((exp) => (
              <ExperienceCard key={exp.slug} experience={exp} />
            ))}
          </div>
        )}
      </Container>
    </article>
  )
}
