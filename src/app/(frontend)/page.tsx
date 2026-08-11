import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Bike,
  Building2,
  Check,
  Clock,
  Coins,
  Compass,
  Headphones,
  Landmark,
  Map,
  Mountain,
  MoonStar,
  Quote,
  ShieldCheck,
  Ship,
  Sparkles,
  Star,
  Trees,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { HeroCarousel } from '@/components/home/hero-carousel'
import { ExperienceCard } from '@/components/experiences/experience-card'
import { Button, ButtonLink } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Reveal } from '@/components/ui/reveal'
import { SectionHeading } from '@/components/ui/section-heading'
import { EXPERIENCE_CATEGORIES } from '@/lib/constants'
import type { Destination } from '@/lib/data/destinations'
import type { EventItem } from '@/lib/data/events'
import type { Experience } from '@/lib/data/experiences'
import type { GuideArticle } from '@/lib/data/guide'
import { WHY_TRIVOXO } from '@/lib/data/home-samples'
import { getFeaturedDestinations } from '@/lib/payload/destinations'
import { getUpcomingEvents } from '@/lib/payload/events'
import { getAllExperiences, getFeaturedExperiences } from '@/lib/payload/experiences'
import { getRecentArticles } from '@/lib/payload/guide'
import {
  getOverallVerifiedReviewStats,
  getVerifiedReviews,
  type PublicReview,
  type ReviewStats,
} from '@/lib/payload/reviews'
import { SITE_MEDIA, CORPORATE_IMAGE } from '@/lib/site-media'
import { cn } from '@/lib/utils'
import { EventCard } from '@/components/events/event-card'
import { TurnstileWidget } from '@/components/forms/turnstile-widget'

const ICONS: Record<string, LucideIcon> = {
  Mountain,
  Landmark,
  Bike,
  Trees,
  Ship,
  Sparkles,
  MoonStar,
  Compass,
  ShieldCheck,
  Users,
  Coins,
}

export const revalidate = 60

export default async function HomePage() {
  const [featured, allExperiences, destinations, events, articles, reviews, reviewStats] =
    await Promise.all([
      getFeaturedExperiences(6),
      getAllExperiences(),
      getFeaturedDestinations(6),
      getUpcomingEvents(3),
      getRecentArticles(3),
      getVerifiedReviews(3),
      getOverallVerifiedReviewStats(),
    ])

  return (
    <>
      <HeroCarousel experienceCount={allExperiences.length} />
      <TrustStrip
        experienceCount={allExperiences.length}
        destinationCount={destinations.length}
        reviewStats={reviewStats}
      />
      <Categories />
      <PopularExperiences experiences={featured} />
      <ExploreGhana destinations={destinations} />
      <WhyTrivoxo />
      <CorporateBand />
      <UpcomingEvents events={events} />
      <CustomTrips />
      {reviews.length > 0 && <Reviews reviews={reviews} />}
      <GhanaGuide articles={articles} />
      <Newsletter />
    </>
  )
}

function TrustStrip({
  experienceCount,
  destinationCount,
  reviewStats,
}: {
  experienceCount: number
  destinationCount: number
  reviewStats?: ReviewStats
}) {
  const items = [
    { value: String(experienceCount), label: 'curated experiences' },
    { value: String(destinationCount), label: 'destination hubs' },
    reviewStats
      ? { value: reviewStats.rating.toFixed(1), label: `${reviewStats.count} verified reviews` }
      : { value: '3', label: 'core service areas' },
    { value: '100%', label: 'Ghanaian owned' },
  ]

  return (
    <section
      className="border-b border-border bg-surface-elevated"
      aria-label="Trivoxo at a glance"
    >
      <Container className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
        {items.map((item) => (
          <div key={item.label} className="px-4 py-6 text-center sm:py-7">
            <p className="font-display text-2xl font-semibold text-text-primary sm:text-3xl">
              {item.value}
            </p>
            <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-text-muted">
              {item.label}
            </p>
          </div>
        ))}
      </Container>
    </section>
  )
}

function Categories() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div
        className="absolute -left-32 top-12 size-80 rounded-full bg-brand-secondary-soft blur-3xl"
        aria-hidden="true"
      />
      <Container className="relative">
        <Reveal>
          <SectionHeading
            eyebrow="Find your kind of adventure"
            title="A different Ghana for every traveller"
            description="From summit trails and heritage streets to slow river cruises and the glow of the capital at night."
          />
        </Reveal>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {EXPERIENCE_CATEGORIES.map((category, index) => {
            const Icon = ICONS[category.icon] ?? Compass
            return (
              <Reveal key={category.slug} delay={Math.min(index * 0.045, 0.24)}>
                <Link
                  href={`/experiences?category=${category.slug}`}
                  className="card-lift group relative flex min-h-48 flex-col overflow-hidden rounded-card border border-border bg-surface-elevated p-5 shadow-soft sm:min-h-52 sm:p-6"
                >
                  <span className="absolute right-4 top-3 font-display text-5xl font-semibold text-text-primary/[0.045] transition group-hover:text-brand-primary/10">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-primary-soft text-brand-link transition duration-300 group-hover:rotate-3 group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-brand-navy">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="mt-auto pt-8">
                    <h3 className="font-sans text-base font-bold tracking-normal text-text-primary group-hover:text-brand-link sm:text-lg">
                      {category.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
                      {category.blurb}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-link opacity-0 transition group-hover:opacity-100">
                      Explore{' '}
                      <ArrowRight
                        className="size-3.5 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

function PopularExperiences({ experiences }: { experiences: Experience[] }) {
  return (
    <section className="relative overflow-hidden bg-surface py-20 sm:py-28">
      <div
        className="absolute right-0 top-0 h-48 w-48 rounded-bl-[10rem] bg-brand-primary-soft/70"
        aria-hidden="true"
      />
      <Container className="relative">
        <Reveal>
          <SectionHeading
            eyebrow="Popular right now"
            title="Handpicked journeys, ready to book"
            description="Our most-loved ways to see Ghana — thoughtfully paced, locally guided and easy to join."
            link={{ href: '/experiences', label: 'All experiences' }}
          />
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((experience, index) => (
            <Reveal key={experience.slug} delay={Math.min(index * 0.06, 0.24)}>
              <ExperienceCard experience={experience} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

function ExploreGhana({ destinations }: { destinations: Destination[] }) {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Explore Ghana"
            title="Every region has a different rhythm"
            description="Follow the energy of the city, the pull of the coast or the calm of mountains and rivers."
            link={{ href: '/destinations', label: 'All destinations' }}
          />
        </Reveal>
        <div className="grid auto-rows-[220px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((destination, index) => (
            <Reveal
              key={destination.slug}
              className={cn(
                'h-full',
                index === 0 && 'sm:col-span-2 lg:row-span-2',
                index === 3 && 'lg:col-span-2',
              )}
              delay={Math.min(index * 0.055, 0.22)}
            >
              <Link
                href={`/destinations/${destination.slug}`}
                className="group relative flex h-full flex-col justify-end overflow-hidden rounded-card p-6 text-white shadow-soft"
                style={{ background: destination.gradient }}
              >
                {destination.image && (
                  <Image
                    src={destination.image.src}
                    alt={destination.image.alt}
                    fill
                    sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent transition duration-500 group-hover:from-black/65" />
                <div className="absolute -right-10 -top-10 size-36 rounded-full border border-white/12 transition duration-700 group-hover:scale-125" />
                <Map
                  className="absolute right-5 top-5 size-6 text-white/55 transition duration-300 group-hover:rotate-12 group-hover:text-white"
                  aria-hidden="true"
                />
                <div className="relative">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/80">
                    {destination.region}
                  </p>
                  <h3
                    className={cn(
                      'mt-1 font-display font-semibold text-white',
                      index === 0 ? 'text-3xl sm:text-4xl' : 'text-2xl',
                    )}
                  >
                    {destination.title}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-white/85">
                    Discover{' '}
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

function WhyTrivoxo() {
  return (
    <section className="overflow-hidden bg-brand-navy py-20 text-white sm:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <Reveal className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src={SITE_MEDIA.outdoorGroup.src}
              alt={SITE_MEDIA.outdoorGroup.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover transition duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/18 bg-brand-navy/68 p-5 backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-secondary">
                The Trivoxo promise
              </p>
              <p className="mt-2 font-display text-xl font-semibold text-white">
                Professional planning. Unforgettable moments.
              </p>
            </div>
          </div>
          <div className="animate-float absolute -right-5 -top-6 hidden rounded-2xl bg-brand-secondary px-5 py-4 text-brand-navy shadow-xl sm:block">
            <p className="text-2xl font-black">100%</p>
            <p className="text-xs font-bold uppercase tracking-wider">Locally curated</p>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-secondary">
              <Sparkles className="size-4" aria-hidden="true" /> Why Trivoxo
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              The details are where the magic lives
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
              We combine local knowledge, disciplined coordination and warm Ghanaian hospitality to
              make every experience feel effortless.
            </p>
          </Reveal>

          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {WHY_TRIVOXO.map((item, index) => {
              const Icon = ICONS[item.icon] ?? Compass
              return (
                <Reveal key={item.title} delay={Math.min(index * 0.07, 0.2)}>
                  <div className="group h-full rounded-2xl border border-white/12 bg-white/[0.055] p-5 backdrop-blur-sm transition hover:-translate-y-1 hover:border-brand-primary/60 hover:bg-white/[0.085]">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-primary text-brand-navy">
                      <Icon className="size-4.5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 font-sans text-base font-bold tracking-normal text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/68">{item.body}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </Container>
    </section>
  )
}

function CorporateBand() {
  return (
    <Container className="py-20 sm:py-28">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-[2rem] px-6 py-16 text-white shadow-lift sm:px-12 lg:px-16 lg:py-20">
          <Image
            src={CORPORATE_IMAGE.src}
            alt=""
            fill
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="object-cover object-center transition duration-[1200ms] hover:scale-105"
          />
          <div className="absolute inset-0 -z-0 bg-[linear-gradient(90deg,rgba(7,19,30,.96)_0%,rgba(7,19,30,.83)_52%,rgba(7,19,30,.3)_100%)]" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.17em] text-brand-secondary backdrop-blur-md">
              <Building2 className="size-4" aria-hidden="true" /> Corporate & groups
            </span>
            <h2 className="mt-5 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Bring your team somewhere memorable
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/76 sm:text-lg">
              Retreats, conferences, company outings and complete event coordination — one capable
              team, from first idea to final guest.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/corporate" size="lg">
                Plan a corporate experience <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/contact" variant="glass" size="lg">
                Speak to Trivoxo
              </ButtonLink>
            </div>
          </div>
        </div>
      </Reveal>
    </Container>
  )
}

function UpcomingEvents({ events }: { events: EventItem[] }) {
  return (
    <section className="bg-surface py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Upcoming events"
            title="Save the date. Bring the energy."
            description="Fresh event dates, clearly published — so you always know what is genuinely coming next."
            link={{ href: '/events', label: 'All events' }}
          />
        </Reveal>
        {events.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-3">
            {events.map((event, index) => (
              <Reveal key={event.slug} delay={Math.min(index * 0.08, 0.2)}>
                <EventCard event={event} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal>
            <div className="rounded-card border border-dashed border-border-strong bg-surface-elevated p-8 text-center sm:p-10">
              <p className="font-semibold text-text-primary">
                The next event dates are being planned.
              </p>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-text-secondary">
                Browse past moments in the event archive, or contact the team to hear about the next
                release.
              </p>
              <ButtonLink href="/events" variant="outline" className="mt-5">
                View event archive
              </ButtonLink>
            </div>
          </Reveal>
        )}
      </Container>
    </section>
  )
}

function CustomTrips() {
  const benefits = ['Private pacing', 'Local expertise', 'One dedicated coordinator']

  return (
    <section className="overflow-hidden py-20 sm:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-link">
            <Compass className="size-4" aria-hidden="true" /> Your Ghana. Your way.
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            No two travellers should have the same story
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
            Tell us what lights you up. We will shape the route, pace, stays and experiences around
            your people, interests and budget.
          </p>
          <ul className="mt-7 space-y-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 font-semibold text-text-primary">
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-brand-accent-soft text-brand-accent">
                  <Check className="size-4" aria-hidden="true" />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
          <ButtonLink href="/custom-trips" size="lg" className="mt-9">
            Build my trip <ArrowRight className="size-4" aria-hidden="true" />
          </ButtonLink>
        </Reveal>

        <Reveal className="relative" delay={0.12}>
          <div className="relative ml-auto aspect-[5/4] max-w-2xl overflow-hidden rounded-[2rem] shadow-lift">
            <Image
              src={SITE_MEDIA.airportTransfer.src}
              alt={SITE_MEDIA.airportTransfer.alt}
              fill
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover transition duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 via-transparent to-transparent" />
            <div className="glass-panel absolute bottom-5 left-5 right-5 rounded-2xl p-4 text-white sm:left-auto sm:w-64">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-secondary">
                Tailor-made
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-white">
                From airport hello to final goodbye
              </p>
            </div>
          </div>
          <div className="animate-float-delayed absolute -left-5 top-10 hidden rounded-2xl bg-surface-elevated p-4 text-text-primary shadow-lift sm:block">
            <Headphones className="size-5 text-brand-link" aria-hidden="true" />
            <p className="mt-2 text-sm font-bold">Personal trip support</p>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

function Reviews({ reviews }: { reviews: PublicReview[] }) {
  return (
    <section className="relative overflow-hidden bg-brand-secondary-soft py-20 sm:py-28">
      <div
        className="absolute -right-20 -top-20 font-display text-[18rem] leading-none text-brand-secondary/10"
        aria-hidden="true"
      >
        “
      </div>
      <Container className="relative">
        <Reveal>
          <SectionHeading
            eyebrow="Traveller stories"
            title="The best proof is a trip remembered"
            description="Real impressions from people who explored Ghana with Trivoxo."
          />
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {reviews.map((review, index) => (
            <Reveal key={review.id} delay={Math.min(index * 0.08, 0.2)}>
              <figure className="card-lift relative flex h-full flex-col rounded-card border border-border bg-surface-elevated p-6 shadow-soft sm:p-7">
                <Quote
                  className="absolute right-6 top-6 size-9 text-brand-primary/15"
                  aria-hidden="true"
                />
                <div
                  className="flex gap-0.5 text-brand-secondary"
                  role="img"
                  aria-label={`${review.rating} out of 5 stars`}
                >
                  {Array.from({ length: review.rating }).map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      className="size-4 fill-brand-secondary"
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <blockquote className="mt-5 flex-1 text-base leading-relaxed text-text-secondary">
                  “{review.body}”
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-3 border-t border-border pt-5">
                  <span className="inline-flex size-10 items-center justify-center rounded-full bg-brand-primary font-bold text-brand-navy">
                    {review.authorName.charAt(0)}
                  </span>
                  <span>
                    <strong className="block text-sm text-text-primary">{review.authorName}</strong>
                    <span className="text-xs text-text-muted">
                      Verified{' '}
                      {review.travellerType ? `${review.travellerType} traveller` : 'traveller'}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

function GhanaGuide({ articles }: { articles: GuideArticle[] }) {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Ghana Guide"
            title="Arrive curious. Travel prepared."
            description="Local insight for better weekends, smoother events and more meaningful journeys."
            link={{ href: '/guide', label: 'Read the guide' }}
          />
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {articles.map((article, index) => (
            <Reveal key={article.slug} delay={Math.min(index * 0.08, 0.2)}>
              <Link
                href={`/guide/${article.slug}`}
                className="card-lift group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface-elevated shadow-soft"
              >
                <div
                  className="relative aspect-[16/10] overflow-hidden"
                  style={{ background: article.gradient }}
                >
                  {article.image && (
                    <Image
                      src={article.image.src}
                      alt={article.image.alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
                    {article.categoryLabel}
                  </span>
                  <div className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-white/92 px-3 py-1.5 text-xs font-bold text-brand-navy">
                    <Clock className="size-3.5" aria-hidden="true" /> {article.readMins} min
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="font-display text-xl font-semibold leading-snug text-text-primary group-hover:text-brand-link">
                    {article.title}
                  </h3>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-bold text-brand-link">
                    Read story{' '}
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

function Newsletter() {
  return (
    <Container className="pb-6 pt-4 sm:pb-10">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-brand-primary px-6 py-12 text-brand-navy shadow-lift sm:px-12 sm:py-14 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div
            className="absolute -right-16 -top-28 -z-10 size-72 rounded-full border-[45px] border-brand-secondary/45"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-1/3 -z-10 h-32 w-32 rounded-full bg-white/14 blur-2xl"
            aria-hidden="true"
          />
          <div className="max-w-xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-navy/70">
              The good kind of inbox surprise
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-brand-navy sm:text-4xl">
              Explore more of Ghana
            </h2>
            <p className="mt-3 leading-relaxed text-brand-navy/78">
              New experiences, useful local guides and occasional offers. No clutter.
            </p>
          </div>
          <form
            action="/api/newsletter"
            method="post"
            className="mt-7 w-full max-w-lg space-y-3 lg:mt-0"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="min-h-13 flex-1 rounded-full border border-brand-navy/15 bg-white px-5 text-sm font-medium text-brand-navy shadow-sm outline-none placeholder:text-slate-500 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/25 [color-scheme:light]"
              />
              <Button type="submit" variant="secondary" size="lg">
                Join Trivoxo
              </Button>
            </div>
            <TurnstileWidget
              action="newsletter_subscribe"
              defer
              className="rounded-2xl bg-white/90 p-3 text-brand-navy [&_p]:text-slate-600"
            />
          </form>
        </div>
      </Reveal>
    </Container>
  )
}
