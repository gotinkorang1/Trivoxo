'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { createCustomTripAction, type EnquiryState } from '@/app/actions/enquiries'
import {
  Field,
  inputCls,
  CheckboxChips,
  CheckboxRow,
  SuccessPanel,
} from '@/components/forms/fields'
import {
  FormNavigation,
  GuidedFormProgress,
  ReviewGrid,
  StepHeading,
} from '@/components/forms/guided-form'
import { TRIP_INTERESTS } from '@/lib/enquiry-options'

const initial: EnquiryState = {}
const STEPS = ['Trip', 'Preferences', 'Contact', 'Review'] as const
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function CustomTripForm() {
  const [state, action, pending] = useActionState(createCustomTripAction, initial)
  const [step, setStep] = useState(0)
  const [localError, setLocalError] = useState<string>()
  const [review, setReview] = useState<{ label: string; value?: string }[]>([])
  const formRef = useRef<HTMLFormElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const mounted = useRef(false)
  const values = state.values ?? {}
  const fieldErrors = state.fieldErrors ?? {}

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    headingRef.current?.focus()
  }, [step])

  if (state.success) {
    return (
      <SuccessPanel
        title="Trip request received"
        message="Thanks — we’ll shape an itinerary around your interests and contact you with the next steps."
      />
    )
  }

  function formData() {
    return new FormData(formRef.current ?? undefined)
  }

  function continueFromContact() {
    const data = formData()
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    if (!name || !email || !EMAIL_RE.test(email)) {
      setLocalError('Add your name and a valid email address before reviewing.')
      return
    }
    const interests = data
      .getAll('interests')
      .map((value) => TRIP_INTERESTS.find((item) => item.value === value)?.label)
      .filter(Boolean)
      .join(', ')
    const needs = [
      ['accommodation', 'Accommodation'],
      ['transport', 'Transport'],
      ['airportTransfer', 'Airport transfer'],
      ['privateGuide', 'Private guide'],
    ]
      .filter(([name]) => data.has(name))
      .map(([, label]) => label)
      .join(', ')
    setReview([
      { label: 'Visit dates', value: String(data.get('visitDates') ?? '') },
      { label: 'Travellers', value: String(data.get('travellers') ?? '') },
      { label: 'Trip length', value: data.get('days') ? `${data.get('days')} days` : '' },
      { label: 'Interests', value: interests },
      { label: 'Support needed', value: needs },
      { label: 'Budget', value: String(data.get('budget') ?? '') },
      {
        label: 'Contact',
        value: `${name} · ${email}${data.get('phone') ? ` · ${data.get('phone')}` : ''}`,
      },
    ])
    setLocalError(undefined)
    setStep(3)
  }

  return (
    <form ref={formRef} action={action} noValidate>
      <GuidedFormProgress steps={STEPS} current={step} />
      {(state.error || localError) && (
        <p
          className="mb-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {localError ?? state.error}
        </p>
      )}

      <section hidden={step !== 0}>
        <StepHeading
          ref={headingRef}
          eyebrow="Step 1 of 4"
          title="Start with the shape of your trip"
          description="Approximate dates are welcome if flights are not booked yet."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="When are you visiting?" optional className="sm:col-span-3">
            <input
              name="visitDates"
              defaultValue={values.visitDates}
              placeholder="e.g. 12–18 March 2027"
              className={inputCls()}
            />
          </Field>
          <Field label="Travellers" optional>
            <input type="number" name="travellers" min={1} className={inputCls()} />
          </Field>
          <Field label="Days" optional>
            <input type="number" name="days" min={1} className={inputCls()} />
          </Field>
          <Field label="Budget" optional>
            <input
              name="budget"
              defaultValue={values.budget}
              placeholder="e.g. GHS 20,000"
              className={inputCls()}
            />
          </Field>
        </div>
        <FormNavigation
          onNext={() => {
            setLocalError(undefined)
            setStep(1)
          }}
        />
      </section>

      <section hidden={step !== 1}>
        <StepHeading
          ref={headingRef}
          eyebrow="Step 2 of 4"
          title="What should the journey feel like?"
          description="Choose as many interests and support services as you need."
        />
        <div className="space-y-6">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-text-primary">Your interests</legend>
            <CheckboxChips name="interests" options={TRIP_INTERESTS} />
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-text-primary">Travel support</legend>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <CheckboxRow name="accommodation" label="Accommodation" />
              <CheckboxRow name="transport" label="Transport" />
              <CheckboxRow name="airportTransfer" label="Airport transfer" />
              <CheckboxRow name="privateGuide" label="Private guide" />
            </div>
          </fieldset>
        </div>
        <FormNavigation
          onBack={() => setStep(0)}
          onNext={() => {
            setLocalError(undefined)
            setStep(2)
          }}
        />
      </section>

      <section hidden={step !== 2}>
        <StepHeading
          ref={headingRef}
          eyebrow="Step 3 of 4"
          title="Tell us how to reach you"
          description="Add any context that will help us make the first itinerary more relevant."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your name" error={fieldErrors.name}>
            <input
              name="name"
              autoComplete="name"
              defaultValue={values.name}
              aria-invalid={Boolean(fieldErrors.name)}
              className={inputCls(fieldErrors.name)}
            />
          </Field>
          <Field label="Email" error={fieldErrors.email}>
            <input
              type="email"
              name="email"
              autoComplete="email"
              defaultValue={values.email}
              aria-invalid={Boolean(fieldErrors.email)}
              className={inputCls(fieldErrors.email)}
            />
          </Field>
          <Field label="Phone or WhatsApp" optional className="sm:col-span-2">
            <input
              name="phone"
              inputMode="tel"
              autoComplete="tel"
              defaultValue={values.phone}
              className={inputCls()}
            />
          </Field>
          <Field label="Anything else we should know?" optional className="sm:col-span-2">
            <textarea name="notes" rows={4} defaultValue={values.notes} className={inputCls()} />
          </Field>
        </div>
        <FormNavigation onBack={() => setStep(1)} onNext={continueFromContact} />
      </section>

      <section hidden={step !== 3}>
        <StepHeading
          ref={headingRef}
          eyebrow="Step 4 of 4"
          title="Review your trip idea"
          description="This sends an itinerary request only. No booking or payment is created yet."
        />
        <ReviewGrid items={review} />
        <FormNavigation
          onBack={() => setStep(2)}
          submitLabel="Request my itinerary"
          pending={pending}
        />
      </section>
    </form>
  )
}
