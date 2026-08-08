import Link from 'next/link'
import {
  Search,
  CalendarDays,
  Users,
  Star,
  ArrowRight,
  MapPin,
  Mountain,
  Landmark,
  Bike,
  Trees,
  Ship,
  Sparkles,
  MoonStar,
  Compass,
  ShieldCheck,
  Building2,
  type LucideIcon,
} from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Button, ButtonLink } from '@/components/ui/button'
import { SectionHeading } from '@/components/ui/section-heading'
import { ExperienceCard } from '@/components/experiences/experience-card'
import { BRAND, EXPERIENCE_CATEGORIES } from '@/lib/constants'
import { getFeaturedExperiences } from '@/lib/data/experiences'
import { formatFromPrice, dateParts } from '@/lib/format'
import { HOME_REVIEWS, HOME_GUIDE, WHY_TRIVOXO } from '@/lib/data/home-samples'
import { getFeaturedDestinations } from '@/lib/data/destinations'
import { getUpcomingEvents, eventFromPrice } from '@/lib/data/events'

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
}

export default function HomePage() {
  const featured = getFeaturedExperiences(6)

  return (
    <>
      <Hero />
      <Categories />
      <PopularExperiences experiences={featured} />
      <ExploreGhana />
      <WhyTrivoxo />
      <CorporateBand />
      <UpcomingEvents />
      <CustomTrips />
      <Reviews />
      <GhanaGuide />
      <Newsletter />
    </>
  )
}

/* ── Hero (§12) ─────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-navy text-white">
      {/* Layered gradient stand-in for cinematic Ghana photography/video */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 120% at 15% 10%, rgba(232,93,42,0.55) 0%, transparent 45%), radial-gradient(120% 120% at 90% 20%, rgba(245,177,51,0.4) 0%, transparent 40%), linear-gradient(160deg, #0e1c2b 20%, #10202e 100%)',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(11,22,33,0.4)_100%)]" />
      <Container className="relative py-20 sm:py-28">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-secondary">{BRAND.tagline}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] sm:text-6xl">{BRAND.headline}</h1>
        <p className="mt-5 max-w-xl text-lg text-white/85">{BRAND.description}</p>

        <div className="mt-6 flex items-center gap-2 text-sm text-white/80">
          <span className="flex items-center gap-1">
            <Star className="size-4 fill-brand-secondary text-brand-secondary" /> 4.9
          </span>
          <span className="text-white/50">•</span>
          <span>Loved by 180+ verified travellers</span>
        </div>

        {/* Search (§12) — progressive GET form */}
        <form
          action="/experiences"
          method="get"
          className="mt-10 grid gap-3 rounded-2xl bg-white/95 p-3 text-text-primary shadow-2xl sm:grid-cols-[1.4fr_1fr_0.8fr_auto] sm:items-end"
        >
          <Field label="Where?" icon={MapPin}>
            <input
              name="destination"
              placeholder="Destination"
              className="w-full bg-transparent text-sm outline-none placeholder:text-text-muted"
            />
          </Field>
          <Field label="When?" icon={CalendarDays}>
            <input name="date" type="date" className="w-full bg-transparent text-sm outline-none" />
          </Field>
          <Field label="Travellers" icon={Users}>
            <select name="travellers" defaultValue="2" className="w-full bg-transparent text-sm outline-none">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'traveller' : 'travellers'}
                </option>
              ))}
            </select>
          </Field>
          <Button type="submit" size="lg" className="w-full sm:w-auto">
            <Search className="size-4" /> Find Experiences
          </Button>
        </form>
      </Container>
    </section>
  )
}

function Field({ label, icon: Icon, children }: { label: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 rounded-xl border border-border bg-surface/60 px-3 py-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</span>
      <span className="flex items-center gap-2">
        <Icon className="size-4 text-brand-primary" />
        {children}
      </span>
    </label>
  )
}

/* ── Categories (§13) ───────────────────────────────────────── */
function Categories() {
  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        eyebrow="Find your kind of adventure"
        title="Experiences for every kind of traveller"
        description="From summit trails to slow river cruises and the glow of the capital at night."
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {EXPERIENCE_CATEGORIES.map((cat) => {
          const Icon = ICONS[cat.icon] ?? Compass
          return (
            <Link
              key={cat.slug}
              href={`/experiences?category=${cat.slug}`}
              className="group flex flex-col gap-3 rounded-card border border-border bg-surface-elevated p-5 transition-all hover:-translate-y-1 hover:border-brand-primary hover:shadow-md"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-text-primary group-hover:text-brand-primary">{cat.title}</p>
                <p className="mt-1 text-sm text-text-muted">{cat.blurb}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </Container>
  )
}

/* ── Popular experiences (§14) ──────────────────────────────── */
function PopularExperiences({ experiences }: { experiences: ReturnType<typeof getFeaturedExperiences> }) {
  return (
    <section className="bg-surface py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Popular right now"
          title="Handpicked experiences"
          description="A taste of what travellers are booking across Ghana this season."
          link={{ href: '/experiences', label: 'All experiences' }}
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((exp) => (
            <ExperienceCard key={exp.slug} experience={exp} />
          ))}
        </div>
      </Container>
    </section>
  )
}

/* ── Explore Ghana (§15) ────────────────────────────────────── */
function ExploreGhana() {
  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        eyebrow="Explore Ghana"
        title="Where will you go?"
        link={{ href: '/destinations', label: 'All destinations' }}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {getFeaturedDestinations(6).map((dest) => (
          <Link
            key={dest.slug}
            href={`/destinations/${dest.slug}`}
            className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-card p-5 text-white sm:aspect-[3/2]"
            style={{ background: dest.gradient }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent transition-opacity group-hover:opacity-80" />
            <div className="relative">
              <p className="text-xs uppercase tracking-wide text-white/80">{dest.region}</p>
              <p className="font-display text-xl font-semibold">{dest.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  )
}

/* ── Why Trivoxo (§16) ──────────────────────────────────────── */
function WhyTrivoxo() {
  return (
    <section className="bg-surface py-16 sm:py-20">
      <Container>
        <SectionHeading eyebrow="Why Trivoxo" title="Adventure, done properly" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_TRIVOXO.map((item) => {
            const Icon = ICONS[item.icon] ?? Compass
            return (
              <div key={item.title} className="rounded-card border border-border bg-surface-elevated p-6">
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-brand-accent-soft text-brand-accent">
                  <Icon className="size-5" />
                </span>
                <p className="mt-4 font-semibold text-text-primary">{item.title}</p>
                <p className="mt-2 text-sm text-text-secondary">{item.body}</p>
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

/* ── Corporate band (§17) ───────────────────────────────────── */
function CorporateBand() {
  return (
    <Container className="py-16 sm:py-20">
      <div
        className="relative overflow-hidden rounded-3xl px-8 py-14 text-white sm:px-14"
        style={{ background: 'linear-gradient(120deg, #0e1c2b 0%, #13273a 60%, #1e3350 100%)' }}
      >
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-white/10">
          <Building2 className="size-5" />
        </span>
        <h2 className="mt-5 max-w-xl text-3xl font-semibold">Bring your team somewhere memorable</h2>
        <p className="mt-3 max-w-lg text-white/80">
          Corporate retreats, conferences, company outings and complete event coordination — planned and run
          end to end.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <ButtonLink href="/corporate" variant="primary">
            Plan a Corporate Experience
          </ButtonLink>
          <ButtonLink href="/contact" variant="white">
            Speak to Trivoxo
          </ButtonLink>
        </div>
      </div>
    </Container>
  )
}

/* ── Upcoming events (§18) ──────────────────────────────────── */
function UpcomingEvents() {
  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        eyebrow="Upcoming events"
        title="Tickets & experiences"
        link={{ href: '/events', label: 'All events' }}
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {getUpcomingEvents(3).map((ev) => {
          const { day, month } = dateParts(ev.startsAt)
          return (
            <div
              key={ev.slug}
              className="flex items-center gap-4 rounded-card border border-border bg-surface-elevated p-4"
            >
              <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary">
                <span className="text-xl font-bold leading-none">{day}</span>
                <span className="text-xs font-semibold">{month}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-text-primary">{ev.title}</p>
                <p className="text-sm text-text-muted">
                  {ev.location} · {formatFromPrice(eventFromPrice(ev))}
                </p>
                <Link
                  href={`/events/${ev.slug}`}
                  className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary"
                >
                  Get tickets <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </Container>
  )
}

/* ── Custom trips (§19) ─────────────────────────────────────── */
function CustomTrips() {
  return (
    <section className="bg-surface py-16 sm:py-20">
      <Container className="flex flex-col items-center text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-primary">Your Ghana. Your way.</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">
          Tell us what you enjoy and let Trivoxo design your experience
        </h2>
        <p className="mt-4 max-w-xl text-text-secondary">
          Private groups, multi-day journeys, diaspora returns and executive escapes — built around your
          interests, budget and pace.
        </p>
        <ButtonLink href="/custom-trips" size="lg" className="mt-8">
          Build My Trip <ArrowRight className="size-4" />
        </ButtonLink>
      </Container>
    </section>
  )
}

/* ── Reviews (§20) ──────────────────────────────────────────── */
function Reviews() {
  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        eyebrow="Verified travellers"
        title="What our guests say"
        description="Reviews come only from completed Trivoxo bookings."
      />
      <div className="grid gap-5 sm:grid-cols-3">
        {HOME_REVIEWS.map((r) => (
          <figure key={r.name} className="flex flex-col rounded-card border border-border bg-surface-elevated p-6">
            <div className="flex gap-0.5 text-brand-secondary">
              {Array.from({ length: r.rating }).map((_, i) => (
                <Star key={i} className="size-4 fill-brand-secondary" />
              ))}
            </div>
            <blockquote className="mt-3 flex-1 text-sm text-text-secondary">“{r.body}”</blockquote>
            <figcaption className="mt-4 text-sm font-semibold text-text-primary">
              {r.name} <span className="font-normal text-text-muted">· {r.type}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Container>
  )
}

/* ── Ghana Guide (§21) ──────────────────────────────────────── */
function GhanaGuide() {
  return (
    <section className="bg-surface py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Ghana Guide"
          title="Plan like a local"
          link={{ href: '/guide', label: 'Read the guide' }}
        />
        <div className="grid gap-5 sm:grid-cols-3">
          {HOME_GUIDE.map((post) => (
            <Link
              key={post.slug}
              href={`/guide/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface-elevated"
            >
              <div className="aspect-[16/9]" style={{ background: 'linear-gradient(135deg,#13273a,#1e3350)' }} />
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-primary">{post.category}</p>
                <p className="mt-2 font-display text-lg leading-snug text-text-primary group-hover:text-brand-primary">
                  {post.title}
                </p>
                <p className="mt-auto pt-3 text-xs text-text-muted">{post.readMins} min read</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}

/* ── Newsletter (§23) ───────────────────────────────────────── */
function Newsletter() {
  return (
    <Container className="py-16 sm:py-20">
      <div className="rounded-3xl border border-border bg-surface-elevated px-8 py-12 text-center sm:px-14">
        <h2 className="text-2xl font-semibold sm:text-3xl">Explore more of Ghana</h2>
        <p className="mx-auto mt-3 max-w-md text-text-secondary">
          New experiences, destination guides and special offers — straight to your inbox.
        </p>
        <form action="/api/newsletter" method="post" className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            aria-label="Email address"
            className="h-11 flex-1 rounded-full border border-border-strong bg-background px-5 text-sm outline-none focus:border-brand-primary"
          />
          <Button type="submit">Join Trivoxo</Button>
        </form>
      </div>
    </Container>
  )
}
