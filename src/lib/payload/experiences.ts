/**
 * Live experience queries — reads the `experiences` collection via Payload's
 * local API and shapes the result into the same `Experience` type the static
 * catalogue (src/lib/data/experiences.ts, still the seed's source of truth)
 * already defines, so presentational components (ExperienceCard, the detail
 * page, etc.) need no changes.
 *
 * Only published documents are returned — drafts must not leak to the public
 * site. Wrapped in React's `cache()` so repeated calls within one request
 * (e.g. generateMetadata + the page body) hit Postgres once.
 */
import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Experience, ItineraryStop, Difficulty } from '@/lib/data/experiences'
import type { Experience as ExperienceDoc } from '@/payload-types'

const BADGE_LABEL: Record<string, NonNullable<Experience['badge']>> = {
  bestseller: 'Bestseller',
  new: 'New',
  popular: 'Popular',
  limited: 'Limited',
}

const DIFFICULTY_LABEL: Record<string, Difficulty> = {
  easy: 'Easy',
  moderate: 'Moderate',
  challenging: 'Challenging',
}

function toExperience(doc: ExperienceDoc): Experience | null {
  if (!doc.slug) return null
  const category = typeof doc.category === 'object' && doc.category ? doc.category : null
  const destination = typeof doc.destination === 'object' && doc.destination ? doc.destination : null

  return {
    slug: doc.slug,
    name: doc.title,
    priceFrom: doc.priceFrom,
    destination: destination?.title ?? 'Ghana',
    region: destination?.region ?? 'Other',
    categorySlug: category?.slug ?? '',
    categoryLabel: category?.title ?? 'Experience',
    duration: doc.duration ?? '',
    difficulty: doc.difficulty ? DIFFICULTY_LABEL[doc.difficulty] : undefined,
    rating: doc.rating ?? undefined,
    reviews: doc.reviewCount ?? undefined,
    badge: doc.badge ? BADGE_LABEL[doc.badge] : undefined,
    blurb: doc.shortDescription ?? '',
    highlights: doc.highlights?.map((h) => h.text),
    included: doc.included?.map((h) => h.text),
    excluded: doc.excluded?.map((h) => h.text),
    itinerary: doc.itinerary?.map(
      (s): ItineraryStop => ({ time: s.time ?? undefined, title: s.title, description: s.description ?? undefined }),
    ),
    featured: Boolean(doc.featured),
  }
}

export const getAllExperiences = cache(async (): Promise<Experience[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'experiences',
    where: { _status: { equals: 'published' } },
    depth: 1,
    limit: 500,
    sort: 'title',
  })
  return docs.map(toExperience).filter((e): e is Experience => e !== null)
})

export const getExperienceBySlug = cache(async (slug: string): Promise<Experience | undefined> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'experiences',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    depth: 1,
    limit: 1,
  })
  const doc = docs[0]
  return doc ? (toExperience(doc) ?? undefined) : undefined
})

export async function getFeaturedExperiences(limit = 6): Promise<Experience[]> {
  const all = await getAllExperiences()
  const featured = all.filter((e) => e.featured)
  return (featured.length >= limit ? featured : all).slice(0, limit)
}

/** Used by the destinations data layer to resolve "experiences at this place". */
export const getExperiencesForDestinationId = cache(async (destinationId: number): Promise<Experience[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'experiences',
    where: { destination: { equals: destinationId }, _status: { equals: 'published' } },
    depth: 1,
    limit: 200,
    sort: 'title',
  })
  return docs.map(toExperience).filter((e): e is Experience => e !== null)
})
