import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, MapPin, Clock, ShieldCheck } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { BookingForm } from '@/components/booking/booking-form'
import { getExperienceBySlug } from '@/lib/data/experiences'
import { gradientFor } from '@/lib/visuals'
import { formatPrice } from '@/lib/format'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const exp = getExperienceBySlug(slug)
  return { title: exp ? `Book ${exp.name}` : 'Book', robots: { index: false } }
}

export default async function BookExperiencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const exp = getExperienceBySlug(slug)
  if (!exp) notFound()

  const minDate = new Date().toISOString().slice(0, 10)

  return (
    <Container className="py-10 sm:py-14">
      <Link
        href={`/experiences/${exp.slug}`}
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-text-muted hover:text-brand-primary"
      >
        <ChevronLeft className="size-4" /> Back to {exp.name}
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold">Request your booking</h1>
          <p className="mt-2 text-text-secondary">
            Tell us your dates and details. We’ll confirm availability and send secure payment options — you won’t
            be charged now.
          </p>
          <div className="mt-8 rounded-card border border-border bg-surface-elevated p-6">
            <BookingForm slug={exp.slug} minDate={minDate} />
          </div>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-card border border-border bg-surface-elevated shadow-sm">
            <div className="h-28" style={{ background: gradientFor(exp.categorySlug) }} />
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-primary">{exp.categoryLabel}</p>
              <h2 className="mt-1 font-display text-lg">{exp.name}</h2>
              <dl className="mt-4 space-y-2 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-text-muted" /> {exp.destination}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-text-muted" /> {exp.duration}
                </div>
              </dl>
              <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
                <span className="text-sm text-text-muted">From</span>
                <span className="text-xl font-semibold text-text-primary">
                  {formatPrice(exp.priceFrom)}
                  <span className="text-sm font-normal text-text-muted"> / person</span>
                </span>
              </div>
              <p className="mt-4 flex items-start gap-2 text-xs text-text-muted">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-accent" />
                Group rates for 3+ travellers are confirmed with your quote.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  )
}
