'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { createCorporateEnquiryAction, type EnquiryState } from '@/app/actions/enquiries'
import { Button } from '@/components/ui/button'
import { Field, inputCls, CheckboxChips, SuccessPanel } from '@/components/forms/fields'
import { EVENT_TYPES, CORPORATE_SERVICES } from '@/lib/enquiry-options'

const initial: EnquiryState = {}

export function CorporateForm() {
  const [state, action, pending] = useActionState(createCorporateEnquiryAction, initial)
  const v = state.values ?? {}
  const fe = state.fieldErrors ?? {}

  if (state.success) {
    return (
      <SuccessPanel
        title="Enquiry received 🎉"
        message="Thanks — our events team will review your brief and get back to you shortly with next steps."
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

      <Field label="What are you planning?" error={fe.eventType}>
        <select name="eventType" defaultValue={v.eventType ?? ''} className={inputCls(fe.eventType)}>
          <option value="" disabled>
            Select an event type
          </option>
          {EVENT_TYPES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Organisation" optional>
          <input name="organisation" defaultValue={v.organisation} className={inputCls()} />
        </Field>
        <Field label="Location" optional>
          <input name="location" defaultValue={v.location} placeholder="e.g. Accra" className={inputCls()} />
        </Field>
      </div>

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

      <Field label="Estimated budget" optional>
        <input name="budget" defaultValue={v.budget} placeholder="e.g. GHS 50,000" className={inputCls()} />
      </Field>

      <div>
        <p className="mb-2 text-sm font-medium text-text-primary">Services you need</p>
        <CheckboxChips name="services" options={CORPORATE_SERVICES} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Your name" error={fe.name}>
          <input name="name" defaultValue={v.name} className={inputCls(fe.name)} />
        </Field>
        <Field label="Email" error={fe.email}>
          <input type="email" name="email" defaultValue={v.email} className={inputCls(fe.email)} />
        </Field>
        <Field label="Phone" error={fe.phone}>
          <input name="phone" defaultValue={v.phone} className={inputCls(fe.phone)} />
        </Field>
      </div>

      <Field label="Tell us more" optional>
        <textarea name="message" rows={4} defaultValue={v.message} className={inputCls()} />
      </Field>

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Sending…
          </>
        ) : (
          'Request a proposal'
        )}
      </Button>
    </form>
  )
}
