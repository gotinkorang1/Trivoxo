import { createDefaultOpenGraphImage } from '@/lib/default-og-image'

export const dynamic = 'force-static'

export function GET() {
  return createDefaultOpenGraphImage()
}
