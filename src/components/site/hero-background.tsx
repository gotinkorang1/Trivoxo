import Image from 'next/image'

/**
 * Full-bleed hero photo with a legibility overlay. Drop it in as the first child
 * of a `relative isolate` dark hero section; content after it should sit in a
 * `relative` wrapper so it renders above. The navy gradient stays dark where the
 * headline sits (left) and eases off to reveal the photo, with a bottom fade
 * into the page.
 */
export function HeroBackground({ src, alt = '' }: { src: string; alt?: string }) {
  return (
    <div className="absolute inset-0 -z-10" aria-hidden={alt ? undefined : true}>
      <Image src={src} alt={alt} fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/75 to-brand-navy/40" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-brand-navy to-transparent" />
    </div>
  )
}
