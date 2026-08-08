'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { createCustomTripAction, type EnquiryState } from '@/app/actions/enquiries'
import { Button } from '@/components/ui/button'
import { Field, inputCls, CheckboxChips, CheckboxRow, SuccessPanel } from '@/components/forms/fields'
import { TRIP_INTERESTS } from '@/lib/enquiry-options'

const initial: EnquiryState = {}

export function CustomTripForm() {
  const [state, action, pending] = useActionState(createCustomTripAction, initial)
  const v = state.values ?? {}
  const fe = state.fieldErrors ?? {}

  if (state.success) {
    return (
      <SuccessPanel
        title="Request received 🎉"
        message="Thanks — we’ll craft a tailored itinerary around your interests and be in touch soon."
      />
    )
  }

  return (
    <form action={action} className="space-y-6">
      {state.error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="When are you visiting?" optional>
          <input name="visitDates" defaultValue={v.visitDates} placeholder="e.g. Mid-March 2027" className={inputCls()} />
        </Field>
        <Field label="Travellers" optional>
          <input type="number" name="travellers" min={1} className={inputCls()} />
        </Field>
        <Field label="Days" optional>
          <input type="number" name="days" min={1} className={inputCls()} />
        </Field>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-text-primary">What interests you?</p>
        <CheckboxChips name="interests" options={TRIP_INTERESTS} />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-text-primary">Do you need…</p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <CheckboxRow name="accommodation" label="Accommodation" />
          <CheckboxRow name="transport" label="Transport" />
          <CheckboxRow name="airportTransfer" label="Airport transfer" />
          <CheckboxRow name="privateGuide" label="Private guide" />
        </div>
      </div>

      <Field label="Budget" optional>
        <input name="budget" defaultValue={v.budget} placeholder="e.g. GHS 20,000" className={inputCls()} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Your name" error={fe.name}>
          <input name="name" defaultValue={v.name} className={inputCls(fe.name)} />
        </Field>
        <Field label="Email" error={fe.email}>
          <input type="email" name="email" defaultValue={v.email} className={inputCls(fe.email)} />
        </Field>
        <Field label="Phone" optional>
          <input name="phone" defaultValue={v.phone} className={inputCls()} />
        </Field>
      </div>

      <Field label="Anything else we should know?" optional>
        <textarea name="notes" rows={4} defaultValue={v.notes} className={inputCls()} />
      </Field>

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Sending…
          </>
        ) : (
          'Request my itinerary'
        )}
      </Button>
    </form>
  )
}
