import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/container'
import { ButtonLink } from '@/components/ui/button'
import { LEGAL_PAGES, getLegalPage } from '@/lib/data/legal'

// Dedicated routes (/about, /contact, /experiences, …) take precedence over this
// catch-all, which serves the legal content pages.
export function generateStaticParams() {
  return LEGAL_PAGES.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = getLegalPage(slug)
  if (!page) return { title: 'Not found' }
  return { title: page.title, description: page.subtitle }
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = getLegalPage(slug)
  if (!page) notFound()

  return (
    <Container className="max-w-3xl py-12 sm:py-16">
      <header className="border-b border-border pb-6">
        <h1 className="text-3xl font-semibold sm:text-4xl">{page.title}</h1>
        <p className="mt-2 text-text-secondary">{page.subtitle}</p>
      </header>

      <div className="mt-8 space-y-6">
        {page.sections.map((s, i) => (
          <section key={i}>
            {s.heading && <h2 className="mb-2 text-lg font-semibold">{s.heading}</h2>}
            <p className="leading-relaxed text-text-secondary">{s.text}</p>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-card border border-border bg-surface p-6 text-sm text-text-secondary">
        Questions about this policy?{' '}
        <ButtonLink href="/contact" variant="ghost" size="sm" className="ml-1 px-2">
          Contact us
        </ButtonLink>
      </div>
    </Container>
  )
}
