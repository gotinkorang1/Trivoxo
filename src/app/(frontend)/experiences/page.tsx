import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDays, SlidersHorizontal, Users, X } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { PageHero } from '@/components/site/page-hero'
import { Button } from '@/components/ui/button'
import { ExperienceCard } from '@/components/experiences/experience-card'
import { getAllExperiences } from '@/lib/payload/experiences'
import { EXPERIENCE_CATEGORIES } from '@/lib/constants'
import { applyExperienceFilters, type ExperienceFilters } from '@/lib/experience-filters'
import { formatDate } from '@/lib/format'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Find an Experience',
  description: 'Browse curated tours, hikes, cruises and cultural journeys across Ghana.',
}

const DIFFICULTIES = ['Easy', 'Moderate', 'Challenging']
type SP = ExperienceFilters

export default async function ExperiencesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const [filters, experiences] = await Promise.all([searchParams, getAllExperiences()])
  const results = applyExperienceFilters(experiences, filters)
  const activeCategory = EXPERIENCE_CATEGORIES.find(
    (category) => category.slug === filters.category,
  )
  const activeFilters = getActiveFilters(filters)
  const hasFilters = activeFilters.length > 0
  const durations = Array.from(new Set(experiences.map((experience) => experience.duration)))
    .filter(Boolean)
    .sort()
  const destinations = Array.from(
    new Set(experiences.map((experience) => experience.destination)),
  ).sort()
  const hasRatings = experiences.some((experience) => experience.rating != null)

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

      <Container className="py-12 sm:py-16">
        {activeFilters.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2" aria-label="Active filters">
            <span className="mr-1 text-xs font-bold uppercase tracking-wide text-text-muted">
              Showing
            </span>
            {activeFilters.map((filter) => (
              <Link
                key={filter.key}
                href={withoutFilter(filters, filter.key)}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3.5 text-sm font-semibold text-text-secondary transition hover:border-brand-primary hover:text-brand-link"
                aria-label={`Remove ${filter.label} filter`}
              >
                {filter.label} <X className="size-3.5" aria-hidden="true" />
              </Link>
            ))}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <FilterSidebar
            filters={filters}
            hasFilters={hasFilters}
            durations={durations}
            destinations={destinations}
            hasRatings={hasRatings}
          />

          <div>
            {filters.date && (
              <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-brand-accent/25 bg-brand-accent-soft px-4 py-3 text-sm text-text-secondary">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="size-4 text-brand-accent" aria-hidden="true" />
                  Date pattern checked for{' '}
                  <strong className="text-text-primary">{safeFormatDate(filters.date)}</strong>
                </span>
                {filters.travellers && (
                  <span className="inline-flex items-center gap-2">
                    <Users className="size-4 text-brand-accent" aria-hidden="true" />
                    Suitable for{' '}
                    <strong className="text-text-primary">{filters.travellers} travellers</strong>
                  </span>
                )}
                <span className="text-xs text-text-muted">
                  Live seats are confirmed after you choose an experience.
                </span>
              </div>
            )}

            {results.length === 0 ? (
              <div className="rounded-card border border-dashed border-border-strong bg-surface p-10 text-center sm:p-12">
                <p className="font-semibold text-text-primary">
                  No experiences match every selected detail.
                </p>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-text-muted">
                  Try a different date, fewer filters, or ask Trivoxo to build a private option
                  around your group.
                </p>
                <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href="/experiences"
                    className="text-sm font-bold text-brand-link hover:underline"
                  >
                    Clear all filters
                  </Link>
                  <Link
                    href="/custom-trips"
                    className="text-sm font-bold text-brand-link hover:underline"
                  >
                    Request a custom trip
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((experience) => (
                  <ExperienceCard key={experience.slug} experience={experience} />
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  )
}

function FilterSidebar({
  filters,
  hasFilters,
  durations,
  destinations,
  hasRatings,
}: {
  filters: SP
  hasFilters: boolean
  durations: string[]
  destinations: string[]
  hasRatings: boolean
}) {
  const form = (
    <FilterForm
      filters={filters}
      hasFilters={hasFilters}
      durations={durations}
      destinations={destinations}
      hasRatings={hasRatings}
    />
  )

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Experience filters">
      <details className="group rounded-card border border-border bg-surface-elevated shadow-soft lg:hidden">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 font-semibold text-text-primary [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="size-4" aria-hidden="true" /> Filters
          </span>
          <span className="text-sm text-brand-link">
            {hasFilters ? 'Edit filters' : 'Open filters'}
          </span>
        </summary>
        <div className="border-t border-border p-5">{form}</div>
      </details>
      <div className="hidden rounded-card border border-border bg-surface-elevated p-5 shadow-soft lg:block">
        {form}
      </div>
    </aside>
  )
}

function FilterForm({
  filters,
  hasFilters,
  durations,
  destinations,
  hasRatings,
}: {
  filters: SP
  hasFilters: boolean
  durations: string[]
  destinations: string[]
  hasRatings: boolean
}) {
  return (
    <form action="/experiences" method="get" className="space-y-5">
      <div className="hidden items-center justify-between lg:flex">
        <span className="flex items-center gap-2 font-semibold text-text-primary">
          <SlidersHorizontal className="size-4" aria-hidden="true" /> Filters
        </span>
        {hasFilters && (
          <Link
            href="/experiences"
            className="flex min-h-10 items-center gap-1 text-xs font-semibold text-text-muted hover:text-brand-link"
          >
            <X className="size-3" aria-hidden="true" /> Clear
          </Link>
        )}
      </div>

      <FilterField label="Search">
        <input
          name="q"
          defaultValue={filters.q ?? ''}
          placeholder="Name or keyword"
          className={filterControlClass}
        />
      </FilterField>

      <FilterSelect
        name="category"
        label="Category"
        value={filters.category}
        options={EXPERIENCE_CATEGORIES.map((category) => ({
          value: category.slug,
          label: category.title,
        }))}
      />
      <FilterSelect
        name="destination"
        label="Destination"
        value={filters.destination}
        options={destinations.map((destination) => ({ value: destination, label: destination }))}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <FilterField label="Preferred date">
          <input
            name="date"
            type="date"
            defaultValue={filters.date ?? ''}
            className={filterControlClass}
          />
        </FilterField>
        <FilterSelect
          name="travellers"
          label="Travellers"
          value={filters.travellers}
          anyLabel="Any group size"
          options={Array.from({ length: 15 }, (_, index) => {
            const count = index + 1
            return {
              value: String(count),
              label: `${count} ${count === 1 ? 'traveller' : 'travellers'}`,
            }
          })}
        />
      </div>

      <FilterSelect
        name="difficulty"
        label="Difficulty"
        value={filters.difficulty}
        options={DIFFICULTIES.map((difficulty) => ({ value: difficulty, label: difficulty }))}
      />
      <FilterSelect
        name="duration"
        label="Duration"
        value={filters.duration}
        options={durations.map((duration) => ({ value: duration, label: duration }))}
      />

      <FilterField label="Max price (GHS)">
        <input
          name="maxPrice"
          type="number"
          min={0}
          step={100}
          defaultValue={filters.maxPrice ?? ''}
          placeholder="Any budget"
          className={filterControlClass}
        />
      </FilterField>

      <FilterSelect
        name="sort"
        label="Sort by"
        value={filters.sort}
        options={[
          { value: 'price-asc', label: 'Price: low to high' },
          { value: 'price-desc', label: 'Price: high to low' },
          ...(hasRatings ? [{ value: 'rating', label: 'Verified rating' }] : []),
        ]}
        anyLabel="Recommended"
      />

      <Button type="submit" className="w-full">
        Show experiences
      </Button>
    </form>
  )
}

const filterControlClass =
  'min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary'

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </span>
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
      <select name={name} defaultValue={value ?? ''} className={filterControlClass}>
        <option value="">{anyLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FilterField>
  )
}

function getActiveFilters(filters: SP): { key: keyof SP; label: string }[] {
  const labels: Partial<Record<keyof SP, string>> = {
    q: filters.q ? `“${filters.q}”` : undefined,
    category: EXPERIENCE_CATEGORIES.find((category) => category.slug === filters.category)?.title,
    destination: filters.destination,
    date: filters.date ? safeFormatDate(filters.date) : undefined,
    travellers: filters.travellers ? `${filters.travellers} travellers` : undefined,
    difficulty: filters.difficulty,
    duration: filters.duration,
    maxPrice: filters.maxPrice
      ? `Up to GHS ${Number(filters.maxPrice).toLocaleString('en-GH')}`
      : undefined,
    sort:
      filters.sort === 'price-asc'
        ? 'Lowest price first'
        : filters.sort === 'price-desc'
          ? 'Highest price first'
          : filters.sort === 'rating'
            ? 'Best verified rating'
            : undefined,
  }

  return (Object.keys(labels) as (keyof SP)[])
    .filter((key) => Boolean(labels[key]))
    .map((key) => ({ key, label: labels[key] as string }))
}

function withoutFilter(filters: SP, key: keyof SP): string {
  const params = new URLSearchParams()
  for (const [name, value] of Object.entries(filters)) {
    if (name !== key && value) params.set(name, value)
  }
  const query = params.toString()
  return query ? `/experiences?${query}` : '/experiences'
}

function safeFormatDate(value: string): string {
  const date = new Date(`${value}T12:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? value : formatDate(date)
}
