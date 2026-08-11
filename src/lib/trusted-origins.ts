function normalizeOrigin(value: string | undefined): string | null {
  const candidate = value?.trim()

  if (!candidate) return null

  try {
    const url = new URL(candidate.includes('://') ? candidate : `https://${candidate}`)

    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null

    return url.origin
  } catch {
    return null
  }
}

type TrustedOriginEnvironment = Partial<
  Record<
    | 'NEXT_PUBLIC_SERVER_URL'
    | 'NODE_ENV'
    | 'VERCEL_BRANCH_URL'
    | 'VERCEL_PROJECT_PRODUCTION_URL'
    | 'VERCEL_URL',
    string | undefined
  >
>

/**
 * Restrict Payload's browser-facing API to known deployment origins.
 * Vercel system URL variables omit the protocol, so normalize them to HTTPS.
 */
export function getTrustedOrigins(env: TrustedOriginEnvironment = process.env): string[] {
  const origins = [
    normalizeOrigin(env.NEXT_PUBLIC_SERVER_URL),
    normalizeOrigin(env.VERCEL_PROJECT_PRODUCTION_URL),
    normalizeOrigin(env.VERCEL_BRANCH_URL),
    normalizeOrigin(env.VERCEL_URL),
  ]

  if (env.NODE_ENV !== 'production') {
    origins.push('http://localhost:3000')
  }

  return Array.from(new Set(origins.filter((origin): origin is string => Boolean(origin))))
}
