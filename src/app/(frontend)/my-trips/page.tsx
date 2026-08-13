import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { PageHero } from '@/components/site/page-hero'
import { MyTripsForm } from '@/components/trips/my-trips-form'

export const metadata: Metadata = {
  title: 'My Trips',
  description: 'View and manage your Trivoxo booking with your reference and email.',
  robots: { index: false },
}

export default function MyTripsPage() {
  return (
    <>
      <PageHero
        eyebrow="My Trips"
        title="My Trips"
        description="Enter your booking reference and email to view and manage your trip."
        image={{ src: '/images/car-rental.jpg', alt: 'A Trivoxo car ready for pickup' }}
      />
      <Container className="max-w-xl py-14 sm:py-20">
        <div className="rounded-card border border-border bg-surface-elevated p-6 sm:p-8">
        <MyTripsForm />
      </div>

      <p className="mt-6 text-center text-sm text-text-muted">
        Can’t find your reference? It’s in your booking confirmation — or{' '}
        <Link href="/contact" className="font-medium text-brand-link hover:underline">
          contact us
        </Link>{' '}
        and we’ll help.
      </p>
      </Container>
    </>
  )
}
