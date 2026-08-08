import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { getAllArticles, guideCategories } from '@/lib/payload/guide'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Ghana Guide',
  description: 'Travel planning, destinations, food and culture — plan your Ghana trip like a local.',
}

export default async function GuidePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const [categories, all] = await Promise.all([guideCategories(), getAllArticles()])
  const articles = category
    ? all.filter((a) => a.category === category)
    : [...all].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))

  return (
    <Container className="py-10 sm:py-14">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-link">Ghana Guide</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Plan like a local</h1>
        <p className="mt-2 max-w-2xl text-text-secondary">
          Practical tips, destination know-how and the stories behind the experiences.
        </p>
      </header>

      {/* Category chips */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Chip href="/guide" active={!category} label="All" />
        {categories.map((c) => (
          <Chip key={c.value} href={`/guide?category=${c.value}`} active={category === c.value} label={c.label} />
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/guide/${a.slug}`}
            className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface-elevated transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="aspect-[16/9]" style={{ background: a.gradient }} />
            <div className="flex flex-1 flex-col p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-link">{a.categoryLabel}</p>
              <h2 className="mt-2 font-display text-lg leading-snug text-text-primary group-hover:text-brand-link">
                {a.title}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{a.excerpt}</p>
              <p className="mt-auto flex items-center gap-3 pt-4 text-xs text-text-muted">
                <span>{formatDate(a.publishedAt)}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" /> {a.readMins} min
                </span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  )
}

function Chip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-brand-primary bg-brand-primary text-brand-navy'
          : 'border-border bg-background text-text-secondary hover:border-border-strong',
      )}
    >
      {label}
    </Link>
  )
}
