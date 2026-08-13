import { Sparkles } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { HeroBackground } from '@/components/site/hero-background'

type HeroImage = {
  src: string
  alt?: string
}

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  /** Optional full-bleed background photo. A gradient overlay keeps text legible. */
  image?: HeroImage
  children?: React.ReactNode
}) {
  return (
    <section
      className={`relative isolate overflow-hidden bg-brand-navy text-white ${
        image ? 'py-20 sm:py-24 lg:py-28' : 'py-14 sm:py-18 lg:py-22'
      }`}
    >
      {image ? (
        <HeroBackground src={image.src} alt={image.alt} />
      ) : (
        <>
          <div className="soft-grid absolute inset-0 -z-10 opacity-70" aria-hidden="true" />
          <div
            className="absolute -right-20 -top-36 -z-10 size-96 rounded-full bg-brand-primary/15 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-1/3 -z-10 h-28 w-72 rounded-full bg-brand-secondary/10 blur-3xl"
            aria-hidden="true"
          />
        </>
      )}
      <Container>
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-secondary">
            <Sparkles className="size-4" aria-hidden="true" /> {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.02] text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            {description}
          </p>
          {children && <div className="mt-6">{children}</div>}
        </div>
      </Container>
    </section>
  )
}
