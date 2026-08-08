'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { createCorporateEnquiryAction, type EnquiryState } from '@/app/actions/enquiries'
import { Field, inputCls, CheckboxChips, SuccessPanel } from '@/components/forms/fields'
import {
  FormNavigation,
  GuidedFormProgress,
  ReviewGrid,
  StepHeading,
} from '@/components/forms/guided-form'
import { EVENT_TYPES, CORPORATE_SERVICES } from '@/lib/enquiry-options'

const initial: EnquiryState = {}
const STEPS = ['Brief', 'Requirements', 'Contact', 'Review'] as const
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function CorporateForm() {
  const [state, action, pending] = useActionState(createCorporateEnquiryAction, initial)
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
        title="Enquiry received"
        message="Thanks — our events team will review your brief and get back to you with the next steps."
      />
    )
  }

  function formData() {
    return new FormData(formRef.current ?? undefined)
  }

  function continueFromBrief() {
    if (!String(formData().get('eventType') ?? '')) {
      setLocalError('Choose what you are planning before you continue.')
      return
    }
    setLocalError(undefined)
    setStep(1)
  }

  function continueFromContact() {
    const data = formData()
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const phone = String(data.get('phone') ?? '').trim()
    if (!name || !email || !phone || !EMAIL_RE.test(email)) {
      setLocalError('Add your name, a valid email address and a phone number before reviewing.')
      return
    }
    const eventType = EVENT_TYPES.find((item) => item.value === data.get('eventType'))?.label
    const services = data
      .getAll('services')
      .map((value) => CORPORATE_SERVICES.find((item) => item.value === value)?.label)
      .filter(Boolean)
      .join(', ')
    setReview([
      { label: 'Planning', value: eventType },
      { label: 'Organisation', value: String(data.get('organisation') ?? '') },
      { label: 'Guests', value: String(data.get('expectedGuests') ?? '') },
      { label: 'Preferred date', value: String(data.get('preferredDate') ?? '') },
      { label: 'Location', value: String(data.get('location') ?? '') },
      { label: 'Services', value: services },
      { label: 'Contact', value: `${name} · ${email} · ${phone}` },
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

      <section hidden={step !== 0} aria-labelledby="corporate-brief-heading">
        <StepHeading
          ref={headingRef}
          id="corporate-brief-heading"
          eyebrow="Step 1 of 4"
          title="What are you planning?"
          description="Start with the occasion and the organisation behind it."
        />
        <div className="space-y-5">
          <Field label="Event or experience type" error={fieldErrors.eventType}>
            <select
              name="eventType"
              defaultValue={values.eventType ?? ''}
              aria-invalid={Boolean(fieldErrors.eventType)}
              className={inputCls(fieldErrors.eventType)}
            >
              <option value="" disabled>
                Select an event type
              </option>
              {EVENT_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Organisation" optional>
            <input
              name="organisation"
              defaultValue={values.organisation}
              placeholder="Company or group name"
              className={inputCls()}
            />
          </Field>
        </div>
        <FormNavigation onNext={continueFromBrief} />
      </section>

      <section hidden={step !== 1} aria-labelledby="corporate-requirements-heading">
        <StepHeading
          ref={headingRef}
          id="corporate-requirements-heading"
          eyebrow="Step 2 of 4"
          title="Shape the experience"
          description="Estimates are fine — they help us prepare a useful first proposal."
        />
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Expected guests" optional>
              <input type="number" name="expectedGuests" min={1} className={inputCls()} />
            </Field>
            <Field label="Preferred date" optional>
              <input type="date" name="preferredDate" className={inputCls()} />
            </Field>
            <Field label="Duration (days)" optional>
              <input type="number" name="durationDays" min={1} className={inputCls()} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location" optional>
              <input
                name="location"
                defaultValue={values.location}
                placeholder="e.g. Accra"
                className={inputCls()}
              />
            </Field>
            <Field label="Estimated budget" optional>
              <input
                name="budget"
                defaultValue={values.budget}
                placeholder="e.g. GHS 50,000"
                className={inputCls()}
              />
            </Field>
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-text-primary">
              Services you need
            </legend>
            <CheckboxChips name="services" options={CORPORATE_SERVICES} />
          </fieldset>
          <Field label="Anything else we should plan around?" optional>
            <textarea
              name="message"
              rows={4}
              defaultValue={values.message}
              className={inputCls()}
            />
          </Field>
        </div>
        <FormNavigation
          onBack={() => setStep(0)}
          onNext={() => {
            setLocalError(undefined)
            setStep(2)
          }}
        />
      </section>

      <section hidden={step !== 2} aria-labelledby="corporate-contact-heading">
        <StepHeading
          ref={headingRef}
          id="corporate-contact-heading"
          eyebrow="Step 3 of 4"
          title="Who should we contact?"
          description="We use these details only to respond to this proposal request and coordinate next steps."
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
          <Field label="Phone or WhatsApp" error={fieldErrors.phone} className="sm:col-span-2">
            <input
              name="phone"
              inputMode="tel"
              autoComplete="tel"
              defaultValue={values.phone}
              aria-invalid={Boolean(fieldErrors.phone)}
              className={inputCls(fieldErrors.phone)}
            />
          </Field>
        </div>
        <FormNavigation onBack={() => setStep(1)} onNext={continueFromContact} />
      </section>

      <section hidden={step !== 3} aria-labelledby="corporate-review-heading">
        <StepHeading
          ref={headingRef}
          id="corporate-review-heading"
          eyebrow="Step 4 of 4"
          title="Review your brief"
          description="Nothing is charged now. Trivoxo will review this and respond with questions or a tailored proposal."
        />
        <ReviewGrid items={review} />
        <FormNavigation
          onBack={() => setStep(2)}
          submitLabel="Send proposal request"
          pending={pending}
        />
      </section>
    </form>
  )
}
