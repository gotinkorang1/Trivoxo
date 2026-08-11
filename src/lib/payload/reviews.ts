import { cache } from 'react'
import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import type { Review } from '@/payload-types'

export type PublicReview = {
  id: number
  title: string
  body: string
  rating: number
  authorName: string
  travellerType?: string
  experienceName?: string
  experienceSlug?: string
}

export type ReviewStats = {
  rating: number
  count: number
}

const verifiedReviewWhere: Where = {
  and: [{ status: { equals: 'approved' } }, { verified: { equals: true } }],
}

const getVerifiedReviewDocs = cache(async (): Promise<Review[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'reviews',
    where: verifiedReviewWhere,
    depth: 1,
    limit: 500,
    sort: '-createdAt',
  })
  return docs
})

export async function getVerifiedReviews(limit = 3): Promise<PublicReview[]> {
  const docs = await getVerifiedReviewDocs()
  return docs.slice(0, limit).map((review) => {
    const experience =
      typeof review.experience === 'object' && review.experience ? review.experience : undefined

    return {
      id: review.id,
      title: review.title,
      body: review.body,
      rating: review.rating,
      authorName: review.authorName,
      travellerType: review.travellerType ?? undefined,
      experienceName: experience?.title,
      experienceSlug: experience?.slug ?? undefined,
    }
  })
}

export async function getReviewsForExperienceSlug(
  slug: string,
  limit = 6,
): Promise<PublicReview[]> {
  const docs = await getVerifiedReviewDocs()
  return docs
    .filter((review) => typeof review.experience === 'object' && review.experience?.slug === slug)
    .slice(0, limit)
    .map((review) => {
      const experience =
        typeof review.experience === 'object' && review.experience ? review.experience : undefined
      return {
        id: review.id,
        title: review.title,
        body: review.body,
        rating: review.rating,
        authorName: review.authorName,
        travellerType: review.travellerType ?? undefined,
        experienceName: experience?.title,
        experienceSlug: experience?.slug ?? undefined,
      }
    })
}

export async function getVerifiedReviewStats(): Promise<Map<number, ReviewStats>> {
  const docs = await getVerifiedReviewDocs()
  const totals = new Map<number, { total: number; count: number }>()

  for (const review of docs) {
    const experienceId =
      typeof review.experience === 'object' && review.experience
        ? review.experience.id
        : review.experience
    if (!experienceId) continue
    const current = totals.get(experienceId) ?? { total: 0, count: 0 }
    current.total += review.rating
    current.count += 1
    totals.set(experienceId, current)
  }

  return new Map(
    [...totals].map(([id, stats]) => [
      id,
      { rating: Math.round((stats.total / stats.count) * 10) / 10, count: stats.count },
    ]),
  )
}

export async function getOverallVerifiedReviewStats(): Promise<ReviewStats | undefined> {
  const docs = await getVerifiedReviewDocs()
  if (docs.length === 0) return undefined
  const total = docs.reduce((sum, review) => sum + review.rating, 0)
  return { rating: Math.round((total / docs.length) * 10) / 10, count: docs.length }
}
