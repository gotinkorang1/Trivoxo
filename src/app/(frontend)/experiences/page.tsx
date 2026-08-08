import type { Metadata } from 'next'
import Link from 'next/link'
import { SlidersHorizontal, X } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { PageHero } from '@/components/site/page-hero'
import { Button } from '@/components/ui/button'
import { ExperienceCard } from '@/components/experiences/experience-card'
import type { Experience } from '@/lib/data/experiences'
import { getAllExperiences } from '@/lib/payload/experiences'
import { EXPERIENCE_CATEGORIES } from '@/lib/constants'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Find an Experience',
  description: 'Browse curated tours, hikes, cruises and cultural journeys across Ghana.',
}

const DIFFICULTIES = ['Easy', 'Moderate', 'Challenging']

type SP = Record<string, string | undefined>

function applyFilters(experiences: Experience[], sp: SP): Experience[] {
  const q = (sp.q ?? sp.destination ?? '').trim().toLowerCase()
  const category = sp.category
  const destination = sp.destination
  const difficulty = sp.difficulty
  const duration = sp.duration
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined

  let results = experiences.filter((e) => {
    if (category && e.categorySlug !== category) return false
    if (difficulty && e.difficulty !== difficulty) return false
    if (duration && e.duration !== duration) return false
    if (maxPrice != null && !Number.isNaN(maxPrice) && e.priceFrom > maxPrice) return false
    if (destination && !e.destination.toLowerCase().includes(destination.toLowerCase())) {
      // fall through to free-text match below
      if (!q) return false
    }
    if (q) {
      const hay = `${e.name} ${e.destination} ${e.region} ${e.categoryLabel} ${e.blurb}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  switch (sp.sort) {
    case 'price-asc':
      results = [...results].sort((a, b) => a.priceFrom - b.priceFrom)
      break
    case 'price-desc':
      results = [...results].sort((a, b) => b.priceFrom - a.priceFrom)
      break
    case 'rating':
      results = [...results].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      break
    default:
      break
  }
  return results
}

export default async function ExperiencesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const [sp, experiences] = await Promise.all([searchParams, getAllExperiences()])
  const results = applyFilters(experiences, sp)
  const activeCategory = EXPERIENCE_CATEGORIES.find((c) => c.slug === sp.category)
  const hasFilters = Boolean(
    sp.q || sp.category || sp.destination || sp.difficulty || sp.duration || sp.maxPrice || sp.sort,
  )
  const durations = Array.from(new Set(experiences.map((e) => e.duration))).filter(Boolean).sort()
  const destinations = Array.from(new Set(experiences.map((e) => e.destination))).sort()

  return (
    <>
      <PageHero
        eyebrow="Experiences"
        title={activeCategory ? activeCategory.title : 'Find your next Ghana story'}
        description="Browse curated tours, outdoor adventures, culture, cruises and premium escapes across Ghana."
      >
        <p className="inline-flex rounded-full border border-white/18 bg-white/10 px-4 py-2 text-sm font-semibold text-white/82 backdrop-blur-sm">
          {results.length} experience{results.length === 1 ? '' : 's'}
          {activeCategory ? ` in ${activeCategory.title}` : ' across Ghana'}
        </p>
      </PageHero>
      <Container className="py-16 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <FilterSidebar sp={sp} hasFilters={hasFilters} durations={durations} destinations={destinations} />

        <div>
          {results.length === 0 ? (
            <div className="rounded-card border border-dashed border-border-strong p-12 text-center">
              <p className="font-semibold text-text-primary">No experiences match those filters.</p>
              <p className="mt-1 text-sm text-text-muted">Try widening your search.</p>
              <Link href="/experiences" className="mt-4 inline-block text-sm font-semibold text-brand-link">
                Clear all filters
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((exp) => (
                <ExperienceCard key={exp.slug} experience={exp} />
              ))}
            </div>
          )}
        </div>
      </div>
      </Container>
    </>
  )
}

/* Server-rendered GET filter form — works without client JS. */
function FilterSidebar({
  sp,
  hasFilters,
  durations,
  destinations,
}: {
  sp: SP
  hasFilters: boolean
  durations: string[]
  destinations: string[]
}) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <form action="/experiences" method="get" className="space-y-5 rounded-card border border-border bg-surface-elevated p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-semibold text-text-primary">
            <SlidersHorizontal className="size-4" /> Filters
          </span>
          {hasFilters && (
            <Link href="/experiences" className="flex items-center gap-1 text-xs font-medium text-text-muted hover:text-brand-link">
              <X className="size-3" /> Clear
            </Link>
          )}
        </div>

        <FilterField label="Search">
          <input
            name="q"
            defaultValue={sp.q ?? ''}
            placeholder="Name or keyword"
            className="min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-primary"
          />
        </FilterField>

        <FilterSelect name="category" label="Category" value={sp.category}
          options={EXPERIENCE_CATEGORIES.map((c) => ({ value: c.slug, label: c.title }))} />

        <FilterSelect name="destination" label="Destination" value={sp.destination}
          options={destinations.map((d) => ({ value: d, label: d }))} />

        <FilterSelect name="difficulty" label="Difficulty" value={sp.difficulty}
          options={DIFFICULTIES.map((d) => ({ value: d, label: d }))} />

        <FilterSelect name="duration" label="Duration" value={sp.duration}
          options={durations.map((d) => ({ value: d, label: d }))} />

        <FilterField label="Max price (GHS)">
          <input
            name="maxPrice"
            type="number"
            min={0}
            step={100}
            defaultValue={sp.maxPrice ?? ''}
            placeholder="Any"
            className="min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-primary"
          />
        </FilterField>

        <FilterSelect name="sort" label="Sort by" value={sp.sort}
          options={[
            { value: 'price-asc', label: 'Price: low to high' },
            { value: 'price-desc', label: 'Price: high to low' },
            { value: 'rating', label: 'Rating' },
          ]}
          anyLabel="Recommended" />

        <Button type="submit" className="w-full">Apply filters</Button>
      </form>
    </aside>
  )
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</span>
      {children}
    </label>
  )
}

function FilterSelect({
  name,
  label,
  value,
  options,
  anyLabel = 'Any',
}: {
  name: string
  label: string
  value?: string
  options: { value: string; label: string }[]
  anyLabel?: string
}) {
  return (
    <FilterField label={label}>
      <select
        name={name}
        defaultValue={value ?? ''}
        className="min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-primary"
      >
        <option value="">{anyLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FilterField>
  )
}
