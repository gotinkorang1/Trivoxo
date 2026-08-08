import type { MetadataRoute } from 'next'
import { getAllExperiences } from '@/lib/payload/experiences'
import { getAllDestinations } from '@/lib/payload/destinations'
import { getAllEvents } from '@/lib/payload/events'
import { getAllArticles } from '@/lib/payload/guide'
import { TRAVEL_SERVICES } from '@/lib/data/travel-services'
import { LEGAL_PAGES } from '@/lib/data/legal'

export const revalidate = 60

const BASE = process.env.NEXT_PUBLIC_SERVER_URL || 'https://trivoxogh.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const url = (path: string) => `${BASE}${path}`

  const staticEntries: { path: string; changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>; priority: number }[] = [
    { path: '/', changeFrequency: 'weekly', priority: 1 },
    { path: '/experiences', changeFrequency: 'daily', priority: 0.9 },
    { path: '/destinations', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/events', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/corporate', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/custom-trips', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/travel-services', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/guide', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/contact', changeFrequency: 'yearly', priority: 0.5 },
    { path: '/safety', changeFrequency: 'yearly', priority: 0.4 },
    { path: '/faqs', changeFrequency: 'monthly', priority: 0.4 },
  ]
  const staticRoutes: MetadataRoute.Sitemap = staticEntries.map((e) => ({
    url: url(e.path),
    changeFrequency: e.changeFrequency,
    priority: e.priority,
    lastModified: now,
  }))

  const [allExperiences, allDestinations, allEvents, allArticles] = await Promise.all([
    getAllExperiences(),
    getAllDestinations(),
    getAllEvents(),
    getAllArticles(),
  ])

  const experiences = allExperiences.map((e) => ({ url: url(`/experiences/${e.slug}`), lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 }))
  const destinations = allDestinations.map((d) => ({ url: url(`/destinations/${d.slug}`), lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 }))
  const events = allEvents.map((e) => ({ url: url(`/events/${e.slug}`), lastModified: new Date(e.startsAt), changeFrequency: 'weekly' as const, priority: 0.7 }))
  const guide = allArticles.map((a) => ({ url: url(`/guide/${a.slug}`), lastModified: new Date(a.publishedAt), changeFrequency: 'monthly' as const, priority: 0.5 }))
  const services = TRAVEL_SERVICES.map((s) => ({ url: url(`/travel-services/${s.slug}`), lastModified: now, changeFrequency: 'monthly' as const, priority: 0.5 }))
  const legal = LEGAL_PAGES.map((p) => ({ url: url(`/${p.slug}`), lastModified: now, changeFrequency: 'yearly' as const, priority: 0.2 }))

  return [...staticRoutes, ...experiences, ...destinations, ...events, ...guide, ...services, ...legal]
}
