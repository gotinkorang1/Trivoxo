'use client'

import { useActionState } from 'react'
import { Loader2, Search } from 'lucide-react'
import { lookupTripAction, type TripLookupState } from '@/app/actions/trips'
import { Button } from '@/components/ui/button'
import { Field, inputCls } from '@/components/forms/fields'
import { TurnstileWidget } from '@/components/forms/turnstile-widget'

const initial: TripLookupState = {}

export function MyTripsForm() {
  const [state, action, pending] = useActionState(lookupTripAction, initial)
  const v = state.values ?? {}

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}
      <Field label="Booking reference">
        <input name="reference" defaultValue={v.reference} placeholder="TVX-26-XXXXX" className={inputCls()} />
      </Field>
      <Field label="Email">
        <input type="email" name="email" defaultValue={v.email} placeholder="you@example.com" className={inputCls()} />
      </Field>
      <TurnstileWidget action="trip_lookup" resetKey={state} />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Searching…
          </>
        ) : (
          <>
            <Search className="size-4" /> Find my trip
          </>
        )}
      </Button>
    </form>
  )
}
