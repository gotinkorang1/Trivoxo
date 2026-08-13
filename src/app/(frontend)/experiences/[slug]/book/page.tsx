import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'
import { BookingForm } from '@/components/booking/booking-form'
import { Container } from '@/components/ui/container'
import { evaluateDateAvailability, getBookingWindow, isIsoDate } from '@/lib/availability'
import { getExperienceBySlug } from '@/lib/payload/experiences'
import { CAPACITY } from '@/lib/policies'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const experience = await getExperienceBySlug(slug)
  return { title: experience ? `Book ${experience.name}` : 'Book', robots: { index: false } }
}

export default async function BookExperiencePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ date?: string }>
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const experience = await getExperienceBySlug(slug)
  if (!experience) notFound()

  const availabilityRules = {
    availabilityType: experience.availabilityType,
    weekdays: experience.weekdays,
    minNoticeHours: experience.minNoticeHours,
    maxAdvanceDays: experience.maxAdvanceDays,
    soldOut: experience.soldOut,
  }
  const bookingWindow = getBookingWindow(availabilityRules)
  const requestedDate = typeof query.date === 'string' ? query.date : ''
  const initialDate =
    isIsoDate(requestedDate) &&
    evaluateDateAvailability(requestedDate, availabilityRules, bookingWindow).requestable
      ? requestedDate
      : ''

  return (
    <div className="relative overflow-hidden pb-28 lg:pb-0">
      <div className="absolute inset-x-0 top-0 h-80 bg-brand-navy" />
      <div className="soft-grid absolute inset-x-0 top-0 h-80 opacity-30" />
      <Container className="relative py-9 sm:py-12 lg:py-16">
        <Link
          href={`/experiences/${experience.slug}`}
          className="inline-flex min-h-10 items-center gap-1 rounded-full px-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft className="size-4" /> Back to {experience.name}
        </Link>

        <div className="mt-6 max-w-3xl text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-secondary">
            Secure booking
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Hold your place</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
            Choose your date and travellers, add your contact details, then review everything before
            placing a temporary seat hold. You will not be charged at this stage.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/75">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-brand-secondary" /> Live departure capacity
            </span>
            <span className="inline-flex items-center gap-2">
              <LockKeyhole className="size-4 text-brand-secondary" /> Double-booking protection
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="size-4 text-brand-secondary" /> Group savings calculated live
            </span>
          </div>
        </div>

        <BookingForm
          slug={experience.slug}
          experienceName={experience.name}
          categoryLabel={experience.categoryLabel}
          destination={experience.destination}
          duration={experience.duration || 'On request'}
          baseFrom={experience.priceFrom}
          minDate={bookingWindow.minDate}
          maxDate={bookingWindow.maxDate}
          initialDate={initialDate}
          availabilityType={experience.availabilityType}
          weekdays={experience.weekdays}
          minNoticeHours={experience.minNoticeHours}
          soldOut={experience.soldOut}
          minGuests={CAPACITY.minGuests}
          maxGuests={CAPACITY.maxGuests}
        />
      </Container>
    </div>
  )
}
