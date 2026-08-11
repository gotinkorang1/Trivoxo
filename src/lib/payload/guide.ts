/**
 * Live Ghana Guide queries — mirrors src/lib/payload/experiences.ts.
 * `readMins` is computed from the body word count rather than stored, since
 * it's derived, not authored content.
 */
import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { GuideArticle, GuideBlock } from '@/lib/data/guide'
import type { Post as PostDoc } from '@/payload-types'
import { GUIDE_CATEGORIES } from '@/collections/Posts'
import { gradientForSlug } from '@/lib/visuals'
import { mediaToPublicImage } from '@/lib/media'
import { guideImageFor } from '@/lib/site-media'

const CATEGORY_LABEL = new Map(GUIDE_CATEGORIES.map((c) => [c.value, c.label]))

const WORDS_PER_MINUTE = 200

function readMinsFor(body: GuideBlock[], excerpt: string): number {
  const words = [excerpt, ...body.flatMap((b) => [b.heading ?? '', b.text])]
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

function toArticle(doc: PostDoc): GuideArticle | null {
  if (!doc.slug) return null
  const body: GuideBlock[] = doc.body?.map((b) => ({
    heading: b.heading ?? undefined,
    text: b.text,
  })) ?? [{ text: doc.excerpt ?? '' }]

  return {
    slug: doc.slug,
    title: doc.title,
    category: doc.category ?? '',
    categoryLabel: doc.category
      ? (CATEGORY_LABEL.get(doc.category) ?? doc.category)
      : 'Ghana Guide',
    excerpt: doc.excerpt ?? '',
    readMins: readMinsFor(body, doc.excerpt ?? ''),
    publishedAt: doc.publishedAt ?? doc.createdAt,
    gradient: gradientForSlug(doc.slug),
    image: mediaToPublicImage(doc.coverImage) ?? guideImageFor(doc.slug),
    featured: Boolean(doc.featured),
    body,
  }
}

export const getAllArticles = cache(async (): Promise<GuideArticle[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: { _status: { equals: 'published' } },
    depth: 1,
    limit: 200,
  })
  return docs.map(toArticle).filter((a): a is GuideArticle => a !== null)
})

export const getArticleBySlug = cache(async (slug: string): Promise<GuideArticle | undefined> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    depth: 1,
    limit: 1,
  })
  const doc = docs[0]
  return doc ? (toArticle(doc) ?? undefined) : undefined
})

export async function getRecentArticles(limit = 3): Promise<GuideArticle[]> {
  const all = await getAllArticles()
  return [...all]
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, limit)
}

export async function guideCategories(): Promise<{ value: string; label: string }[]> {
  const all = await getAllArticles()
  const seen = new Map<string, string>()
  for (const a of all)
    if (a.category && !seen.has(a.category)) seen.set(a.category, a.categoryLabel)
  return [...seen].map(([value, label]) => ({ value, label }))
}
