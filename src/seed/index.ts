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
import { DESTINATIONS, EXPERIENCE_TO_DESTINATION } from '../lib/data/destinations'

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

  // ── Destinations (curated hubs) ────────────────────────────
  const destinationIds = new Map<string, number>()
  for (const dest of DESTINATIONS) {
    const found = await payload.find({
      collection: 'destinations',
      where: { slug: { equals: dest.slug } },
      limit: 1,
    })
    const data = {
      title: dest.title,
      slug: dest.slug,
      region: dest.region as never,
      shortDescription: dest.blurb,
      featured: Boolean(dest.featured),
    }
    const doc = found.docs[0]
      ? await payload.update({ collection: 'destinations', id: found.docs[0].id, data })
      : await payload.create({ collection: 'destinations', data })
    destinationIds.set(dest.slug, doc.id)
  }
  payload.logger.info(`Seeded ${destinationIds.size} destinations`)

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

  // ── Remove stale (previously auto-derived) destinations ────
  const curatedSlugs = DESTINATIONS.map((d) => d.slug)
  const stale = await payload.find({
    collection: 'destinations',
    where: { slug: { not_in: curatedSlugs } },
    limit: 100,
  })
  for (const d of stale.docs) {
    await payload.delete({ collection: 'destinations', id: d.id })
  }
  if (stale.totalDocs > 0) payload.logger.info(`Removed ${stale.totalDocs} stale destinations`)

  payload.logger.info('✅ Seed complete')
  process.exit(0)
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
    destination: destinationIds.get(EXPERIENCE_TO_DESTINATION[exp.slug]),
    _status: 'published' as const,
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
