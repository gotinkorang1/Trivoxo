import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowRight,
  Backpack,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Footprints,
  Gauge,
  Languages,
  MapPin,
  MessageCircle,
  Route,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react'
import type { Experience } from '@/lib/data/experiences'
import { AvailabilityCalendar } from '@/components/experiences/availability-calendar'
import { ExperienceCard } from '@/components/experiences/experience-card'
import { GroupPricingTable } from '@/components/experiences/group-pricing'
import { JsonLd, experienceSchema, breadcrumbSchema } from '@/components/seo/structured-data'
import { Badge } from '@/components/ui/badge'
import { ButtonLink } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { getBookingWindow } from '@/lib/availability'
import { whatsappLink } from '@/lib/constants'
import { formatPrice } from '@/lib/format'
import { getAllExperiences, getExperienceBySlug } from '@/lib/payload/experiences'
import { getReviewsForExperienceSlug } from '@/lib/payload/reviews'
import { CANCELLATION, GUIDE_LANGUAGES } from '@/lib/policies'
import { gradientFor } from '@/lib/visuals'

export const revalidate = 60

export async function generateStaticParams() {
  const experiences = await getAllExperiences()
  return experiences.map((experience) => ({ slug: experience.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const experience = await getExperienceBySlug(slug)
  if (!experience) return { title: 'Experience not found' }
  return {
    title: experience.name,
    description: experience.blurb,
    alternates: { canonical: `/experiences/${experience.slug}` },
    openGraph: {
      title: experience.name,
      description: experience.blurb,
      type: 'website',
      url: `/experiences/${experience.slug}`,
      images: experience.heroImage
        ? [{ url: experience.heroImage.src, alt: experience.heroImage.alt }]
        : ['/og'],
    },
    twitter: {
      card: 'summary_large_image',
      title: experience.name,
      description: experience.blurb,
      images: [experience.heroImage?.src || '/og'],
    },
  }
}

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const experience = await getExperienceBySlug(slug)
  if (!experience) notFound()

  const [all, reviews] = await Promise.all([
    getAllExperiences(),
    getReviewsForExperienceSlug(slug),
  ])
  const related = all
    .filter(
      (item) => item.categorySlug === experience.categorySlug && item.slug !== experience.slug,
    )
    .slice(0, 3)
  const availabilityRules = {
    availabilityType: experience.availabilityType,
    weekdays: experience.weekdays,
    minNoticeHours: experience.minNoticeHours,
    maxAdvanceDays: experience.maxAdvanceDays,
    soldOut: experience.soldOut,
  }
  const bookingWindow = getBookingWindow(availabilityRules)
  const bookingHref = `/experiences/${experience.slug}/book`
  const waMessage = `Hi Trivoxo, I'm interested in ${experience.name}. Could you share availability and next steps?`

  return (
    <article className="pb-24 lg:pb-0">
      <JsonLd data={experienceSchema(experience)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Experiences', path: '/experiences' },
          { name: experience.name, path: `/experiences/${experience.slug}` },
        ])}
      />

      <header className="relative overflow-hidden bg-brand-navy text-white">
        <div className="soft-grid absolute inset-0 opacity-40" />
        <div className="absolute -left-24 top-12 size-80 rounded-full bg-brand-primary/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 size-96 rounded-full bg-brand-secondary/10 blur-3xl" />
        <Container className="relative py-7 sm:py-10 lg:py-14">
          <Breadcrumbs name={experience.name} />

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(480px,1.1fr)]">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                {experience.badge && (
                  <Badge tone={experience.badge.toLowerCase()}>{experience.badge}</Badge>
                )}
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-secondary">
                  {experience.categoryLabel}
                </span>
              </div>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.04] text-white sm:text-6xl">
                {experience.name}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/78 sm:text-lg">
                {experience.blurb}
              </p>

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/85">
                {experience.rating != null && (
                  <span className="flex items-center gap-2">
                    <Star className="size-4 fill-brand-secondary text-brand-secondary" />
                    <strong className="text-white">{experience.rating.toFixed(1)}</strong>
                    {experience.reviews != null && (
                      <span className="text-white/60">({experience.reviews} reviews)</span>
                    )}
                  </span>
                )}
                <Meta icon={MapPin}>{experience.destination}</Meta>
                <Meta icon={Clock}>{experience.duration || 'Duration on request'}</Meta>
                {experience.difficulty && <Meta icon={Gauge}>{experience.difficulty}</Meta>}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ButtonLink href="#availability" variant="white" size="lg">
                  Check dates <CalendarDays className="size-4" />
                </ButtonLink>
                <ButtonLink href={whatsappLink(waMessage)} external variant="glass" size="lg">
                  <MessageCircle className="size-4" /> Ask Trivoxo
                </ButtonLink>
              </div>
            </div>

            <ExperienceVisual experience={experience} />
          </div>
        </Container>
      </header>

      <nav
        aria-label="On this page"
        style={{ top: 'var(--header-h, 4.5rem)' }}
        className="sticky z-30 border-b border-border bg-background/92 shadow-sm backdrop-blur-xl"
      >
        <Container className="flex gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            ['Overview', '#overview'],
            experience.itinerary?.length ? ['Itinerary', '#itinerary'] : undefined,
            experience.included?.length || experience.excluded?.length
              ? ['Inclusions', '#inclusions']
              : undefined,
            ['Dates', '#availability'],
            ['Good to know', '#good-to-know'],
          ]
            .filter((item): item is string[] => Boolean(item))
            .map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="min-h-10 shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold text-text-secondary transition hover:bg-surface hover:text-brand-link"
              >
                {label}
              </Link>
            ))}
        </Container>
      </nav>

      <Container className="py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_370px] xl:gap-16">
          <div className="min-w-0 space-y-16">
            <ContentSection id="overview" eyebrow="The experience" title="A closer look">
              <p className="max-w-3xl text-lg leading-8 text-text-secondary">{experience.blurb}</p>
              {experience.provisional && (
                <p className="mt-4 rounded-2xl border border-brand-secondary/30 bg-brand-secondary-soft px-4 py-3 text-sm text-text-secondary">
                  Some trip details are still being finalised. Trivoxo will confirm them before
                  payment.
                </p>
              )}

              {experience.highlights && experience.highlights.length > 0 && (
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {experience.highlights.map((highlight, index) => (
                    <div
                      key={highlight}
                      className="flex items-start gap-3 rounded-2xl border border-border bg-surface-elevated p-4 transition hover:border-brand-primary/50 hover:shadow-soft"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-xs font-bold text-brand-link">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="pt-1 text-sm font-semibold leading-6 text-text-primary">
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {experience.whoFor && (
                <div className="mt-8 rounded-card bg-brand-navy p-6 text-white sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-secondary">
                    Designed for you
                  </p>
                  <p className="mt-3 text-base leading-7 text-white/80">{experience.whoFor}</p>
                </div>
              )}
            </ContentSection>

            {experience.itinerary && experience.itinerary.length > 0 && (
              <ContentSection id="itinerary" eyebrow="Your route" title="How the day unfolds">
                <ol className="mt-2">
                  {experience.itinerary.map((stop, index) => (
                    <li
                      key={`${stop.title}-${index}`}
                      className="group relative grid grid-cols-[52px_1fr] gap-4 pb-8 last:pb-0"
                    >
                      {index < experience.itinerary!.length - 1 && (
                        <span className="absolute bottom-0 left-[25px] top-12 w-px bg-border group-hover:bg-brand-primary/40" />
                      )}
                      <span className="relative z-10 flex size-[52px] items-center justify-center rounded-2xl border border-border bg-surface-elevated font-display text-lg text-brand-link shadow-sm">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="rounded-2xl border border-border bg-surface-elevated p-5 transition group-hover:border-brand-primary/40 group-hover:shadow-soft">
                        {stop.time && (
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-link">
                            {stop.time}
                          </p>
                        )}
                        <h3 className="mt-1 text-lg font-semibold">{stop.title}</h3>
                        {stop.description && (
                          <p className="mt-2 text-sm leading-6 text-text-secondary">
                            {stop.description}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-text-muted">
                  <Route className="mt-0.5 size-4 shrink-0 text-brand-link" /> The order and timing
                  may adjust for traffic, weather, or attraction operations. Trivoxo will
                  communicate material changes.
                </p>
              </ContentSection>
            )}

            {((experience.included && experience.included.length > 0) ||
              (experience.excluded && experience.excluded.length > 0)) && (
              <ContentSection
                id="inclusions"
                eyebrow="Clear from the start"
                title="What your package covers"
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <InclusionList title="Included" items={experience.included ?? []} included />
                  <InclusionList title="Not included" items={experience.excluded ?? []} />
                </div>
              </ContentSection>
            )}

            <ContentSection
              id="availability"
              eyebrow="Plan your day"
              title="Choose your preferred date"
            >
              <p className="mb-7 max-w-2xl text-text-secondary">
                Select a date that follows this experience’s normal operating pattern. Your request
                is only confirmed after Trivoxo checks capacity and sends payment instructions.
              </p>
              <AvailabilityCalendar
                slug={experience.slug}
                minDate={bookingWindow.minDate}
                maxDate={bookingWindow.maxDate}
                availabilityType={experience.availabilityType}
                weekdays={experience.weekdays}
                minNoticeHours={experience.minNoticeHours}
                soldOut={experience.soldOut}
                includePublicHolidays={experience.includePublicHolidays}
              />
            </ContentSection>

            <ContentSection
              id="good-to-know"
              eyebrow="Prepare with confidence"
              title="Good to know before you go"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard icon={Backpack} title="What to bring">
                  {experience.whatToBring?.length
                    ? experience.whatToBring.join(' • ')
                    : 'Comfortable shoes, water, sun protection, and any personal medication.'}
                </InfoCard>
                <InfoCard icon={Users} title="Group size">
                  Minimum {experience.minGuests ?? 2} travellers. Up to {experience.maxGuests ?? 15}{' '}
                  can request online; larger groups should ask for a tailored quote.
                </InfoCard>
                <InfoCard icon={MapPin} title="Meeting & pickup">
                  {experience.meetingPoint ||
                    experience.pickupInfo ||
                    'Pickup details are agreed after Trivoxo confirms the request.'}
                </InfoCard>
                <InfoCard icon={Languages} title="Guide language">
                  {GUIDE_LANGUAGES.default}. {GUIDE_LANGUAGES.onRequest.join(', ')} can be requested
                  at least {GUIDE_LANGUAGES.advanceNoticeDays} days ahead.
                </InfoCard>
                <InfoCard icon={ShieldCheck} title="Flexible planning">
                  Free cancellation more than {CANCELLATION.dayTour.freeHours} hours before a day
                  tour. See the full policy for exceptions.
                </InfoCard>
                <InfoCard icon={Sparkles} title="Private options">
                  Want a different pace, pickup, or route? Request a private version and Trivoxo
                  will tailor the details.
                </InfoCard>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <ButtonLink href="/cancellation-policy" variant="outline" size="sm">
                  Read cancellation policy
                </ButtonLink>
                <ButtonLink href={whatsappLink(waMessage)} external variant="ghost" size="sm">
                  Ask a specific question <ArrowRight className="size-4" />
                </ButtonLink>
              </div>
            </ContentSection>

            {experience.faqs && experience.faqs.length > 0 && (
              <ContentSection id="faqs" eyebrow="Quick answers" title="Frequently asked questions">
                <div className="divide-y divide-border rounded-card border border-border bg-surface-elevated px-5 sm:px-7">
                  {experience.faqs.map((faq) => (
                    <details key={faq.question} className="group py-5">
                      <summary className="cursor-pointer list-none pr-8 font-semibold text-text-primary marker:content-none">
                        {faq.question}
                      </summary>
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </ContentSection>
            )}

            {reviews.length > 0 && (
              <ContentSection id="reviews" eyebrow="Verified travellers" title="What guests say">
                <div className="grid gap-4 sm:grid-cols-2">
                  {reviews.map((review) => (
                    <figure
                      key={review.id}
                      className="flex flex-col rounded-card border border-border bg-surface-elevated p-5"
                    >
                      <div className="flex gap-0.5 text-brand-secondary" aria-label={`${review.rating} out of 5`}>
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="size-4 fill-brand-secondary" />
                        ))}
                      </div>
                      {review.title && (
                        <p className="mt-3 font-semibold text-text-primary">{review.title}</p>
                      )}
                      <blockquote className="mt-1 flex-1 text-sm leading-6 text-text-secondary">
                        “{review.body}”
                      </blockquote>
                      <figcaption className="mt-4 text-sm font-semibold text-text-primary">
                        {review.authorName}
                        {review.travellerType && (
                          <span className="font-normal capitalize text-text-muted">
                            {' '}
                            · {review.travellerType}
                          </span>
                        )}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </ContentSection>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 overflow-hidden rounded-card border border-border bg-surface-elevated shadow-lift">
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-text-muted">
                  From
                </p>
                <p className="mt-1 text-3xl font-semibold text-text-primary">
                  {formatPrice(experience.priceFrom)}{' '}
                  <span className="text-sm font-normal text-text-muted">/ person</span>
                </p>
                <p className="mt-2 text-xs text-text-muted">
                  Base rate for two travellers. Group savings apply automatically.
                </p>

                <dl className="mt-5 space-y-3 border-y border-border py-5 text-sm">
                  <Row label="Duration" value={experience.duration || 'On request'} />
                  {experience.difficulty && (
                    <Row label="Difficulty" value={experience.difficulty} />
                  )}
                  <Row label="Destination" value={experience.destination} />
                  <Row label="Booking notice" value={`${experience.minNoticeHours ?? 24}+ hours`} />
                </dl>

                <ButtonLink
                  href={experience.soldOut ? whatsappLink(waMessage) : bookingHref}
                  external={experience.soldOut}
                  variant={experience.soldOut ? 'outline' : 'primary'}
                  size="lg"
                  className="mt-5 w-full"
                >
                  {experience.soldOut ? 'Join the waitlist' : 'Request this experience'}
                </ButtonLink>
                <ButtonLink href="#availability" variant="outline" className="mt-3 w-full">
                  <CalendarDays className="size-4" /> View dates
                </ButtonLink>
                <p className="mt-4 text-center text-xs leading-5 text-text-muted">
                  No payment now. Availability and final price are confirmed first.
                </p>
              </div>
              <div className="border-t border-border bg-surface p-6">
                <GroupPricingTable baseFrom={experience.priceFrom} />
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-20 border-t border-border pt-14">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-link">
                  Keep exploring
                </p>
                <h2 className="mt-2 text-3xl font-semibold">You may also enjoy</h2>
              </div>
              <ButtonLink href="/experiences" variant="ghost" className="hidden sm:inline-flex">
                All experiences <ArrowRight className="size-4" />
              </ButtonLink>
            </div>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ExperienceCard key={item.slug} experience={item} />
              ))}
            </div>
          </section>
        )}
      </Container>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface-elevated/96 px-4 py-3 shadow-[0_-18px_40px_-24px_rgb(var(--shadow-rgb)/.7)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <div>
            <p className="text-xs text-text-muted">From</p>
            <p className="font-bold text-text-primary">
              {formatPrice(experience.priceFrom)} / person
            </p>
          </div>
          <ButtonLink
            href={experience.soldOut ? whatsappLink(waMessage) : bookingHref}
            external={experience.soldOut}
            variant={experience.soldOut ? 'outline' : 'primary'}
          >
            {experience.soldOut ? 'Ask Trivoxo' : 'Request to book'}
          </ButtonLink>
        </div>
      </div>
    </article>
  )
}

function ExperienceVisual({ experience }: { experience: Experience }) {
  return (
    <div className="relative min-h-[340px] overflow-hidden rounded-[2rem] border border-white/15 shadow-2xl sm:min-h-[440px]">
      {experience.heroImage ? (
        <Image
          src={experience.heroImage.src}
          alt={experience.heroImage.alt}
          fill
          priority
          sizes="(min-width: 1024px) 52vw, 100vw"
          className="object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: gradientFor(experience.categorySlug) }}
        >
          <div className="soft-grid absolute inset-0 opacity-60" />
          <div className="absolute -right-16 -top-12 size-64 rounded-full border-[42px] border-white/8" />
          <div className="absolute -bottom-20 -left-16 size-80 rounded-full border-[58px] border-brand-secondary/15" />
          <div className="absolute inset-x-8 bottom-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/60">
              Curated in Ghana
            </p>
            <p className="mt-2 font-display text-5xl text-white/95 sm:text-7xl">
              {experience.destination}
            </p>
          </div>
        </div>
      )}
      <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/20 bg-brand-navy/60 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">
        <Footprints className="size-4 text-brand-secondary" /> Experience Ghana the Trivoxo Way
      </div>
      <div className="absolute bottom-5 right-5 rounded-2xl border border-white/20 bg-white/12 p-4 text-white backdrop-blur-xl">
        <p className="text-xs text-white/65">Starting from</p>
        <p className="mt-1 text-xl font-bold">{formatPrice(experience.priceFrom)}</p>
      </div>
    </div>
  )
}

function Breadcrumbs({ name }: { name: string }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-white/65">
      <Link href="/" className="rounded-sm hover:text-white">
        Home
      </Link>
      <ChevronRight className="size-3.5" />
      <Link href="/experiences" className="rounded-sm hover:text-white">
        Experiences
      </Link>
      <ChevronRight className="size-3.5" />
      <span className="truncate text-white">{name}</span>
    </nav>
  )
}

function ContentSection({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-32">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-link">{eyebrow}</p>
      <h2 className="mb-6 mt-2 text-3xl font-semibold sm:text-4xl">{title}</h2>
      {children}
    </section>
  )
}

function InclusionList({
  title,
  items,
  included = false,
}: {
  title: string
  items: string[]
  included?: boolean
}) {
  return (
    <div
      className={
        included
          ? 'rounded-card border border-brand-accent/25 bg-brand-accent-soft p-6'
          : 'rounded-card border border-border bg-surface p-6'
      }
    >
      <h3 className="flex items-center gap-2 text-xl font-semibold">
        <span
          className={
            included
              ? 'flex size-8 items-center justify-center rounded-full bg-brand-accent text-white'
              : 'flex size-8 items-center justify-center rounded-full bg-surface-strong text-danger'
          }
        >
          {included ? <Check className="size-4" /> : <X className="size-4" />}
        </span>
        {title}
      </h3>
      {items.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm leading-6 text-text-secondary">
              {included ? (
                <Check className="mt-1 size-4 shrink-0 text-brand-accent" />
              ) : (
                <X className="mt-1 size-4 shrink-0 text-danger" />
              )}
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-text-muted">Trivoxo will confirm this before payment.</p>
      )}
    </div>
  )
}

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Backpack
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-elevated p-5">
      <span className="flex size-10 items-center justify-center rounded-2xl bg-brand-primary-soft text-brand-link">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 font-sans text-base font-bold tracking-normal">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{children}</p>
    </div>
  )
}

function Meta({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <Icon className="size-4 text-brand-secondary" /> {children}
    </span>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-right font-semibold text-text-primary">{value}</dd>
    </div>
  )
}
