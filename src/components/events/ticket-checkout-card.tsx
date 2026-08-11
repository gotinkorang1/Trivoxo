'use client'

import { useActionState, useMemo, useState } from 'react'
import { CalendarClock, Loader2, Minus, Plus, ShieldCheck } from 'lucide-react'
import type { TicketType } from '@/lib/data/events'
import type { EventStatus } from '@/lib/event-status'
import { formatPrice } from '@/lib/format'
import { whatsappLink } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Field, inputCls } from '@/components/forms/fields'
import { createEventOrderAction, type EventOrderFormState } from '@/app/actions/event-order'

type Props = {
  eventSlug: string
  eventTitle: string
  eventDate: string
  eventStatus: EventStatus
  ticketTypes: TicketType[]
  now: string
}

const initial: EventOrderFormState = {}

function availabilityOf(ticket: TicketType, now: number, eventStatus: EventStatus) {
  if (eventStatus === 'past') return { available: false, label: 'Event ended' }
  if (eventStatus === 'ongoing') return { available: false, label: 'Event in progress' }
  if (ticket.soldOut || ticket.quantity === 0) return { available: false, label: 'Sold out' }
  if (ticket.saleStart && Date.parse(ticket.saleStart) > now)
    return { available: false, label: 'Sales not open' }
  if (ticket.saleEnd && Date.parse(ticket.saleEnd) < now)
    return { available: false, label: 'Sales closed' }
  return { available: true, label: 'Available' }
}

export function TicketCheckoutCard({
  eventSlug,
  eventTitle,
  eventDate,
  eventStatus,
  ticketTypes,
  now,
}: Props) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [state, formAction, pending] = useActionState(createEventOrderAction, initial)
  const currentTime = Date.parse(now)
  const fe = state.fieldErrors ?? {}
  const v = state.values ?? {}

  const selected = useMemo(
    () =>
      ticketTypes
        .map((ticket) => ({ ticket, quantity: quantities[ticket.name] ?? 0 }))
        .filter((item) => item.quantity > 0),
    [quantities, ticketTypes],
  )
  const total = selected.reduce((sum, item) => sum + item.ticket.price * item.quantity, 0)
  const selectionsJSON = JSON.stringify(
    selected.map(({ ticket, quantity }) => ({ ticketTypeName: ticket.name, quantity })),
  )
  const saleable = eventStatus === 'upcoming'

  function change(ticket: TicketType, delta: number) {
    const maximum = Math.max(
      1,
      Math.min(ticket.perOrderLimit ?? 10, ticket.quantity ?? Number.POSITIVE_INFINITY),
    )
    setQuantities((current) => ({
      ...current,
      [ticket.name]: Math.min(maximum, Math.max(0, (current[ticket.name] ?? 0) + delta)),
    }))
  }

  const askMessage = `Hi Trivoxo, I would like ticket information for ${eventTitle} on ${eventDate}.`

  return (
    <div className="rounded-card border border-border bg-surface-elevated p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-primary">Tickets</p>
          <h2 className="mt-1 text-xl font-semibold text-text-primary">Choose your tickets</h2>
        </div>
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
          <CalendarClock className="size-5" aria-hidden="true" />
        </span>
      </div>

      {!saleable && (
        <div className="mt-5 rounded-xl border border-border bg-surface p-4 text-sm text-text-secondary">
          {eventStatus === 'past'
            ? 'This event has ended. Contact Trivoxo to ask about the next edition.'
            : 'This event is in progress — online ticket sales are closed.'}
        </div>
      )}

      <ul className="mt-5 space-y-4">
        {ticketTypes.map((ticket) => {
          const availability = availabilityOf(ticket, currentTime, eventStatus)
          const quantity = quantities[ticket.name] ?? 0
          return (
            <li key={ticket.name} className="border-b border-border pb-4 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-text-primary">{ticket.name}</p>
                  <p className="mt-0.5 text-sm text-text-muted">{formatPrice(ticket.price)} each</p>
                  {!availability.available && (
                    <p className="mt-1 text-xs font-semibold text-danger">{availability.label}</p>
                  )}
                </div>
                {availability.available && (
                  <div className="flex items-center rounded-full border border-border bg-background p-1" aria-label={`${ticket.name} quantity`}>
                    <button
                      type="button"
                      onClick={() => change(ticket, -1)}
                      disabled={quantity === 0}
                      className="inline-flex size-9 items-center justify-center rounded-full text-text-primary transition hover:bg-surface disabled:opacity-35"
                      aria-label={`Remove one ${ticket.name} ticket`}
                    >
                      <Minus className="size-4" aria-hidden="true" />
                    </button>
                    <output className="min-w-8 text-center text-sm font-bold text-text-primary" aria-live="polite">
                      {quantity}
                    </output>
                    <button
                      type="button"
                      onClick={() => change(ticket, 1)}
                      className="inline-flex size-9 items-center justify-center rounded-full text-text-primary transition hover:bg-surface"
                      aria-label={`Add one ${ticket.name} ticket`}
                    >
                      <Plus className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {saleable ? (
        <form action={formAction} className="mt-5 space-y-4">
          <input type="hidden" name="eventSlug" value={eventSlug} />
          <input type="hidden" name="selections" value={selectionsJSON} />

          {selected.length > 0 && (
            <div className="rounded-xl bg-surface p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-text-secondary">Total</span>
                <strong className="text-lg text-text-primary">{formatPrice(total)}</strong>
              </div>
            </div>
          )}

          {state.error && (
            <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
              {state.error}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="First name" error={fe.firstName}>
              <input name="firstName" defaultValue={v.firstName} className={inputCls(fe.firstName)} />
            </Field>
            <Field label="Last name" error={fe.lastName}>
              <input name="lastName" defaultValue={v.lastName} className={inputCls(fe.lastName)} />
            </Field>
            <Field label="Email" error={fe.email}>
              <input type="email" name="email" defaultValue={v.email} className={inputCls(fe.email)} />
            </Field>
            <Field label="Phone" optional>
              <input name="phone" defaultValue={v.phone} className={inputCls()} />
            </Field>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={pending || selected.length === 0}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Reserving your tickets…
              </>
            ) : (
              'Continue to payment'
            )}
          </Button>
          <p className="flex items-start justify-center gap-2 text-center text-xs leading-5 text-text-muted">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-accent" />
            We hold your tickets for {20} minutes while you pay securely with Paystack.
          </p>
        </form>
      ) : (
        <a
          href={whatsappLink(askMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full border border-border px-6 text-base font-semibold text-text-primary transition hover:border-brand-primary"
        >
          Ask about this event
        </a>
      )}
    </div>
  )
}
