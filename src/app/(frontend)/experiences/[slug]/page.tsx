import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Star,
  MapPin,
  Clock,
  Gauge,
  Check,
  X,
  ChevronRight,
  MessageCircle,
  Backpack,
  Users,
} from 'lucide-react'
import { Container } from '@/components/ui/container'
import { ButtonLink } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExperienceCard } from '@/components/experiences/experience-card'
import { getAllExperiences, getExperienceBySlug } from '@/lib/payload/experiences'
import { gradientFor } from '@/lib/visuals'
import { formatPrice } from '@/lib/format'
import { whatsappLink } from '@/lib/constants'
import { JsonLd, experienceSchema } from '@/components/seo/structured-data'

export const revalidate = 60

export async function generateStaticParams() {
  const experiences = await getAllExperiences()
  return experiences.map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const exp = await getExperienceBySlug(slug)
  if (!exp) return { title: 'Experience not found' }
  return {
    title: exp.name,
    description: exp.blurb,
    openGraph: { title: exp.name, description: exp.blurb, type: 'website' },
  }
}

export default async function ExperienceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const exp = await getExperienceBySlug(slug)
  if (!exp) notFound()

  const all = await getAllExperiences()
  const related = all.filter((e) => e.categorySlug === exp.categorySlug && e.slug !== exp.slug).slice(0, 3)
  const waMessage = `Hi Trivoxo, I'm interested in the ${exp.name}. Could you share availability and next steps?`

  return (
    <article>
      <JsonLd data={experienceSchema(exp)} />
      {/* Hero */}
      <div className="relative overflow-hidden text-white" style={{ background: gradientFor(exp.categorySlug) }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/20" />
        <Container className="relative flex min-h-[340px] flex-col justify-end py-8 sm:min-h-[420px]">
          <Breadcrumbs name={exp.name} />
          <div className="mt-auto max-w-3xl">
            {exp.badge && <Badge tone={exp.badge.toLowerCase()}>{exp.badge}</Badge>}
            <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">{exp.name}</h1>
            <p className="mt-3 max-w-xl text-white/85">{exp.blurb}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/90">
              {exp.rating != null && (
                <span className="flex items-center gap-1.5">
                  <Star className="size-4 fill-brand-secondary text-brand-secondary" />
                  {exp.rating.toFixed(1)}
                  {exp.reviews != null && <span className="text-white/70">({exp.reviews})</span>}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" /> {exp.destination}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" /> {exp.duration}
              </span>
              {exp.difficulty && (
                <span className="flex items-center gap-1.5">
                  <Gauge className="size-4" /> {exp.difficulty}
                </span>
              )}
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Main content */}
          <div className="min-w-0 space-y-10">
            <Section title="Overview">
              <p className="text-text-secondary">{exp.blurb}</p>
              {exp.provisional && (
                <p className="mt-3 rounded-lg bg-brand-secondary-soft px-3 py-2 text-xs text-text-secondary">
                  Some details for this experience are being finalised with Trivoxo.
                </p>
              )}
            </Section>

            {exp.highlights && exp.highlights.length > 0 && (
              <Section title="Highlights">
                <ul className="grid gap-2 sm:grid-cols-2">
                  {exp.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-text-secondary">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand-accent" /> {h}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {exp.itinerary && exp.itinerary.length > 0 && (
              <Section title="Itinerary">
                <ol className="relative space-y-6 border-l border-border pl-6">
                  {exp.itinerary.map((stop, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[27px] top-1 size-3 rounded-full border-2 border-brand-primary bg-background" />
                      {stop.time && <p className="text-xs font-semibold text-brand-link">{stop.time}</p>}
                      <p className="font-semibold text-text-primary">{stop.title}</p>
                      {stop.description && <p className="mt-0.5 text-sm text-text-muted">{stop.description}</p>}
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            {((exp.included && exp.included.length > 0) || (exp.excluded && exp.excluded.length > 0)) && (
              <Section title="What's included">
                <div className="grid gap-6 sm:grid-cols-2">
                  {exp.included && exp.included.length > 0 && (
                    <ul className="space-y-2">
                      {exp.included.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
                          <Check className="mt-0.5 size-4 shrink-0 text-brand-accent" /> {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  {exp.excluded && exp.excluded.length > 0 && (
                    <ul className="space-y-2">
                      {exp.excluded.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-text-muted">
                          <X className="mt-0.5 size-4 shrink-0 text-danger" /> {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Section>
            )}

            <Section title="Good to know">
              <div className="flex flex-wrap gap-3 text-sm">
                <Fact icon={Backpack} label="Bring" value="Comfortable shoes, water, sunscreen" />
                <Fact icon={Users} label="Group" value="Best value for 3+ travellers" />
              </div>
              <p className="mt-4 text-xs text-text-muted">
                Full inclusions, meeting point and cancellation policy are managed per experience in the admin and
                will appear here once configured.
              </p>
            </Section>
          </div>

          {/* Booking card */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-card border border-border bg-surface-elevated p-6 shadow-sm">
              <p className="text-sm text-text-muted">From</p>
              <p className="text-3xl font-semibold text-text-primary">
                {formatPrice(exp.priceFrom)} <span className="text-sm font-normal text-text-muted">/ person</span>
              </p>

              <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
                <Row label="Duration" value={exp.duration} />
                {exp.difficulty && <Row label="Difficulty" value={exp.difficulty} />}
                <Row label="Location" value={exp.destination} />
              </dl>

              <ButtonLink href={`/experiences/${exp.slug}/book`} variant="primary" size="lg" className="mt-5 w-full">
                Book this experience
              </ButtonLink>
              <ButtonLink href={whatsappLink(waMessage)} external variant="outline" className="mt-3 w-full">
                <MessageCircle className="size-4" /> Ask on WhatsApp
              </ButtonLink>
              <p className="mt-3 text-center text-xs text-text-muted">
                No payment now — we confirm availability first.
              </p>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-16 border-t border-border pt-12">
            <h2 className="mb-6 text-2xl font-semibold">Related experiences</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <ExperienceCard key={r.slug} experience={r} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </article>
  )
}

function Breadcrumbs({ name }: { name: string }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-white/75">
      <Link href="/" className="hover:text-white">Home</Link>
      <ChevronRight className="size-3.5" />
      <Link href="/experiences" className="hover:text-white">Experiences</Link>
      <ChevronRight className="size-3.5" />
      <span className="truncate text-white">{name}</span>
    </nav>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-right font-medium text-text-primary">{value}</dd>
    </div>
  )
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Backpack
  label: string
  value: string
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-text-secondary">
      <Icon className="size-4 text-brand-primary" />
      <span className="font-medium text-text-primary">{label}:</span> {value}
    </span>
  )
}
