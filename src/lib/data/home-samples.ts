/**
 * Placeholder content for homepage sections whose Payload collections start
 * empty (events, reviews, guide articles, destination tiles). Replace with live
 * Payload queries once staff have added real records. Kept separate so the swap
 * is obvious and low-risk.
 */

export const HOME_DESTINATIONS: { name: string; region: string; gradient: string; slug: string }[] = [
  { name: 'Accra', region: 'Greater Accra', slug: 'accra', gradient: 'linear-gradient(135deg,#7a2e12,#e85d2a)' },
  { name: 'Cape Coast', region: 'Central Region', slug: 'cape-coast', gradient: 'linear-gradient(135deg,#0e2a4d,#2f7fb8)' },
  { name: 'Volta', region: 'Volta Region', slug: 'volta', gradient: 'linear-gradient(135deg,#0f3d2e,#1e9e7a)' },
  { name: 'Akosombo', region: 'Eastern Region', slug: 'akosombo', gradient: 'linear-gradient(135deg,#133a4d,#2a9fb8)' },
  { name: 'Eastern Region', region: 'Eastern Region', slug: 'eastern-region', gradient: 'linear-gradient(135deg,#3d4a12,#8bae2a)' },
  { name: 'Ada', region: 'Greater Accra', slug: 'ada', gradient: 'linear-gradient(135deg,#4d3a12,#f5b133)' },
]

export const HOME_EVENTS: { day: string; month: string; title: string; location: string; priceFrom: number; slug: string }[] = [
  { day: '19', month: 'DEC', title: 'Trivoxo Sunset Experience', location: 'Ada', priceFrom: 250, slug: 'trivoxo-sunset-experience' },
  { day: '27', month: 'DEC', title: 'Detty December: Capital Glow', location: 'Accra', priceFrom: 350, slug: 'detty-december-capital-glow' },
  { day: '01', month: 'JAN', title: 'New Year Volta Cruise', location: 'Akosombo', priceFrom: 600, slug: 'new-year-volta-cruise' },
]

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
