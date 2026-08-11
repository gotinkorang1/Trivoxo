import { createDefaultOpenGraphImage, OG_IMAGE_SIZE } from '@/lib/default-og-image'

export const alt = 'Trivoxo — Experience Ghana the Trivoxo Way'
export const size = OG_IMAGE_SIZE
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return createDefaultOpenGraphImage()
}
