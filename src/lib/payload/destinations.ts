/**
 * Live destination queries — mirrors src/lib/payload/experiences.ts. Returns
 * the same `Destination` shape as the static module (still the seed's source
 * of truth); `gradient` is a presentation-only value computed from the slug,
 * not stored in the CMS (§8 — placeholder visuals until real photography).
 */
import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Destination } from '@/lib/data/destinations'
import type { Experience } from '@/lib/data/experiences'
import type { Destination as DestinationDoc } from '@/payload-types'
import { gradientForDestination } from '@/lib/visuals'
import { getExperiencesForDestinationId } from './experiences'

function toDestination(doc: DestinationDoc, experienceSlugs: string[] = []): Destination {
  return {
    slug: doc.slug ?? '',
    title: doc.title,
    region: doc.region,
    blurb: doc.shortDescription ?? '',
    gradient: gradientForDestination(doc.slug ?? ''),
    featured: Boolean(doc.featured),
    experienceSlugs,
  }
}

export const getAllDestinations = cache(async (): Promise<Destination[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'destinations',
    where: { _status: { equals: 'published' } },
    limit: 100,
    sort: 'title',
  })
  return Promise.all(
    docs
      .filter((d) => d.slug)
      .map(async (d) => toDestination(d, (await getExperiencesForDestinationId(d.id)).map((e) => e.slug))),
  )
})

export const getDestinationBySlug = cache(async (slug: string): Promise<Destination | undefined> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'destinations',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
  })
  const doc = docs[0]
  if (!doc) return undefined
  const experiences = await getExperiencesForDestinationId(doc.id)
  return toDestination(doc, experiences.map((e) => e.slug))
})

export async function getFeaturedDestinations(limit = 6): Promise<Destination[]> {
  const all = await getAllDestinations()
  const featured = all.filter((d) => d.featured)
  return (featured.length >= limit ? featured : all).slice(0, limit)
}

export async function getDestinationExperiences(slug: string): Promise<Experience[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'destinations',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  const doc = docs[0]
  if (!doc) return []
  return getExperiencesForDestinationId(doc.id)
}
