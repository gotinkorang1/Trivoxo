import { withSentryConfig } from '@sentry/nextjs'
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)
const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME
const isDevelopment = process.env.NODE_ENV === 'development'

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''} https://challenges.cloudflare.com https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://res.cloudinary.com https://*.google-analytics.com https://*.googletagmanager.com https://*.posthog.com https://*.i.posthog.com https://*.sentry.io",
  "font-src 'self' data:",
  "media-src 'self' blob: https://res.cloudinary.com",
  `connect-src 'self'${isDevelopment ? ' ws: wss:' : ''} https://challenges.cloudflare.com https://api.paystack.co https://checkout.paystack.com https://*.ingest.sentry.io https://*.sentry.io https://*.posthog.com https://*.i.posthog.com https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com`,
  "frame-src 'self' https://challenges.cloudflare.com https://checkout.paystack.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.paystack.com",
  "frame-ancestors 'self'",
  ...(isDevelopment ? [] : ['upgrade-insecure-requests']),
].join('; ')

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: contentSecurityPolicy,
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Permissions-Policy',
    // The admin QR scanner needs first-party camera access.
    value: 'camera=(self), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin-allow-popups',
  },
  {
    key: 'X-Permitted-Cross-Domain-Policies',
    value: 'none',
  },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/logo/**',
      },
      {
        pathname: '/images/**',
      },
      {
        pathname: '/Management/**',
      },
    ],
    remotePatterns: cloudinaryCloudName
      ? [
          {
            protocol: 'https',
            hostname: 'res.cloudinary.com',
            pathname: `/${cloudinaryCloudName}/**`,
          },
        ]
      : [],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

const payloadConfig = withPayload(nextConfig, { devBundleServerPackages: false })

// Payload uses the color-scheme client hint to render the admin theme correctly.
// Keep its critical retry behavior in the admin, but avoid forcing every public
// page navigation to restart before the first render.
const payloadHeaders = payloadConfig.headers
payloadConfig.headers = async () => {
  const headerRules = payloadHeaders ? await payloadHeaders() : []

  return [
    ...headerRules.map((rule) => ({
      ...rule,
      headers: rule.headers.filter((header) => header.key.toLowerCase() !== 'critical-ch'),
    })),
    {
      source: '/admin/:path*',
      headers: [
        {
          key: 'Critical-CH',
          value: 'Sec-CH-Prefers-Color-Scheme',
        },
      ],
    },
  ]
}

export default withSentryConfig(payloadConfig, {
  applicationKey: 'trivoxo-web',
  silent: !process.env.CI,
  telemetry: false,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
})
