'use client'

import { useActionState, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  CircleCheck,
  Clock,
  Loader2,
  MapPin,
  Pencil,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from 'lucide-react'
import { createBookingAction, type BookingFormState } from '@/app/actions/booking'
import { GroupPricingTable } from '@/components/experiences/group-pricing'
import { TurnstileWidget } from '@/components/forms/turnstile-widget'
import { Button } from '@/components/ui/button'
import { evaluateDateAvailability, type DateWindow } from '@/lib/availability'
import type { AvailabilityType, Weekday } from '@/lib/data/experiences'
import { formatPrice } from '@/lib/format'
import { BOOKING_HOLD, quoteBooking } from '@/lib/policies'
import { cn } from '@/lib/utils'

const initialState: BookingFormState = {}
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const STEP_LABELS = ['Trip', 'Your details', 'Review']
const DATE_FORMATTER = new Intl.DateTimeFormat('en-GH', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

type FormValues = {
  date: string
  adults: string
  children: string
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  pickup: string
  specialRequest: string
}

type LiveAvailability = {
  available: boolean | null
  maxRemainingSeats?: number
  message: string
}

type AvailabilityResponse = {
  key: string
  result: LiveAvailability
}

type BookingFormProps = {
  slug: string
  experienceName: string
  categoryLabel: string
  destination: string
  duration: string
  baseFrom: number
  minDate: string
  maxDate: string
  initialDate?: string
  availabilityType?: AvailabilityType
  weekdays?: Weekday[]
  minNoticeHours?: number
  soldOut?: boolean
  minGuests: number
  maxGuests: number
}

export function BookingForm({
  slug,
  experienceName,
  categoryLabel,
  destination,
  duration,
  baseFrom,
  minDate,
  maxDate,
  initialDate = '',
  availabilityType,
  weekdays,
  minNoticeHours,
  soldOut,
  minGuests,
  maxGuests,
}: BookingFormProps) {
  const [state, formAction, pending] = useActionState(createBookingAction, initialState)
  const [step, setStep] = useState(0)
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})
  const [availabilityResponse, setAvailabilityResponse] = useState<AvailabilityResponse | null>(
    null,
  )
  const [values, setValues] = useState<FormValues>({
    date: initialDate,
    adults: '2',
    children: '0',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    pickup: '',
    specialRequest: '',
  })
  const stepHeadingRef = useRef<HTMLHeadingElement>(null)
  const reduceMotion = useReducedMotion()
  const adults = Number(values.adults)
  const children = Number(values.children)
  const partySize = adults + children
  const quote = useMemo(
    () => quoteBooking(baseFrom, adults, children),
    [baseFrom, adults, children],
  )
  const dateWindow = useMemo<DateWindow>(() => ({ minDate, maxDate }), [minDate, maxDate])
  const dateStatus = values.date
    ? evaluateDateAvailability(
        values.date,
        { availabilityType, weekdays, minNoticeHours, soldOut },
        dateWindow,
      )
    : undefined
  const availabilityKey =
    values.date && dateStatus?.requestable && partySize > 0 && partySize <= maxGuests
      ? `${values.date}:${partySize}`
      : ''
  const liveAvailability =
    availabilityResponse?.key === availabilityKey ? availabilityResponse.result : null
  const checkingAvailability = Boolean(
    availabilityKey && availabilityResponse?.key !== availabilityKey,
  )
  const combinedErrors = { ...clientErrors, ...(state.fieldErrors ?? {}) }
  const inventoryBlocked = Boolean(
    soldOut || checkingAvailability || liveAvailability?.available === false,
  )

  useEffect(() => {
    stepHeadingRef.current?.focus()
  }, [step])

  useEffect(() => {
    if (!availabilityKey) return

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        const query = new URLSearchParams({
          experience: slug,
          date: values.date,
          travellers: String(partySize),
        })
        const response = await fetch(`/api/availability?${query}`, {
          cache: 'no-store',
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Availability request failed')
        const result = (await response.json()) as {
          available?: boolean
          maxRemainingSeats?: number
          message?: string
        }
        setAvailabilityResponse({
          key: availabilityKey,
          result: {
            available: Boolean(result.available),
            maxRemainingSeats: result.maxRemainingSeats,
            message: result.message ?? 'Availability checked.',
          },
        })
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setAvailabilityResponse({
            key: availabilityKey,
            result: {
              available: null,
              message:
                'Live capacity could not be checked. It will be verified securely when you continue.',
            },
          })
        }
      }
    }, 250)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [availabilityKey, partySize, slug, values.date])

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    setClientErrors((current) => {
      const clearsParty = (key === 'adults' || key === 'children') && Boolean(current.party)
      if (!current[key] && !clearsParty) return current
      const next = { ...current }
      delete next[key]
      if (key === 'adults' || key === 'children') delete next.party
      return next
    })
  }

  function validateTrip() {
    const errors: Record<string, string> = {}
    if (!values.date) errors.date = 'Choose your preferred date.'
    else if (!dateStatus?.requestable) errors.date = dateStatus?.reason ?? 'Choose another date.'
    else if (liveAvailability?.available === false) errors.date = liveAvailability.message
    if (partySize < minGuests)
      errors.party = `This experience requires at least ${minGuests} travellers.`
    if (partySize > maxGuests)
      errors.party = `Online requests are limited to ${maxGuests} travellers.`
    setClientErrors(errors)
    return Object.keys(errors).length === 0
  }

  function validateDetails() {
    const errors: Record<string, string> = {}
    if (!values.firstName.trim()) errors.firstName = 'Enter your first name.'
    if (!values.lastName.trim()) errors.lastName = 'Enter your last name.'
    if (!values.email.trim()) errors.email = 'Enter your email address.'
    else if (!EMAIL_RE.test(values.email)) errors.email = 'Enter a valid email address.'
    if (!values.phone.trim()) errors.phone = 'Enter a phone or WhatsApp number.'
    setClientErrors(errors)
    return Object.keys(errors).length === 0
  }

  function continueFromTrip() {
    if (!validateTrip()) return
    setClientErrors({})
    setStep(1)
  }

  function continueFromDetails() {
    if (!validateDetails()) return
    setClientErrors({})
    setStep(2)
  }

  function continueFlow() {
    if (step === 0) continueFromTrip()
    else if (step === 1) continueFromDetails()
  }

  const selectedDateLabel = values.date
    ? DATE_FORMATTER.format(new Date(`${values.date}T12:00:00.000Z`))
    : 'Choose a date'

  return (
    <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <form action={formAction} noValidate className="min-w-0">
        <input type="hidden" name="slug" value={slug} />
        {(Object.keys(values) as Array<keyof FormValues>).map((key) => (
          <input key={key} type="hidden" name={key} value={values[key]} />
        ))}

        <div className="overflow-hidden rounded-card border border-border bg-surface-elevated shadow-lift">
          <StepIndicator currentStep={step} />

          <div className="p-5 sm:p-8 lg:p-10">
            {soldOut && (
              <div
                className="mb-6 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
                role="alert"
              >
                This experience is currently sold out. Return to the experience page to ask Trivoxo
                about future dates.
              </div>
            )}

            {state.error && (
              <div
                className="mb-6 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
                role="alert"
              >
                <p className="font-bold">We could not send your request yet.</p>
                <p className="mt-1">{state.error}</p>
                {state.fieldErrors && Object.keys(state.fieldErrors).length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setStep(state.fieldErrors?.date || state.fieldErrors?.party ? 0 : 1)
                    }
                    className="mt-3 min-h-11 font-bold underline underline-offset-4"
                  >
                    Review the highlighted details
                  </button>
                )}
              </div>
            )}

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={reduceMotion ? false : { opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -12 }}
                transition={{ duration: reduceMotion ? 0 : 0.22 }}
              >
                {step === 0 && (
                  <section aria-labelledby="trip-step-title">
                    <StepHeading
                      ref={stepHeadingRef}
                      id="trip-step-title"
                      eyebrow="Step 1 of 3"
                      title="Trip essentials"
                      description="Choose a preferred date and tell us who is travelling."
                    />

                    {combinedErrors.party && (
                      <ErrorSummary id="party-error">{combinedErrors.party}</ErrorSummary>
                    )}

                    <div className="mt-8 grid gap-5 sm:grid-cols-2">
                      <Field
                        id="booking-date"
                        label="Preferred date"
                        error={combinedErrors.date}
                        className="sm:col-span-2"
                      >
                        <div className="relative">
                          <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-text-muted" />
                          <input
                            id="booking-date"
                            type="date"
                            min={minDate}
                            max={maxDate}
                            value={values.date}
                            onChange={(event) => update('date', event.target.value)}
                            aria-invalid={Boolean(combinedErrors.date)}
                            aria-describedby={
                              combinedErrors.date ? 'booking-date-error' : 'booking-date-help'
                            }
                            className={inputCls(combinedErrors.date, 'pl-11')}
                          />
                        </div>
                        <p
                          id="booking-date-help"
                          className="mt-2 text-xs leading-5 text-text-muted"
                        >
                          Requests need at least {minNoticeHours ?? 24} hours’ notice. Trivoxo
                          checks live capacity before creating a temporary seat hold.
                        </p>
                        <div className="mt-2 min-h-5" aria-live="polite" aria-atomic="true">
                          {checkingAvailability ? (
                            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted">
                              <Loader2 className="size-3.5 animate-spin" /> Checking live capacity…
                            </p>
                          ) : liveAvailability ? (
                            <p
                              className={cn(
                                'inline-flex items-center gap-1.5 text-xs font-semibold',
                                liveAvailability.available === false
                                  ? 'text-danger'
                                  : liveAvailability.available === true
                                    ? 'text-brand-accent'
                                    : 'text-text-muted',
                              )}
                            >
                              {liveAvailability.available === true && (
                                <Check className="size-3.5" />
                              )}
                              {liveAvailability.message}
                            </p>
                          ) : dateStatus?.requestable ? (
                            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-accent">
                              <Check className="size-3.5" /> {dateStatus.label}
                            </p>
                          ) : null}
                        </div>
                      </Field>

                      <Field id="booking-adults" label="Adults" error={combinedErrors.adults}>
                        <select
                          id="booking-adults"
                          value={values.adults}
                          onChange={(event) => update('adults', event.target.value)}
                          aria-invalid={Boolean(combinedErrors.party)}
                          aria-describedby={combinedErrors.party ? 'party-error' : undefined}
                          className={inputCls()}
                        >
                          {Array.from({ length: maxGuests }, (_, index) => index + 1).map(
                            (count) => (
                              <option key={count} value={count}>
                                {count}
                              </option>
                            ),
                          )}
                        </select>
                      </Field>

                      <Field
                        id="booking-children"
                        label="Children"
                        hint="Ages 3–11"
                        error={combinedErrors.children}
                      >
                        <select
                          id="booking-children"
                          value={values.children}
                          onChange={(event) => update('children', event.target.value)}
                          aria-invalid={Boolean(combinedErrors.party)}
                          aria-describedby={combinedErrors.party ? 'party-error' : undefined}
                          className={inputCls()}
                        >
                          {Array.from({ length: maxGuests }, (_, index) => index).map((count) => (
                            <option key={count} value={count}>
                              {count}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <div className="mt-6 rounded-2xl border border-brand-secondary/25 bg-brand-secondary-soft p-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="mt-0.5 size-5 shrink-0 text-brand-link" />
                        <div>
                          <p className="text-sm font-bold text-text-primary">
                            {quote.discountPct > 0
                              ? `${quote.discountPct}% group saving applied`
                              : 'Group savings start at 3 travellers'}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-text-secondary">
                            {partySize} traveller{partySize === 1 ? '' : 's'} · Adult rate{' '}
                            {formatPrice(quote.adultUnit)} each · Children{' '}
                            {formatPrice(quote.childUnit)} each
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 hidden justify-end lg:flex">
                      <Button
                        type="button"
                        size="lg"
                        onClick={continueFromTrip}
                        disabled={inventoryBlocked}
                      >
                        Continue to your details <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </section>
                )}

                {step === 1 && (
                  <section aria-labelledby="details-step-title">
                    <StepHeading
                      ref={stepHeadingRef}
                      id="details-step-title"
                      eyebrow="Step 2 of 3"
                      title="Who is booking?"
                      description="We use these details to confirm the request and coordinate your experience."
                    />

                    <div className="mt-8 grid gap-5 sm:grid-cols-2">
                      <TextField
                        id="booking-first-name"
                        label="First name"
                        value={values.firstName}
                        error={combinedErrors.firstName}
                        autoComplete="given-name"
                        onChange={(value) => update('firstName', value)}
                      />
                      <TextField
                        id="booking-last-name"
                        label="Last name"
                        value={values.lastName}
                        error={combinedErrors.lastName}
                        autoComplete="family-name"
                        onChange={(value) => update('lastName', value)}
                      />
                      <TextField
                        id="booking-email"
                        label="Email address"
                        type="email"
                        value={values.email}
                        error={combinedErrors.email}
                        autoComplete="email"
                        onChange={(value) => update('email', value)}
                      />
                      <TextField
                        id="booking-phone"
                        label="Phone / WhatsApp"
                        type="tel"
                        value={values.phone}
                        error={combinedErrors.phone}
                        autoComplete="tel"
                        inputMode="tel"
                        onChange={(value) => update('phone', value)}
                      />
                      <TextField
                        id="booking-country"
                        label="Country"
                        optional
                        value={values.country}
                        autoComplete="country-name"
                        onChange={(value) => update('country', value)}
                      />
                      <TextField
                        id="booking-pickup"
                        label="Preferred pickup area"
                        optional
                        value={values.pickup}
                        autoComplete="street-address"
                        placeholder="e.g. Osu, Airport Residential"
                        onChange={(value) => update('pickup', value)}
                      />
                      <Field
                        id="booking-special-request"
                        label="Special requests"
                        optional
                        className="sm:col-span-2"
                      >
                        <textarea
                          id="booking-special-request"
                          rows={4}
                          value={values.specialRequest}
                          onChange={(event) => update('specialRequest', event.target.value)}
                          placeholder="Accessibility, dietary, celebration, or pace preferences"
                          className={inputCls()}
                        />
                      </Field>
                    </div>

                    <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-text-muted">
                      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-accent" /> We
                      collect only what Trivoxo needs to process and coordinate this request.
                    </p>

                    <div className="mt-8 hidden items-center justify-between lg:flex">
                      <Button type="button" variant="ghost" onClick={() => setStep(0)}>
                        <ChevronLeft className="size-4" /> Back
                      </Button>
                      <Button type="button" size="lg" onClick={continueFromDetails}>
                        Review your request <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </section>
                )}

                {step === 2 && (
                  <section aria-labelledby="review-step-title">
                    <StepHeading
                      ref={stepHeadingRef}
                      id="review-step-title"
                      eyebrow="Step 3 of 3"
                      title="Review your request"
                      description={`Check the details below. Submitting starts a ${BOOKING_HOLD.minutes}-minute seat hold; no payment is collected yet.`}
                    />

                    <div className="mt-8 space-y-4">
                      <ReviewCard
                        icon={CalendarDays}
                        title="Trip"
                        onEdit={() => setStep(0)}
                        lines={[
                          selectedDateLabel,
                          `${adults} adult${adults === 1 ? '' : 's'}${children ? ` · ${children} child${children === 1 ? '' : 'ren'}` : ''}`,
                        ]}
                      />
                      <ReviewCard
                        icon={Users}
                        title="Contact"
                        onEdit={() => setStep(1)}
                        lines={[
                          `${values.firstName} ${values.lastName}`,
                          values.email,
                          values.phone,
                          values.country || 'Country not provided',
                        ]}
                      />
                      {(values.pickup || values.specialRequest) && (
                        <ReviewCard
                          icon={MapPin}
                          title="Preferences"
                          onEdit={() => setStep(1)}
                          lines={[
                            values.pickup || 'Pickup to be agreed',
                            values.specialRequest,
                          ].filter(Boolean)}
                        />
                      )}
                    </div>

                    <div className="mt-6 rounded-card bg-brand-navy p-5 text-white sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-secondary">
                            {quote.requestQuote ? 'Planning estimate' : 'Estimated total'}
                          </p>
                          <p className="mt-1 text-3xl font-bold text-white">
                            {formatPrice(quote.total)}
                          </p>
                        </div>
                        {quote.discountPct > 0 && (
                          <span className="rounded-full bg-brand-accent px-3 py-1.5 text-xs font-bold text-white">
                            Save {quote.discountPct}%
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-xs leading-5 text-white/65">
                        {quote.requestQuote
                          ? 'For 15 travellers, Trivoxo will prepare a group quote. This estimate is not a payment request.'
                          : 'Trivoxo confirms the final total, availability, pickup details, and secure payment instructions.'}
                      </p>
                    </div>

                    <TurnstileWidget
                      action="booking_create"
                      resetKey={state}
                      className="mt-6"
                    />

                    <div className="mt-8 hidden items-center justify-between lg:flex">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setStep(1)}
                        disabled={pending}
                      >
                        <ChevronLeft className="size-4" /> Back
                      </Button>
                      <Button type="submit" size="lg" disabled={pending || inventoryBlocked}>
                        {pending ? (
                          <>
                            <Loader2 className="size-4 animate-spin" /> Holding seats…
                          </>
                        ) : (
                          <>
                            Hold seats &amp; continue <ArrowRight className="size-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </section>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface-elevated/96 px-4 py-3 shadow-[0_-18px_40px_-24px_rgb(var(--shadow-rgb)/.7)] backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-xs text-text-muted">
                {partySize} travellers · {selectedDateLabel}
              </p>
              <p className="font-bold text-text-primary">
                {quote.requestQuote ? 'Group quote' : formatPrice(quote.total)}
              </p>
            </div>
            {step > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep((current) => current - 1)}
                disabled={pending}
              >
                Back
              </Button>
            )}
            <Button
              type={step === 2 ? 'submit' : 'button'}
              onClick={step === 2 ? undefined : continueFlow}
              disabled={pending || inventoryBlocked}
              className="shrink-0"
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Holding…
                </>
              ) : step === 0 ? (
                'Continue'
              ) : step === 1 ? (
                'Review'
              ) : (
                'Hold seats'
              )}
            </Button>
          </div>
        </div>
      </form>

      <aside className="sticky top-24 hidden overflow-hidden rounded-card border border-border bg-surface-elevated shadow-lift lg:block">
        <div className="bg-brand-navy p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-secondary">
            {categoryLabel}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{experienceName}</h2>
          <div className="mt-5 space-y-3 text-sm text-white/72">
            <p className="flex items-center gap-2">
              <MapPin className="size-4 text-brand-secondary" /> {destination}
            </p>
            <p className="flex items-center gap-2">
              <Clock className="size-4 text-brand-secondary" /> {duration}
            </p>
            <p className="flex items-center gap-2">
              <CalendarDays className="size-4 text-brand-secondary" /> {selectedDateLabel}
            </p>
            <p className="flex items-center gap-2">
              <Users className="size-4 text-brand-secondary" /> {partySize} traveller
              {partySize === 1 ? '' : 's'}
            </p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">
                {quote.requestQuote ? 'Planning estimate' : 'Estimated total'}
              </p>
              <p className="mt-1 text-3xl font-bold text-text-primary">
                {formatPrice(quote.total)}
              </p>
            </div>
            {quote.discountPct > 0 && (
              <span className="rounded-full bg-brand-accent-soft px-3 py-1.5 text-xs font-bold text-brand-accent">
                {quote.discountPct}% off
              </span>
            )}
          </div>
          <p className="mt-2 text-xs leading-5 text-text-muted">
            {formatPrice(quote.adultUnit)} per adult · {formatPrice(quote.childUnit)} per child
          </p>

          <div className="my-5 border-y border-border py-5">
            <GroupPricingTable baseFrom={baseFrom} />
          </div>

          <div className="space-y-3 text-xs leading-5 text-text-muted">
            <p className="flex items-start gap-2">
              <WalletCards className="mt-0.5 size-4 shrink-0 text-brand-link" /> No payment is
              collected when the temporary hold is created.
            </p>
            <p className="flex items-start gap-2">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-brand-accent" /> Final capacity is
              locked transactionally for {BOOKING_HOLD.minutes} minutes.
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <ol
      className="grid grid-cols-3 border-b border-border bg-surface px-4 sm:px-8"
      aria-label="Booking progress"
    >
      {STEP_LABELS.map((label, index) => {
        const complete = index < currentStep
        const current = index === currentStep
        return (
          <li
            key={label}
            aria-current={current ? 'step' : undefined}
            className={cn(
              'relative flex min-h-16 items-center justify-center gap-2 border-b-2 px-2 text-center text-xs font-bold transition sm:text-sm',
              current
                ? 'border-brand-primary text-brand-link'
                : 'border-transparent text-text-muted',
              complete && 'text-brand-accent',
            )}
          >
            <span
              className={cn(
                'flex size-6 items-center justify-center rounded-full border text-[11px]',
                current && 'border-brand-primary bg-brand-primary text-brand-navy',
                complete && 'border-brand-accent bg-brand-accent text-white',
              )}
            >
              {complete ? <Check className="size-3.5" /> : index + 1}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </li>
        )
      })}
    </ol>
  )
}

const StepHeading = function StepHeading({
  id,
  eyebrow,
  title,
  description,
  ref,
}: {
  id: string
  eyebrow: string
  title: string
  description: string
  ref: React.Ref<HTMLHeadingElement>
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-link">{eyebrow}</p>
      <h2
        ref={ref}
        id={id}
        tabIndex={-1}
        className="mt-2 text-3xl font-semibold outline-none sm:text-4xl"
      >
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">{description}</p>
    </div>
  )
}

function Field({
  id,
  label,
  hint,
  error,
  optional,
  className,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  optional?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-bold text-text-primary">
          {label}
        </label>
        {(optional || hint) && (
          <span className="text-xs text-text-muted">{optional ? 'Optional' : hint}</span>
        )}
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

function TextField({
  id,
  label,
  value,
  error,
  optional,
  type = 'text',
  autoComplete,
  inputMode,
  placeholder,
  onChange,
}: {
  id: string
  label: string
  value: string
  error?: string
  optional?: boolean
  type?: string
  autoComplete?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  placeholder?: string
  onChange: (value: string) => void
}) {
  return (
    <Field id={id} label={label} error={error} optional={optional}>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={inputCls(error)}
      />
    </Field>
  )
}

function ReviewCard({
  icon: Icon,
  title,
  lines,
  onEdit,
}: {
  icon: typeof CalendarDays
  title: string
  lines: string[]
  onEdit: () => void
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-surface-elevated text-brand-link">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-text-primary">{title}</p>
        {lines.map((line, index) => (
          <p key={`${title}-${index}`} className="mt-1 break-words text-sm text-text-secondary">
            {line}
          </p>
        ))}
      </div>
      <button
        type="button"
        aria-label={`Edit ${title.toLowerCase()}`}
        onClick={onEdit}
        className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-xs font-bold text-brand-link hover:bg-brand-primary-soft"
      >
        <Pencil className="size-3.5" /> Edit
      </button>
    </div>
  )
}

function ErrorSummary({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <p
      id={id}
      className="mt-6 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger"
      role="alert"
    >
      {children}
    </p>
  )
}

function inputCls(error?: string, className?: string) {
  return cn(
    'min-h-12 w-full rounded-xl border bg-background px-3.5 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20',
    error ? 'border-danger' : 'border-border-strong',
    className,
  )
}
