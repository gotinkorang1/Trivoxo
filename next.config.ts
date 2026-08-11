import { withSentryConfig } from '@sentry/nextjs'
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)
const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME

const securityHeaders = [
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
