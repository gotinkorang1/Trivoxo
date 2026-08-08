import type { Metadata } from 'next'
import Link from 'next/link'
import { Luggage } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { MyTripsForm } from '@/components/trips/my-trips-form'

export const metadata: Metadata = {
  title: 'My Trips',
  description: 'View and manage your Trivoxo booking with your reference and email.',
  robots: { index: false },
}

export default function MyTripsPage() {
  return (
    <Container className="max-w-xl py-14 sm:py-20">
      <header className="text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
          <Luggage className="size-6" />
        </span>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">My Trips</h1>
        <p className="mt-2 text-text-secondary">
          Enter your booking reference and email to view and manage your trip.
        </p>
      </header>

      <div className="mt-8 rounded-card border border-border bg-surface-elevated p-6 sm:p-8">
        <MyTripsForm />
      </div>

      <p className="mt-6 text-center text-sm text-text-muted">
        Can’t find your reference? It’s in your booking confirmation — or{' '}
        <Link href="/contact" className="font-medium text-brand-primary hover:underline">
          contact us
        </Link>{' '}
        and we’ll help.
      </p>
    </Container>
  )
}
