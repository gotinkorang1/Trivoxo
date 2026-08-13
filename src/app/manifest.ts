import type { MetadataRoute } from 'next'
import { BRAND } from '@/lib/constants'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name} — ${BRAND.headline}`,
    short_name: BRAND.name,
    description: BRAND.description,
    start_url: '/',
    id: '/',
    display: 'standalone',
    background_color: '#0e1a27',
    theme_color: '#0e1a27',
    lang: 'en-GH',
    categories: ['travel', 'tourism', 'lifestyle'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
