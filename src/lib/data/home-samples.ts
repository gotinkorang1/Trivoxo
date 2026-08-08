/**
 * Placeholder content for homepage sections whose Payload collections start
 * empty (reviews, guide articles). Replace with live Payload queries once staff
 * have added real records. Kept separate so the swap is obvious and low-risk.
 * (Destination tiles come from destinations.ts; events from events.ts.)
 */

export const HOME_REVIEWS: { name: string; type: string; rating: number; body: string }[] = [
  {
    name: 'Ama M.',
    type: 'Family',
    rating: 5,
    body: 'The Capital Pulse tour was so well organised — our guide made the history come alive. Easily the highlight of our trip home.',
  },
  {
    name: 'Kofi A.',
    type: 'Friends',
    rating: 5,
    body: 'Peak & Cascade Explorer pushed us but the views were unreal. Everything ran on time and felt safe throughout.',
  },
  {
    name: 'Sarah D.',
    type: 'Couples',
    rating: 5,
    body: 'Booked the Volta cruise for our anniversary. Seamless from booking to drop-off. We are already planning the next one.',
  },
]

export const HOME_GUIDE: { title: string; category: string; slug: string; readMins: number }[] = [
  { title: 'A First-Timer’s Guide to Accra', category: 'Travel Planning', slug: 'first-timers-guide-accra', readMins: 6 },
  { title: 'What to Pack for a Ghana Adventure', category: 'Travel Planning', slug: 'what-to-pack-ghana', readMins: 4 },
  { title: 'The Best Times to Visit Cape Coast', category: 'Cape Coast', slug: 'best-times-cape-coast', readMins: 5 },
]

export const WHY_TRIVOXO: { title: string; body: string; icon: string }[] = [
  { title: 'Local Expertise', body: 'Experiences designed around Ghana by people who know it best.', icon: 'Compass' },
  { title: 'Carefully Curated', body: 'Handpicked routes and partners — never generic itineraries.', icon: 'Sparkles' },
  { title: 'Adventure With Confidence', body: 'Safety-conscious planning and coordination on every trip.', icon: 'ShieldCheck' },
  { title: 'Built Around You', body: 'Private, group and fully tailor-made options to suit your plans.', icon: 'Users' },
]
