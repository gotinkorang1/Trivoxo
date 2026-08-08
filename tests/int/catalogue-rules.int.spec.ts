import { describe, expect, it } from 'vitest'
import { getEventStatus } from '@/lib/event-status'
import { applyExperienceFilters } from '@/lib/experience-filters'
import type { Experience } from '@/lib/data/experiences'

const baseExperience: Experience = {
  slug: 'capital-pulse-tour',
  name: 'The Capital Pulse Tour',
  priceFrom: 1400,
  destination: 'Accra',
  region: 'Greater Accra',
  categorySlug: 'tours-culture',
  categoryLabel: 'Culture & History',
  duration: 'Full Day',
  blurb: 'Explore the capital.',
  availabilityType: 'everyday',
  minGuests: 2,
  maxGuests: 15,
  minNoticeHours: 24,
  maxAdvanceDays: 180,
}

describe('event status', () => {
  const now = new Date('2026-08-08T12:00:00.000Z')

  it('keeps a one-day event current until the end of its Ghana calendar day', () => {
    expect(getEventStatus({ startsAt: '2026-08-08T06:00:00.000Z' }, now)).toBe('ongoing')
  })

  it('separates future and past events', () => {
    expect(getEventStatus({ startsAt: '2026-08-20T06:00:00.000Z' }, now)).toBe('upcoming')
    expect(getEventStatus({ startsAt: '2026-03-21T06:00:00.000Z' }, now)).toBe('past')
  })
})

describe('experience discovery filters', () => {
  const now = new Date('2026-08-08T10:00:00.000Z')
  const weekendExperience: Experience = {
    ...baseExperience,
    slug: 'dodi-island',
    name: 'Dodi Island',
    destination: 'Akosombo / Volta Lake',
    region: 'Eastern Region',
    availabilityType: 'weekdays',
    weekdays: ['sat', 'sun'],
  }

  it('treats destination and keyword as independent filters', () => {
    expect(applyExperienceFilters([baseExperience], { destination: 'Accra' }, now)).toHaveLength(1)
    expect(applyExperienceFilters([baseExperience], { destination: 'Volta' }, now)).toHaveLength(0)
    expect(applyExperienceFilters([baseExperience], { q: 'culture' }, now)).toHaveLength(1)
  })

  it('enforces traveller capacity', () => {
    expect(applyExperienceFilters([baseExperience], { travellers: '1' }, now)).toHaveLength(0)
    expect(applyExperienceFilters([baseExperience], { travellers: '4' }, now)).toHaveLength(1)
    expect(applyExperienceFilters([baseExperience], { travellers: '16' }, now)).toHaveLength(0)
  })

  it('checks the selected date against the operating pattern', () => {
    expect(applyExperienceFilters([weekendExperience], { date: '2026-08-15' }, now)).toHaveLength(1)
    expect(applyExperienceFilters([weekendExperience], { date: '2026-08-17' }, now)).toHaveLength(0)
  })
})
