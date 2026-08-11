/**
 * Verified customer reviews (§77). Seeded into the Reviews collection as
 * approved + verified so they surface on the homepage and count toward the
 * linked experience's star rating. Staff can also add/manage reviews in the
 * admin; this module keeps the real ones version-controlled and reproducible.
 */
export type TravellerType = 'solo' | 'couples' | 'friends' | 'family' | 'corporate'

export type SeedReview = {
  authorName: string
  title: string
  body: string
  rating: number
  /** Experience slug this review is attached to (drives its star rating). */
  experienceSlug?: string
  travellerType?: TravellerType
}

export const REVIEWS: SeedReview[] = [
  {
    authorName: 'Nutifafa',
    title: 'Beautiful views and amazing energy',
    body: 'Had such a great time on the hike this weekend! The views were beautiful, the energy was amazing, and it was a fun way to unwind, connect with nature, and make new memories. Definitely an experience I’d love to do again!',
    rating: 5,
    experienceSlug: 'mountain-mist-canopy-cascade',
  },
]
