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
import { mediaToPublicImage } from '@/lib/media'
import { experienceImageFor } from '@/lib/site-media'
import { getVerifiedReviewStats, type ReviewStats } from '@/lib/payload/reviews'

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

function toExperience(doc: ExperienceDoc, reviewStats?: ReviewStats): Experience | null {
  if (!doc.slug) return null
  const category = typeof doc.category === 'object' && doc.category ? doc.category : null
  const destination =
    typeof doc.destination === 'object' && doc.destination ? doc.destination : null

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
    // Public ratings come only from approved, booking-verified reviews.
    rating: reviewStats?.rating,
    reviews: reviewStats?.count,
    badge: doc.badge ? BADGE_LABEL[doc.badge] : undefined,
    blurb: doc.shortDescription ?? '',
    highlights: doc.highlights?.map((h) => h.text),
    included: doc.included?.map((h) => h.text),
    excluded: doc.excluded?.map((h) => h.text),
    whatToBring: doc.whatToBring?.map((h) => h.text),
    whoFor: doc.whoFor ?? undefined,
    itinerary: doc.itinerary?.map((s): ItineraryStop => ({
      time: s.time ?? undefined,
      title: s.title,
      description: s.description ?? undefined,
    })),
    availabilityType: doc.availabilityType,
    weekdays: doc.weekdays ?? undefined,
    includePublicHolidays: Boolean(doc.includePublicHolidays),
    minGuests: doc.minGuests ?? undefined,
    maxGuests: doc.maxGuests ?? undefined,
    minNoticeHours: doc.minNoticeHours ?? undefined,
    maxAdvanceDays: doc.maxAdvanceDays ?? undefined,
    soldOut: Boolean(doc.soldOut),
    meetingPoint: doc.meetingPoint ?? undefined,
    pickupInfo: doc.pickupInfo ?? undefined,
    activityDetails: doc.activityDetails
      ? {
          distanceKm: doc.activityDetails.distanceKm ?? undefined,
          elevationM: doc.activityDetails.elevationM ?? undefined,
          terrain: doc.activityDetails.terrain ?? undefined,
          fitnessNote: doc.activityDetails.fitnessNote ?? undefined,
          equipmentProvided: doc.activityDetails.equipmentProvided ?? undefined,
          minimumAge: doc.activityDetails.minimumAge ?? undefined,
          mealIncluded: doc.activityDetails.mealIncluded ?? undefined,
        }
      : undefined,
    faqs: doc.faqs?.map((faq) => ({ question: faq.question, answer: faq.answer })),
    heroImage: mediaToPublicImage(doc.heroImage) ?? experienceImageFor(doc.slug),
    gallery: doc.gallery
      ?.map((item) => mediaToPublicImage(item.image))
      .filter((image): image is NonNullable<Experience['heroImage']> => Boolean(image)),
    featured: Boolean(doc.featured),
  }
}

export const getAllExperiences = cache(async (): Promise<Experience[]> => {
  const payload = await getPayload({ config })
  const [{ docs }, reviewStats] = await Promise.all([
    payload.find({
      collection: 'experiences',
      where: { _status: { equals: 'published' } },
      depth: 1,
      limit: 500,
      sort: 'title',
    }),
    getVerifiedReviewStats(),
  ])
  return docs
    .map((doc) => toExperience(doc, reviewStats.get(doc.id)))
    .filter((e): e is Experience => e !== null)
})

export const getExperienceBySlug = cache(async (slug: string): Promise<Experience | undefined> => {
  const payload = await getPayload({ config })
  const [{ docs }, reviewStats] = await Promise.all([
    payload.find({
      collection: 'experiences',
      where: { slug: { equals: slug }, _status: { equals: 'published' } },
      depth: 1,
      limit: 1,
    }),
    getVerifiedReviewStats(),
  ])
  const doc = docs[0]
  return doc ? (toExperience(doc, reviewStats.get(doc.id)) ?? undefined) : undefined
})

export async function getFeaturedExperiences(limit = 6): Promise<Experience[]> {
  const all = await getAllExperiences()
  const featured = all.filter((e) => e.featured)
  return (featured.length >= limit ? featured : all).slice(0, limit)
}

/** Used by the destinations data layer to resolve "experiences at this place". */
export const getExperiencesForDestinationId = cache(
  async (destinationId: number): Promise<Experience[]> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'experiences',
      where: { destination: { equals: destinationId }, _status: { equals: 'published' } },
      depth: 1,
      limit: 200,
      sort: 'title',
    })
    const reviewStats = await getVerifiedReviewStats()
    return docs
      .map((doc) => toExperience(doc, reviewStats.get(doc.id)))
      .filter((e): e is Experience => e !== null)
  },
)
