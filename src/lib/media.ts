import type { Media } from '@/payload-types'

/** Serializable image shape shared by public catalogue models. */
export type PublicImage = {
  src: string
  alt: string
  width?: number
  height?: number
}

/** Convert a populated Payload upload relationship into a public image. */
export function mediaToPublicImage(
  media: number | Media | null | undefined,
): PublicImage | undefined {
  if (!media || typeof media === 'number' || !media.url) return undefined

  return {
    src: media.url,
    alt: media.alt,
    width: media.width ?? undefined,
    height: media.height ?? undefined,
  }
}
