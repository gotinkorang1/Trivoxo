'use client'

import { useMemo, useState } from 'react'
import { CalendarClock, Check, MessageCircle, Minus, Plus } from 'lucide-react'
import type { TicketType } from '@/lib/data/events'
import type { EventStatus } from '@/lib/event-status'
import { formatPrice } from '@/lib/format'
import { whatsappLink } from '@/lib/constants'

type TicketReservationCardProps = {
  eventTitle: string
  eventDate: string
  eventStatus: EventStatus
  ticketTypes: TicketType[]
  now: string
}

function ticketAvailability(ticket: TicketType, now: number, eventStatus: EventStatus) {
  if (eventStatus === 'past') return { available: false, label: 'Event ended' }
  if (eventStatus === 'ongoing') return { available: false, label: 'Event in progress' }
  if (ticket.soldOut || ticket.quantity === 0) return { available: false, label: 'Sold out' }
  if (ticket.saleStart && Date.parse(ticket.saleStart) > now)
    return { available: false, label: 'Sales not open' }
  if (ticket.saleEnd && Date.parse(ticket.saleEnd) < now)
    return { available: false, label: 'Sales closed' }
  return { available: true, label: 'Available' }
}

export function TicketReservationCard({
  eventTitle,
  eventDate,
  eventStatus,
  ticketTypes,
  now,
}: TicketReservationCardProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const currentTime = Date.parse(now)

  const selected = useMemo(
    () =>
      ticketTypes
        .map((ticket) => ({ ticket, quantity: quantities[ticket.name] ?? 0 }))
        .filter((item) => item.quantity > 0),
    [quantities, ticketTypes],
  )
  const total = selected.reduce((sum, item) => sum + item.ticket.price * item.quantity, 0)

  const message = selected.length
    ? `Hi Trivoxo, I would like to reserve ${selected
        .map(({ ticket, quantity }) => `${quantity} × ${ticket.name}`)
        .join(
          ', ',
        )} for ${eventTitle} on ${eventDate}. Estimated total: ${formatPrice(total)}. Please confirm availability and payment instructions.`
    : `Hi Trivoxo, I would like ticket information for ${eventTitle} on ${eventDate}.`

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

  return (
    <div className="rounded-card border border-border bg-surface-elevated p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-link">
            Ticket reservation
          </p>
          <h2 className="mt-1 text-xl font-semibold text-text-primary">Choose your tickets</h2>
        </div>
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-link">
          <CalendarClock className="size-5" aria-hidden="true" />
        </span>
      </div>

      {eventStatus === 'past' && (
        <div className="mt-5 rounded-xl border border-border bg-surface p-4 text-sm text-text-secondary">
          This event has ended. You can still contact Trivoxo to ask about the next edition.
        </div>
      )}

      <ul className="mt-5 space-y-4">
        {ticketTypes.map((ticket) => {
          const availability = ticketAvailability(ticket, currentTime, eventStatus)
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
                  <div
                    className="flex items-center rounded-full border border-border bg-background p-1"
                    aria-label={`${ticket.name} quantity`}
                  >
                    <button
                      type="button"
                      onClick={() => change(ticket, -1)}
                      disabled={quantity === 0}
                      className="inline-flex size-9 items-center justify-center rounded-full text-text-primary transition hover:bg-surface disabled:opacity-35"
                      aria-label={`Remove one ${ticket.name} ticket`}
                    >
                      <Minus className="size-4" aria-hidden="true" />
                    </button>
                    <output
                      className="min-w-8 text-center text-sm font-bold text-text-primary"
                      aria-live="polite"
                    >
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

      {selected.length > 0 && (
        <div className="mt-5 rounded-xl bg-surface p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-text-secondary">Estimated total</span>
            <strong className="text-lg text-text-primary">{formatPrice(total)}</strong>
          </div>
          <p className="mt-2 flex items-start gap-2 text-xs text-text-muted">
            <Check className="mt-0.5 size-3.5 shrink-0 text-brand-accent" aria-hidden="true" />
            Trivoxo confirms stock and sends secure payment instructions before your reservation is
            final.
          </p>
        </div>
      )}

      <a
        href={whatsappLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-brand-primary px-6 text-base font-bold text-brand-navy transition hover:bg-brand-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        {selected.length > 0 ? 'Request this reservation' : 'Ask about this event'}
      </a>
      <p className="mt-3 text-center text-xs leading-relaxed text-text-muted">
        No payment is collected on this page. A WhatsApp message opens with your selection.
      </p>
    </div>
  )
}
