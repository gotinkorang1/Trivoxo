'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { createServiceRequestAction, type EnquiryState } from '@/app/actions/enquiries'
import type { ServiceField } from '@/lib/data/travel-services'
import { Field, inputCls, SuccessPanel } from '@/components/forms/fields'
import {
  FormNavigation,
  GuidedFormProgress,
  ReviewGrid,
  StepHeading,
} from '@/components/forms/guided-form'

const initial: EnquiryState = {}
const STEPS = ['Request', 'Contact', 'Review'] as const
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function ServiceRequestForm({
  serviceType,
  fields,
  submitLabel,
}: {
  serviceType: string
  fields: ServiceField[]
  submitLabel: string
}) {
  const [state, action, pending] = useActionState(createServiceRequestAction, initial)
  const [step, setStep] = useState(0)
  const [localError, setLocalError] = useState<string>()
  const [review, setReview] = useState<{ label: string; value?: string }[]>([])
  const formRef = useRef<HTMLFormElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const mounted = useRef(false)
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
        title="Request received"
        message="Thanks — our team will review the details and send you suitable options."
      />
    )
  }

  function formData() {
    return new FormData(formRef.current ?? undefined)
  }

  function continueFromRequest() {
    const data = formData()
    const missing = fields.find(
      (field) => field.required && !String(data.get(field.name) ?? '').trim(),
    )
    if (missing) {
      setLocalError(`Add ${missing.label.toLowerCase()} before you continue.`)
      return
    }
    setLocalError(undefined)
    setStep(1)
  }

  function continueFromContact() {
    const data = formData()
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    if (!name || !email || !EMAIL_RE.test(email)) {
      setLocalError('Add your name and a valid email address before reviewing.')
      return
    }
    const requestItems = fields.map((field) => {
      const value = String(data.get(field.name) ?? '')
      const display = field.options?.find((option) => option.value === value)?.label ?? value
      return { label: field.label, value: display }
    })
    setReview([
      ...requestItems,
      {
        label: 'Contact',
        value: `${name} · ${email}${data.get('phone') ? ` · ${data.get('phone')}` : ''}`,
      },
    ])
    setLocalError(undefined)
    setStep(2)
  }

  return (
    <form ref={formRef} action={action} noValidate>
      <input type="hidden" name="serviceType" value={serviceType} />
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
          eyebrow="Step 1 of 3"
          title="Your travel request"
          description="Required details are marked; the rest can be decided with the Trivoxo team."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <Field
              key={field.name}
              label={field.label}
              error={fieldErrors[field.name]}
              optional={!field.required}
              className={field.full ? 'sm:col-span-2' : undefined}
            >
              <ServiceInput field={field} error={fieldErrors[field.name]} />
            </Field>
          ))}
        </div>
        <FormNavigation onNext={continueFromRequest} />
      </section>

      <section hidden={step !== 1}>
        <StepHeading
          ref={headingRef}
          eyebrow="Step 2 of 3"
          title="Where should we send the options?"
          description="Submitting this request does not create a charge or confirmed booking."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={fieldErrors.name}>
            <input
              name="name"
              autoComplete="name"
              defaultValue={state.values?.name}
              aria-invalid={Boolean(fieldErrors.name)}
              className={inputCls(fieldErrors.name)}
            />
          </Field>
          <Field label="Email" error={fieldErrors.email}>
            <input
              type="email"
              name="email"
              autoComplete="email"
              defaultValue={state.values?.email}
              aria-invalid={Boolean(fieldErrors.email)}
              className={inputCls(fieldErrors.email)}
            />
          </Field>
          <Field label="Phone or WhatsApp" optional className="sm:col-span-2">
            <input
              name="phone"
              inputMode="tel"
              autoComplete="tel"
              defaultValue={state.values?.phone}
              className={inputCls()}
            />
          </Field>
        </div>
        <FormNavigation onBack={() => setStep(0)} onNext={continueFromContact} />
      </section>

      <section hidden={step !== 2}>
        <StepHeading
          ref={headingRef}
          eyebrow="Step 3 of 3"
          title="Review and send"
          description="Trivoxo will verify availability and pricing before asking you to confirm anything."
        />
        <ReviewGrid items={review} />
        <FormNavigation onBack={() => setStep(1)} submitLabel={submitLabel} pending={pending} />
      </section>
    </form>
  )
}

function ServiceInput({ field, error }: { field: ServiceField; error?: string }) {
  if (field.type === 'select') {
    return (
      <select
        name={field.name}
        defaultValue=""
        aria-invalid={Boolean(error)}
        className={inputCls(error)}
      >
        <option value="">Select…</option>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }
  if (field.type === 'textarea') {
    return (
      <textarea
        name={field.name}
        rows={3}
        placeholder={field.placeholder}
        aria-invalid={Boolean(error)}
        className={inputCls(error)}
      />
    )
  }
  return (
    <input
      type={field.type ?? 'text'}
      name={field.name}
      placeholder={field.placeholder}
      min={field.type === 'number' ? 0 : undefined}
      aria-invalid={Boolean(error)}
      className={inputCls(error)}
    />
  )
}
