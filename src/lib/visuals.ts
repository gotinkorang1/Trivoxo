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
