import { describe, expect, it } from 'vitest'

import { getTrustedOrigins } from '@/lib/trusted-origins'

describe('Payload trusted origins', () => {
  it('allows the canonical, production, branch, and deployment Vercel origins', () => {
    expect(
      getTrustedOrigins({
        NODE_ENV: 'production',
        NEXT_PUBLIC_SERVER_URL: 'https://trivoxo-trivoxo.vercel.app',
        VERCEL_PROJECT_PRODUCTION_URL: 'trivoxo-trivoxo.vercel.app',
        VERCEL_BRANCH_URL: 'trivoxo-git-main-trivoxo.vercel.app',
        VERCEL_URL: 'trivoxo-howmx8vdw-trivoxo.vercel.app',
      }),
    ).toEqual([
      'https://trivoxo-trivoxo.vercel.app',
      'https://trivoxo-git-main-trivoxo.vercel.app',
      'https://trivoxo-howmx8vdw-trivoxo.vercel.app',
    ])
  })

  it('keeps localhost available outside production and rejects unsafe protocols', () => {
    expect(
      getTrustedOrigins({
        NODE_ENV: 'development',
        NEXT_PUBLIC_SERVER_URL: 'javascript:alert(1)',
        VERCEL_PROJECT_PRODUCTION_URL: undefined,
        VERCEL_BRANCH_URL: undefined,
        VERCEL_URL: undefined,
      }),
    ).toEqual(['http://localhost:3000'])
  })
})
