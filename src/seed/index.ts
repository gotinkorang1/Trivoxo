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
import { EVENTS } from '../lib/data/events'
import { GUIDE_ARTICLES } from '../lib/data/guide'
import { CONTENT_PAGE_STUBS } from '../lib/data/legal'
import { GROUP_DISCOUNT_TIERS, perPersonPrice, CAPACITY } from '../lib/policies'

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
      _status: 'published' as const,
    }
    const doc = found.docs[0]
      ? await payload.update({ collection: 'destinations', id: found.docs[0].id, data })
      : await payload.create({ collection: 'destinations', data })
    destinationIds.set(dest.slug, doc.id)
  }
  payload.logger.info(`Seeded ${destinationIds.size} destinations`)

  // ── Experiences ────────────────────────────────────────────
  let count = 0
  const experienceIds = new Map<string, number>()
  for (const exp of EXPERIENCES) {
    const data = mapExperience(exp, categoryIds, destinationIds)
    const found = await payload.find({
      collection: 'experiences',
      where: { slug: { equals: exp.slug } },
      limit: 1,
    })
    const doc = found.docs[0]
      ? await payload.update({ collection: 'experiences', id: found.docs[0].id, data })
      : await payload.create({ collection: 'experiences', data })
    experienceIds.set(exp.slug, doc.id)
    count++
  }
  payload.logger.info(`Seeded ${count} experiences`)

  // Date-only placeholders: official departure times are still awaiting input
  // from Trivoxo, so staff can confirm or edit each time from the admin.
  let departureCount = 0
  for (const exp of EXPERIENCES) {
    const experience = experienceIds.get(exp.slug)
    if (!experience) continue
    for (const date of nextEligibleSaturdays(4)) {
      const startsAt = `${date}T12:00:00.000Z`
      const inventoryKey = `${experience}:${startsAt}`
      const existing = await payload.find({
        collection: 'departures',
        depth: 0,
        limit: 1,
        where: { inventoryKey: { equals: inventoryKey } },
      })
      if (!existing.docs[0]) {
        await payload.create({
          collection: 'departures',
          data: {
            experience,
            startsAt,
            timeConfirmed: false,
            capacity: CAPACITY.maxGuests,
            status: 'scheduled',
            autoCreated: true,
            dateKey: date,
            inventoryKey,
          },
        })
      }
      departureCount++
    }
  }
  payload.logger.info(`Ensured ${departureCount} upcoming departure dates`)

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

  // ── Events ─────────────────────────────────────────────────
  let eventCount = 0
  for (const ev of EVENTS) {
    const found = await payload.find({
      collection: 'events',
      where: { slug: { equals: ev.slug } },
      limit: 1,
    })
    const data = {
      title: ev.title,
      slug: ev.slug,
      shortDescription: ev.blurb,
      startsAt: ev.startsAt,
      endsAt: ev.endsAt,
      venue: ev.venue,
      location: ev.location,
      about: ev.about,
      highlights: strings(ev.whatToExpect),
      included: strings(ev.included),
      featured: Boolean(ev.featured),
      ticketTypes: ev.ticketTypes.map((t) => ({
        name: t.name,
        price: t.price,
        quantity: t.quantity,
        perOrderLimit: t.perOrderLimit,
        soldOut: Boolean(t.soldOut),
      })),
      _status: 'published' as const,
    }
    if (found.docs[0]) {
      await payload.update({ collection: 'events', id: found.docs[0].id, data })
    } else {
      await payload.create({ collection: 'events', data })
    }
    eventCount++
  }
  payload.logger.info(`Seeded ${eventCount} events`)
  const staleEvents = await payload.find({
    collection: 'events',
    where: { slug: { not_in: EVENTS.map((e) => e.slug) } },
    limit: 100,
  })
  for (const d of staleEvents.docs) await payload.delete({ collection: 'events', id: d.id })
  if (staleEvents.totalDocs > 0)
    payload.logger.info(`Removed ${staleEvents.totalDocs} stale events`)

  // ── Ghana Guide posts ──────────────────────────────────────
  let postCount = 0
  for (const a of GUIDE_ARTICLES) {
    const found = await payload.find({
      collection: 'posts',
      where: { slug: { equals: a.slug } },
      limit: 1,
    })
    const data = {
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      category: a.category as never,
      publishedAt: a.publishedAt,
      featured: Boolean(a.featured),
      body: a.body.map((b) => ({ heading: b.heading, text: b.text })),
      _status: 'published' as const,
    }
    if (found.docs[0]) {
      await payload.update({ collection: 'posts', id: found.docs[0].id, data })
    } else {
      await payload.create({ collection: 'posts', data })
    }
    postCount++
  }
  payload.logger.info(`Seeded ${postCount} guide posts`)
  const stalePosts = await payload.find({
    collection: 'posts',
    where: { slug: { not_in: GUIDE_ARTICLES.map((a) => a.slug) } },
    limit: 100,
  })
  for (const d of stalePosts.docs) await payload.delete({ collection: 'posts', id: d.id })
  if (stalePosts.totalDocs > 0) payload.logger.info(`Removed ${stalePosts.totalDocs} stale posts`)

  // ── Content pages (About, Contact, Safety, FAQ, legal) ─────
  let pageCount = 0
  for (const p of CONTENT_PAGE_STUBS) {
    const found = await payload.find({
      collection: 'pages',
      where: { slug: { equals: p.slug } },
      limit: 1,
    })
    const data = {
      title: p.title,
      slug: p.slug,
      subtitle: p.subtitle,
      _status: 'published' as const,
    }
    if (found.docs[0]) {
      await payload.update({ collection: 'pages', id: found.docs[0].id, data })
    } else {
      await payload.create({ collection: 'pages', data })
    }
    pageCount++
  }
  payload.logger.info(`Seeded ${pageCount} content pages`)

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
    // Tiered group pricing from the agreed ladder (§32, §33).
    pricingStrategy: 'tiered' as const,
    priceTiers: GROUP_DISCOUNT_TIERS.map((t) => ({
      minGuests: t.minGuests,
      maxGuests: t.maxGuests ?? undefined,
      pricePerPerson: t.requestQuote ? undefined : perPersonPrice(exp.priceFrom, t.minGuests),
      requestQuote: Boolean(t.requestQuote),
    })),
    minGuests: CAPACITY.minGuests,
    maxGuests: CAPACITY.maxGuests,
    minNoticeHours: CAPACITY.minNoticeHours,
    maxAdvanceDays: CAPACITY.maxAdvanceDays,
    availabilityType: (isDodi ? 'weekdays' : 'everyday') as 'weekdays' | 'everyday',
    weekdays: isDodi ? (['sat', 'sun'] as ('sat' | 'sun')[]) : undefined,
    includePublicHolidays: isDodi ? true : undefined,
    duration: exp.duration,
    difficulty:
      (exp.difficulty?.toLowerCase() as 'easy' | 'moderate' | 'challenging' | undefined) ??
      undefined,
    badge:
      (exp.badge?.toLowerCase() as 'bestseller' | 'new' | 'popular' | 'limited' | undefined) ??
      undefined,
    featured: Boolean(exp.featured),
    highlights: strings(exp.highlights),
    included: strings(exp.included),
    excluded: strings(exp.excluded),
    itinerary: (exp.itinerary ?? []).map((s) => ({
      time: s.time,
      title: s.title,
      description: s.description,
    })),
    category: categoryIds.get(exp.categorySlug),
    destination: destinationIds.get(EXPERIENCE_TO_DESTINATION[exp.slug]),
    _status: 'published' as const,
  }
}

function nextEligibleSaturdays(count: number): string[] {
  const cursor = new Date()
  cursor.setUTCHours(12, 0, 0, 0)
  cursor.setUTCDate(cursor.getUTCDate() + ((6 - cursor.getUTCDay() + 7) % 7 || 7))
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(cursor)
    date.setUTCDate(date.getUTCDate() + index * 7)
    return date.toISOString().slice(0, 10)
  })
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
