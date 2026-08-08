import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { ServiceRequestForm } from '@/components/forms/service-request-form'
import { TRAVEL_SERVICES, getServiceBySlug } from '@/lib/data/travel-services'

export function generateStaticParams() {
  return TRAVEL_SERVICES.map((s) => ({ service: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>
}): Promise<Metadata> {
  const { service } = await params
  const s = getServiceBySlug(service)
  if (!s) return { title: 'Not found' }
  return { title: s.title, description: s.blurb }
}

export default async function TravelServicePage({
  params,
}: {
  params: Promise<{ service: string }>
}) {
  const { service } = await params
  const s = getServiceBySlug(service)
  if (!s) notFound()
  const Icon = s.icon

  return (
    <>
      <section className="relative overflow-hidden text-white" style={{ background: s.gradient }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-black/15" />
        <Container className="relative py-14 sm:py-16">
          <Link
            href="/travel-services"
            className="inline-flex items-center gap-1 text-sm font-medium text-white/80 hover:text-white"
          >
            <ChevronLeft className="size-4" /> Travel services
          </Link>
          <div className="mt-5 flex items-center gap-4">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-white/15">
              <Icon className="size-6" />
            </span>
            <div>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">{s.title}</h1>
            </div>
          </div>
          <p className="mt-3 max-w-xl text-white/85">{s.blurb}</p>
        </Container>
      </section>

      <Container className="max-w-3xl py-12 sm:py-16">
        <div className="rounded-card border border-border bg-surface-elevated p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Tell us what you need</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Share a few details and we’ll get back to you with options. You won’t be charged now.
          </p>
          <div className="mt-6">
            <ServiceRequestForm
              serviceType={s.serviceType}
              fields={s.fields}
              submitLabel={s.submitLabel}
            />
          </div>
        </div>
      </Container>
    </>
  )
}
