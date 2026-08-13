import { CAPACITY, perPersonPrice } from '@/lib/policies'
import { formatPrice } from '@/lib/format'

/** Per-person adult price by group size — the group discount made visible at
 * booking time. Server-rendered from the "from" price. A single tier applies:
 * parties of 10+ save 5%. */
export function GroupPricingTable({ baseFrom }: { baseFrom: number }) {
  const rows = [
    { label: `${CAPACITY.minGuests}–9 travellers`, size: CAPACITY.minGuests },
    { label: `10–${CAPACITY.maxGuests} travellers`, size: 10 },
  ]

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
        Adult price per person
      </p>
      <dl className="mt-2 space-y-1.5 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3">
            <dt className="text-text-secondary">{r.label}</dt>
            <dd className="font-medium text-text-primary">
              {formatPrice(perPersonPrice(baseFrom, r.size))}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-text-muted">
        Children 6–12 pay 60% of the adult rate; under 5 travel free. Groups of{' '}
        {CAPACITY.minGuests}–{CAPACITY.maxGuests} book online.
      </p>
    </div>
  )
}
