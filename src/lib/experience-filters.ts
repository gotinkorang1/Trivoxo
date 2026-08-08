import type { Experience } from '@/lib/data/experiences'
import { evaluateDateAvailability, getBookingWindow, isIsoDate } from '@/lib/availability'

export type ExperienceFilters = {
  q?: string
  category?: string
  destination?: string
  difficulty?: string
  duration?: string
  maxPrice?: string
  date?: string
  travellers?: string
  sort?: string
}

export function applyExperienceFilters(
  experiences: Experience[],
  filters: ExperienceFilters,
  now = new Date(),
): Experience[] {
  const query = (filters.q ?? '').trim().toLowerCase()
  const destination = (filters.destination ?? '').trim().toLowerCase()
  const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : undefined
  const travellers = filters.travellers ? Number(filters.travellers) : undefined
  const selectedDate = filters.date && isIsoDate(filters.date) ? filters.date : undefined

  if (filters.date && !selectedDate) return []
  if (filters.travellers && (travellers == null || !Number.isInteger(travellers) || travellers < 1))
    return []

  let results = experiences.filter((experience) => {
    if (filters.category && experience.categorySlug !== filters.category) return false
    if (filters.difficulty && experience.difficulty !== filters.difficulty) return false
    if (filters.duration && experience.duration !== filters.duration) return false
    if (maxPrice != null && Number.isFinite(maxPrice) && experience.priceFrom > maxPrice)
      return false

    if (destination) {
      const location = `${experience.destination} ${experience.region}`.toLowerCase()
      if (!location.includes(destination)) return false
    }

    if (query) {
      const searchable =
        `${experience.name} ${experience.destination} ${experience.region} ${experience.categoryLabel} ${experience.blurb}`.toLowerCase()
      if (!searchable.includes(query)) return false
    }

    if (travellers != null && Number.isInteger(travellers) && travellers > 0) {
      if (experience.minGuests != null && travellers < experience.minGuests) return false
      if (experience.maxGuests != null && travellers > experience.maxGuests) return false
    }

    if (selectedDate) {
      const rules = {
        availabilityType: experience.availabilityType,
        weekdays: experience.weekdays,
        minNoticeHours: experience.minNoticeHours,
        maxAdvanceDays: experience.maxAdvanceDays,
        soldOut: experience.soldOut,
      }
      const availability = evaluateDateAvailability(
        selectedDate,
        rules,
        getBookingWindow(rules, now),
      )
      if (!availability.requestable) return false
    }

    return true
  })

  switch (filters.sort) {
    case 'price-asc':
      results = [...results].sort((a, b) => a.priceFrom - b.priceFrom)
      break
    case 'price-desc':
      results = [...results].sort((a, b) => b.priceFrom - a.priceFrom)
      break
    case 'rating':
      results = [...results].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      break
  }

  return results
}
