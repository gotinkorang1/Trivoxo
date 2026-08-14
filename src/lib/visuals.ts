/**
 * Placeholder gradients keyed by category, used until real Ghana photography is
 * uploaded to the Media library (§8). Every card still looks intentional.
 */
export const CATEGORY_GRADIENT: Record<string, string> = {
  'hiking-adventure': 'linear-gradient(135deg, #0f3d2e 0%, #1e9e7a 100%)',
  'tours-culture': 'linear-gradient(135deg, #7a2e12 0%, #e85d2a 100%)',
  cycling: 'linear-gradient(135deg, #133a4d 0%, #2a9fb8 100%)',
  'nature-wildlife': 'linear-gradient(135deg, #3d4a12 0%, #8bae2a 100%)',
  'water-cruises': 'linear-gradient(135deg, #0e2a4d 0%, #2f7fb8 100%)',
  'premium-day-outs': 'linear-gradient(135deg, #4d3a12 0%, #f5b133 100%)',
  'night-experiences': 'linear-gradient(135deg, #1a1440 0%, #6d4bd8 100%)',
}

export function gradientFor(slug?: string): string {
  return CATEGORY_GRADIENT[slug ?? ''] ?? 'linear-gradient(135deg, #0e1c2b 0%, #13273a 100%)'
}

/** Curated gradients for the known destination hubs (§74). */
const DESTINATION_GRADIENT: Record<string, string> = {
  accra: 'linear-gradient(135deg,#7a2e12,#e85d2a)',
  'cape-coast': 'linear-gradient(135deg,#0e2a4d,#2f7fb8)',
  volta: 'linear-gradient(135deg,#0f3d2e,#1e9e7a)',
  akosombo: 'linear-gradient(135deg,#133a4d,#2a9fb8)',
  'eastern-region': 'linear-gradient(135deg,#3d4a12,#8bae2a)',
  'shai-hills': 'linear-gradient(135deg,#4d3a12,#f5b133)',
}

/** A small rotating palette used for content that doesn't have a curated
 * gradient of its own (events, guide articles, or any new destination a staff
 * member adds later) — deterministic per slug, so it stays stable. */
const PALETTE = [
  'linear-gradient(135deg,#0e1c2b,#13273a)',
  'linear-gradient(135deg,#7a2e12,#e85d2a)',
  'linear-gradient(135deg,#0f3d2e,#1e9e7a)',
  'linear-gradient(135deg,#0e2a4d,#2f7fb8)',
  'linear-gradient(135deg,#4d3a12,#f5b133)',
  'linear-gradient(135deg,#133a4d,#2a9fb8)',
  'linear-gradient(135deg,#1a1440,#6d4bd8)',
  'linear-gradient(135deg,#3d4a12,#8bae2a)',
]

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i)
  return Math.abs(hash)
}

/** Stable, deterministic gradient for any slug — used where content has no
 * curated visual of its own yet. */
export function gradientForSlug(slug: string): string {
  // Modulo of a non-empty palette is always a valid index.
  return PALETTE[hashCode(slug) % PALETTE.length]!
}

export function gradientForDestination(slug: string): string {
  return DESTINATION_GRADIENT[slug] ?? gradientForSlug(slug)
}
