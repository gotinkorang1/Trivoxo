/**
 * Placeholder homepage content: sample reviews (until verified reviews exist)
 * and the static "Why Trivoxo" points. Destinations come from destinations.ts,
 * events from events.ts, and guide articles from guide.ts.
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

export const WHY_TRIVOXO: { title: string; body: string; icon: string }[] = [
  { title: 'Excellence in the Details', body: 'We plan carefully and pay attention to the details that make an experience smooth and premium.', icon: 'Sparkles' },
  { title: 'Client-Centered Service', body: 'We listen, personalize every experience and deliver with warm hospitality.', icon: 'Users' },
  { title: 'Safety First', body: 'Professional drivers, reliable vehicles and support — always prepared, always responsible.', icon: 'ShieldCheck' },
  { title: 'Value for Money', body: 'The best return on every cedi — quality experiences that feel premium and truly worth it.', icon: 'Coins' },
]
