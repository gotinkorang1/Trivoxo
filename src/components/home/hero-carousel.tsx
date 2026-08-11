'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  MapPin,
  Pause,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Compass,
  Users,
} from 'lucide-react'
import { Container } from '@/components/ui/container'
import { ButtonLink } from '@/components/ui/button'
import { SITE_MEDIA } from '@/lib/site-media'
import { cn } from '@/lib/utils'

const SLIDE_INTERVAL = 12000

const SLIDES = [
  {
    eyebrow: 'Experience. Explore. Express.',
    title: 'Experience Ghana the Trivoxo Way',
    description:
      'Immersive tours, seamless events and premium travel support — curated by a Ghanaian team that knows every detail matters.',
    image: SITE_MEDIA.hero,
    imagePosition: 'object-center',
    primary: { href: '/experiences', label: 'Explore experiences' },
    secondary: { href: '/about', label: 'Meet Trivoxo' },
  },
  {
    eyebrow: 'Fresh air. Good people. Open roads.',
    title: 'Find your wild side, close to home',
    description:
      'Ride green trails, discover new routes and reconnect outdoors through safe, well-paced adventures built around your energy.',
    image: SITE_MEDIA.outdoorGroup,
    imagePosition: 'object-center',
    primary: { href: '/experiences?category=cycling', label: 'Find an adventure' },
    secondary: { href: '/custom-trips', label: 'Build a private trip' },
  },
  {
    eyebrow: 'Made for people, not templates.',
    title: 'Journeys that bring people together',
    description:
      'From team retreats to diaspora homecomings, we turn ambitious ideas into smooth, memorable Ghana experiences.',
    image: SITE_MEDIA.groupTravel,
    imagePosition: 'object-center',
    primary: { href: '/corporate', label: 'Plan a group experience' },
    secondary: { href: '/contact', label: 'Talk to our team' },
  },
] as const

export function HeroCarousel({ experienceCount }: { experienceCount: number }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduceMotion = useReducedMotionPreference()
  const slide = SLIDES[active]

  useEffect(() => {
    if (paused || reduceMotion) return

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % SLIDES.length)
    }, SLIDE_INTERVAL)

    return () => window.clearInterval(timer)
  }, [paused, reduceMotion])

  function goTo(index: number) {
    setActive((index + SLIDES.length) % SLIDES.length)
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured Trivoxo experiences"
      className="relative isolate overflow-hidden bg-brand-navy text-white sm:min-h-[790px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false)
      }}
    >
      <div key={slide.image.src} className="absolute inset-0">
        <Image
          src={slide.image.src}
          alt={slide.image.alt}
          fill
          quality={50}
          fetchPriority={active === 0 ? 'high' : 'auto'}
          loading={active === 0 ? 'eager' : 'lazy'}
          sizes="100vw"
          className={cn('hero-ken-burns object-cover', slide.imagePosition)}
        />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,19,30,.97)_0%,rgba(7,19,30,.86)_39%,rgba(7,19,30,.34)_72%,rgba(7,19,30,.2)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,19,30,.24)_0%,transparent_35%,rgba(7,19,30,.76)_100%)]" />
      <div className="soft-grid absolute inset-0 opacity-40 [mask-image:linear-gradient(to_right,black,transparent_70%)]" />
      <div className="animate-float absolute left-[56%] top-28 hidden size-44 rounded-full bg-brand-secondary/15 blur-3xl lg:block" />
      <div className="animate-float-delayed absolute right-8 top-1/3 hidden size-56 rounded-full bg-brand-primary/15 blur-3xl lg:block" />

      <Container className="relative flex flex-col justify-start pb-8 pt-24 sm:min-h-[790px] sm:justify-center sm:pb-44 sm:pt-28">
        <div className="max-w-3xl" aria-live="off">
          <div key={active} className={cn(active > 0 && !reduceMotion && 'hero-content-enter')}>
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-secondary backdrop-blur-md">
                  <Sparkles className="size-3.5" aria-hidden="true" /> {slide.eyebrow}
                </span>
                <span className="hidden items-center gap-2 text-sm font-medium text-white/80 sm:inline-flex">
                  <ShieldCheck className="size-4 text-brand-accent" aria-hidden="true" />{' '}
                  Ghanaian-owned & locally curated
                </span>
              </div>

              <h1 className="max-w-3xl text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.94] tracking-[-0.045em] text-white">
                {slide.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/82 sm:text-xl">
                {slide.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={slide.primary.href} size="lg">
                  {slide.primary.label} <ArrowRight className="size-4" aria-hidden="true" />
                </ButtonLink>
                <ButtonLink href={slide.secondary.href} variant="glass" size="lg">
                  {slide.secondary.label}
                </ButtonLink>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/76">
                <span className="inline-flex items-center gap-1.5">
                  <Compass className="size-4 text-brand-secondary" aria-hidden="true" />
                  <strong className="text-white">{experienceCount}</strong> curated experiences
                </span>
                <span className="h-1 w-1 rounded-full bg-white/40" aria-hidden="true" />
                <span>Tours, events and tailored travel support</span>
              </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 self-end sm:absolute sm:bottom-[9.5rem] sm:right-6 sm:mt-0 lg:right-8">
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-md transition hover:border-white/60 hover:bg-white/15"
            aria-label="Previous featured story"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setPaused((current) => !current)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-md transition hover:border-white/60 hover:bg-white/15"
            aria-label={paused ? 'Play carousel' : 'Pause carousel'}
          >
            {paused ? (
              <Play className="size-4" aria-hidden="true" />
            ) : (
              <Pause className="size-4" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-md transition hover:border-white/60 hover:bg-white/15"
            aria-label="Next featured story"
          >
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 sm:absolute sm:bottom-8 sm:left-6 sm:right-6 sm:mt-0 lg:left-8 lg:right-8">
          <form
            action="/experiences"
            method="get"
            className="mx-auto grid max-w-7xl gap-2 rounded-[1.5rem] border border-white/45 bg-white p-2.5 text-brand-navy shadow-[0_28px_90px_-24px_rgba(0,0,0,.65)] sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_.8fr_auto] lg:items-center"
          >
            <SearchField label="Where do you want to go?" icon={MapPin}>
              <input
                name="destination"
                placeholder="Accra, Volta, Cape Coast..."
                className="min-h-11 w-full bg-transparent text-sm font-medium text-brand-navy outline-none placeholder:text-slate-500"
              />
            </SearchField>
            <SearchField label="When?" icon={CalendarDays}>
              <input
                name="date"
                type="date"
                className="min-h-11 w-full bg-transparent text-sm font-medium text-brand-navy outline-none [color-scheme:light]"
              />
            </SearchField>
            <SearchField label="Travellers" icon={Users}>
              <select
                name="travellers"
                defaultValue="2"
                className="min-h-11 w-full bg-transparent text-sm font-medium text-brand-navy outline-none [color-scheme:light]"
              >
                {[1, 2, 3, 4, 5, 6].map((count) => (
                  <option key={count} value={count}>
                    {count} {count === 1 ? 'traveller' : 'travellers'}
                  </option>
                ))}
              </select>
            </SearchField>
            <button
              type="submit"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-brand-primary px-6 text-sm font-bold text-brand-navy shadow-lg transition hover:-translate-y-0.5 hover:bg-brand-secondary focus-visible:outline-none lg:min-h-16"
            >
              <Search className="size-4" aria-hidden="true" /> Find experiences
            </button>
          </form>
        </div>
      </Container>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/12" aria-hidden="true">
        {!paused && !reduceMotion && (
          <div
            key={`progress-${active}`}
            className="hero-progress h-full origin-left bg-brand-secondary"
            style={{ animationDuration: `${SLIDE_INTERVAL}ms` }}
          />
        )}
      </div>
    </section>
  )
}

function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return reduced
}

function SearchField({
  label,
  icon: Icon,
  children,
}: {
  label: string
  icon: typeof MapPin
  children: React.ReactNode
}) {
  return (
    <label className="flex min-h-14 flex-col justify-center rounded-2xl px-4 py-2 transition hover:bg-slate-100 focus-within:bg-slate-100 focus-within:ring-2 focus-within:ring-brand-primary lg:min-h-16">
      <span className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-slate-600">
        {label}
      </span>
      <span className="flex items-center gap-2.5">
        <Icon className="size-4 shrink-0 text-brand-primary-hover" aria-hidden="true" /> {children}
      </span>
    </label>
  )
}
