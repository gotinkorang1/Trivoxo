/**
 * Seed script — loads the brochure catalogue into Payload.
 *
 *   npm run seed
 *
 * Requires a reachable Postgres (DATABASE_URI) and PAYLOAD_SECRET. Safe to
 * re-run: it upserts by slug/email rather than blindly inserting. It creates a
 * first Super Admin if none exists (credentials from SEED_ADMIN_EMAIL /
 * SEED_ADMIN_PASSWORD, defaulting to admin@trivoxogh.com / changeme123).
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { EXPERIENCE_CATEGORIES } from '../lib/constants'
import { EXPERIENCES, type Experience } from '../lib/data/experiences'

const strings = (values?: string[]) => (values ?? []).map((text) => ({ text }))

async function run() {
  const payload = await getPayload({ config })

  // ── First admin ────────────────────────────────────────────
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@trivoxogh.com'
  const existingAdmins = await payload.find({ collection: 'users', limit: 1 })
  if (existingAdmins.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: {
        name: 'Trivoxo Admin',
        email,
        password: process.env.SEED_ADMIN_PASSWORD || 'changeme123',
        roles: ['super-admin'],
      },
    })
    payload.logger.info(`Created admin user: ${email}`)
  }

  // ── Categories ─────────────────────────────────────────────
  const categoryIds = new Map<string, number>()
  for (const [i, cat] of EXPERIENCE_CATEGORIES.entries()) {
    const found = await payload.find({
      collection: 'experience-categories',
      where: { slug: { equals: cat.slug } },
      limit: 1,
    })
    const data = { title: cat.title, slug: cat.slug, blurb: cat.blurb, icon: cat.icon, order: i }
    const doc = found.docs[0]
      ? await payload.update({ collection: 'experience-categories', id: found.docs[0].id, data })
      : await payload.create({ collection: 'experience-categories', data })
    categoryIds.set(cat.slug, doc.id)
  }
  payload.logger.info(`Seeded ${categoryIds.size} categories`)

  // ── Destinations (derived from the catalogue) ──────────────
  const destinationIds = new Map<string, number>()
  const seenDestinations = new Map<string, { title: string; region: string }>()
  for (const exp of EXPERIENCES) {
    const slug = exp.destination.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    if (!seenDestinations.has(slug)) seenDestinations.set(slug, { title: exp.destination, region: exp.region })
  }
  for (const [slug, { title, region }] of seenDestinations) {
    const found = await payload.find({
      collection: 'destinations',
      where: { slug: { equals: slug } },
      limit: 1,
    })
    const data = { title, slug, region: region as never }
    const doc = found.docs[0]
      ? await payload.update({ collection: 'destinations', id: found.docs[0].id, data })
      : await payload.create({ collection: 'destinations', data })
    destinationIds.set(exp_destinationSlug(title), doc.id)
    destinationIds.set(slug, doc.id)
  }
  payload.logger.info(`Seeded ${seenDestinations.size} destinations`)

  // ── Experiences ────────────────────────────────────────────
  let count = 0
  for (const exp of EXPERIENCES) {
    const data = mapExperience(exp, categoryIds, destinationIds)
    const found = await payload.find({
      collection: 'experiences',
      where: { slug: { equals: exp.slug } },
      limit: 1,
    })
    if (found.docs[0]) {
      await payload.update({ collection: 'experiences', id: found.docs[0].id, data })
    } else {
      await payload.create({ collection: 'experiences', data })
    }
    count++
  }
  payload.logger.info(`Seeded ${count} experiences`)

  payload.logger.info('✅ Seed complete')
  process.exit(0)
}

function exp_destinationSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function mapExperience(
  exp: Experience,
  categoryIds: Map<string, number>,
  destinationIds: Map<string, number>,
) {
  // Dodi Island runs weekends + public holidays only (§36).
  const isDodi = exp.slug === 'volta-wave-rider-dodi-island'
  return {
    title: exp.name,
    slug: exp.slug,
    shortDescription: exp.blurb,
    priceFrom: exp.priceFrom,
    pricingStrategy: 'fixed' as const,
    availabilityType: (isDodi ? 'weekdays' : 'everyday') as 'weekdays' | 'everyday',
    weekdays: isDodi ? (['sat', 'sun'] as ('sat' | 'sun')[]) : undefined,
    includePublicHolidays: isDodi ? true : undefined,
    duration: exp.duration,
    difficulty: (exp.difficulty?.toLowerCase() as 'easy' | 'moderate' | 'challenging' | undefined) ?? undefined,
    badge: (exp.badge?.toLowerCase() as 'bestseller' | 'new' | 'popular' | 'limited' | undefined) ?? undefined,
    featured: Boolean(exp.featured),
    highlights: strings(exp.highlights),
    included: strings(exp.included),
    excluded: strings(exp.excluded),
    itinerary: (exp.itinerary ?? []).map((s) => ({ time: s.time, title: s.title, description: s.description })),
    category: categoryIds.get(exp.categorySlug),
    destination: destinationIds.get(exp_destinationSlug(exp.destination)),
    _status: 'published' as const,
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
