'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { createServiceRequestAction, type EnquiryState } from '@/app/actions/enquiries'
import type { ServiceField } from '@/lib/data/travel-services'
import { Button } from '@/components/ui/button'
import { Field, inputCls, SuccessPanel } from '@/components/forms/fields'

const initial: EnquiryState = {}

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
  const fe = state.fieldErrors ?? {}

  if (state.success) {
    return (
      <SuccessPanel
        title="Request received 🎉"
        message="Thanks — our team will review your request and send you options shortly."
      />
    )
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="serviceType" value={serviceType} />
      {state.error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <Field key={f.name} label={f.label} optional className={f.full ? 'sm:col-span-2' : undefined}>
            <ServiceInput field={f} />
          </Field>
        ))}
      </div>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Your details</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Name" error={fe.name}>
            <input name="name" className={inputCls(fe.name)} />
          </Field>
          <Field label="Email" error={fe.email}>
            <input type="email" name="email" className={inputCls(fe.email)} />
          </Field>
          <Field label="Phone" optional>
            <input name="phone" className={inputCls()} />
          </Field>
        </div>
      </fieldset>

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Sending…
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  )
}

function ServiceInput({ field }: { field: ServiceField }) {
  if (field.type === 'select') {
    return (
      <select name={field.name} defaultValue="" className={inputCls()}>
        <option value="">Select…</option>
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    )
  }
  if (field.type === 'textarea') {
    return <textarea name={field.name} rows={3} placeholder={field.placeholder} className={inputCls()} />
  }
  return (
    <input
      type={field.type ?? 'text'}
      name={field.name}
      placeholder={field.placeholder}
      min={field.type === 'number' ? 0 : undefined}
      className={inputCls()}
    />
  )
}
