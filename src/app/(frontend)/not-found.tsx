import type { Metadata } from 'next'
import { Compass } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { ButtonLink } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false },
}

const SUGGESTIONS = [
  { label: 'Experiences', href: '/experiences' },
  { label: 'Destinations', href: '/destinations' },
  { label: 'Events', href: '/events' },
  { label: 'Ghana Guide', href: '/guide' },
]

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
        <Compass className="size-7" aria-hidden="true" />
      </span>
      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-brand-link">
        404 — Page not found
      </p>
      <h1 className="mt-3 max-w-xl font-display text-3xl font-semibold sm:text-4xl">
        This trail doesn’t lead anywhere
      </h1>
      <p className="mt-4 max-w-md text-text-secondary">
        The page you’re after may have moved or never existed. Let’s get you back to exploring
        Ghana.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Back to home</ButtonLink>
        <ButtonLink href="/experiences" variant="outline">
          Browse experiences
        </ButtonLink>
      </div>
      <nav aria-label="Popular pages" className="mt-10 flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <ButtonLink key={s.href} href={s.href} variant="ghost" size="sm">
            {s.label}
          </ButtonLink>
        ))}
      </nav>
    </Container>
  )
}
