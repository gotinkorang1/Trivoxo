'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { createBookingAction, type BookingFormState } from '@/app/actions/booking'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const initialState: BookingFormState = {}

export function BookingForm({ slug, minDate }: { slug: string; minDate: string }) {
  const [state, formAction, pending] = useActionState(createBookingAction, initialState)
  const v = state.values ?? {}
  const fe = state.fieldErrors ?? {}

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="slug" value={slug} />

      {state.error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}

      <Fieldset legend="Your trip">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Date" error={fe.date} className="sm:col-span-1">
            <input
              type="date"
              name="date"
              min={minDate}
              defaultValue={v.date}
              className={inputCls(fe.date)}
            />
          </Field>
          <Field label="Adults" className="sm:col-span-1">
            <select name="adults" defaultValue="2" className={inputCls()}>
              {Array.from({ length: 15 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </Field>
          <Field label="Children" className="sm:col-span-1">
            <select name="children" defaultValue="0" className={inputCls()}>
              {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </Field>
        </div>
      </Fieldset>

      <Fieldset legend="Your details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" error={fe.firstName}>
            <input name="firstName" defaultValue={v.firstName} className={inputCls(fe.firstName)} />
          </Field>
          <Field label="Last name" error={fe.lastName}>
            <input name="lastName" defaultValue={v.lastName} className={inputCls(fe.lastName)} />
          </Field>
          <Field label="Email" error={fe.email}>
            <input type="email" name="email" defaultValue={v.email} className={inputCls(fe.email)} />
          </Field>
          <Field label="Phone / WhatsApp" error={fe.phone}>
            <input name="phone" defaultValue={v.phone} className={inputCls(fe.phone)} />
          </Field>
          <Field label="Country" optional>
            <input name="country" defaultValue={v.country} className={inputCls()} />
          </Field>
          <Field label="Pickup location" optional>
            <input name="pickup" defaultValue={v.pickup} className={inputCls()} />
          </Field>
        </div>
        <Field label="Special requests" optional className="mt-4">
          <textarea name="specialRequest" rows={3} defaultValue={v.specialRequest} className={inputCls()} />
        </Field>
      </Fieldset>

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Submitting…
          </>
        ) : (
          'Request this experience'
        )}
      </Button>
      <p className="text-center text-xs text-text-muted">
        You won’t be charged now. We’ll confirm availability and share secure payment details.
      </p>
    </form>
  )
}

function inputCls(error?: string) {
  return cn(
    'w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-brand-primary',
    error ? 'border-danger' : 'border-border',
  )
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">{legend}</legend>
      {children}
    </fieldset>
  )
}

function Field({
  label,
  error,
  optional,
  className,
  children,
}: {
  label: string
  error?: string
  optional?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 flex items-center justify-between text-sm font-medium text-text-primary">
        {label}
        {optional && <span className="text-xs font-normal text-text-muted">Optional</span>}
        {error && <span className="text-xs font-normal text-danger">{error}</span>}
      </span>
      {children}
    </label>
  )
}
