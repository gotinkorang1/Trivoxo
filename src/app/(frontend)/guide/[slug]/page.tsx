import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, Clock, ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { GUIDE_ARTICLES, getArticleBySlug } from '@/lib/data/guide'
import { formatDate } from '@/lib/format'

export function generateStaticParams() {
  return GUIDE_ARTICLES.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const a = getArticleBySlug(slug)
  if (!a) return { title: 'Article not found' }
  return {
    title: a.title,
    description: a.excerpt,
    openGraph: { title: a.title, description: a.excerpt, type: 'article' },
  }
}

export default async function GuideArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const related = GUIDE_ARTICLES.filter((a) => a.category === article.category && a.slug !== article.slug).slice(0, 2)

  return (
    <article>
      {/* Hero */}
      <div className="relative overflow-hidden text-white" style={{ background: article.gradient }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/20" />
        <Container className="relative flex min-h-[280px] flex-col justify-end py-8 sm:min-h-[340px]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-white/75">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="size-3.5" />
            <Link href="/guide" className="hover:text-white">Ghana Guide</Link>
          </nav>
          <div className="mt-auto max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-secondary">
              {article.categoryLabel}
            </p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">{article.title}</h1>
            <p className="mt-3 flex items-center gap-3 text-sm text-white/85">
              <span>{formatDate(article.publishedAt)}</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-4" /> {article.readMins} min read
              </span>
            </p>
          </div>
        </Container>
      </div>

      <Container className="max-w-3xl py-12 sm:py-16">
        <p className="text-lg leading-relaxed text-text-secondary">{article.excerpt}</p>
        <div className="mt-8 space-y-6">
          {article.body.map((block, i) => (
            <div key={i}>
              {block.heading && <h2 className="mb-2 text-xl font-semibold">{block.heading}</h2>}
              <p className="leading-relaxed text-text-secondary">{block.text}</p>
            </div>
          ))}
        </div>

        {related.length > 0 && (
          <section className="mt-14 border-t border-border pt-8">
            <h2 className="mb-4 text-lg font-semibold">Keep reading</h2>
            <ul className="space-y-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/guide/${r.slug}`}
                    className="group flex items-center justify-between gap-4 rounded-card border border-border bg-surface-elevated p-4 hover:border-brand-primary"
                  >
                    <span className="font-medium text-text-primary group-hover:text-brand-primary">{r.title}</span>
                    <ArrowRight className="size-4 shrink-0 text-brand-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </article>
  )
}
