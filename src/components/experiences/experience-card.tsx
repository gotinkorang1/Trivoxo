import Link from 'next/link'
import { MapPin, Clock, Star, TrendingUp } from 'lucide-react'
import type { Experience } from '@/lib/data/experiences'
import { gradientFor } from '@/lib/visuals'
import { formatFromPrice } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const DIFFICULTY_LABEL: Record<string, string> = {
  Easy: 'Easy',
  Moderate: 'Moderate',
  Challenging: 'Challenging',
}

/** Experience card — answers the six "at a glance" questions from §28. */
export function ExperienceCard({ experience }: { experience: Experience }) {
  const { slug, name, badge, categoryLabel, destination, duration, difficulty, priceFrom, rating, reviews } =
    experience

  return (
    <Link
      href={`/experiences/${slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface-elevated shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
    >
      {/* Media */}
      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: gradientFor(experience.categorySlug) }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          {badge && <Badge tone={badge.toLowerCase()}>{badge}</Badge>}
        </div>
        {difficulty && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/35 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {DIFFICULTY_LABEL[difficulty]}
          </span>
        )}
        <span className="absolute bottom-3 right-3 text-xs font-medium uppercase tracking-wide text-white/85">
          {categoryLabel}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg leading-snug text-text-primary group-hover:text-brand-primary">
            {name}
          </h3>
          {rating != null && (
            <span className="mt-0.5 flex shrink-0 items-center gap-1 text-sm font-medium text-text-secondary">
              <Star className="size-3.5 fill-brand-secondary text-brand-secondary" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" /> {destination}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> {duration}
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">{formatFromPrice(priceFrom)}</p>
            {reviews != null && (
              <p className="text-xs text-text-muted">
                {reviews} review{reviews === 1 ? '' : 's'}
              </p>
            )}
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1 text-sm font-semibold text-brand-primary',
              'transition-transform group-hover:translate-x-0.5',
            )}
          >
            View <TrendingUp className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}
