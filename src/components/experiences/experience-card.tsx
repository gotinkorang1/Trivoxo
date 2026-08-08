import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, Star, TrendingUp } from 'lucide-react'
import type { Experience } from '@/lib/data/experiences'
import { gradientFor } from '@/lib/visuals'
import { formatFromPrice } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { experienceImage } from '@/lib/site-media'

const DIFFICULTY_LABEL: Record<string, string> = {
  Easy: 'Easy',
  Moderate: 'Moderate',
  Challenging: 'Challenging',
}

/** Experience card — answers the six "at a glance" questions from §28. */
export function ExperienceCard({ experience }: { experience: Experience }) {
  const { slug, name, badge, categoryLabel, destination, duration, difficulty, priceFrom, rating, reviews } =
    experience

  const image = experienceImage(experience.categorySlug)

  return (
    <Link
      href={`/experiences/${slug}`}
      className="card-lift group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface-elevated shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
    >
      {/* Media */}
      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: gradientFor(experience.categorySlug) }}>
        {image && (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          {badge && <Badge tone={badge.toLowerCase()}>{badge}</Badge>}
        </div>
        {difficulty && (
          <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            {DIFFICULTY_LABEL[difficulty]}
          </span>
        )}
        <span className="absolute bottom-3 right-3 text-xs font-bold uppercase tracking-[0.12em] text-white">
          {categoryLabel}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-xl font-semibold leading-snug text-text-primary transition-colors group-hover:text-brand-link">
            {name}
          </h3>
          {rating != null && (
            <span className="mt-0.5 flex shrink-0 items-center gap-1 rounded-full bg-brand-secondary-soft px-2 py-1 text-sm font-bold text-text-primary">
              <Star className="size-3.5 fill-brand-secondary text-brand-secondary" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm font-medium text-text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" /> {destination}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> {duration}
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
          <div>
            <p className="text-base font-bold text-text-primary">{formatFromPrice(priceFrom)}</p>
            {reviews != null && (
              <p className="text-xs text-text-muted">
                {reviews} review{reviews === 1 ? '' : 's'}
              </p>
            )}
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1 text-sm font-bold text-brand-link',
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
