import { GROUP_DISCOUNT_TIERS, perPersonPrice } from '@/lib/policies'
import { formatPrice } from '@/lib/format'

/** Per-person price by group size (§33) — the group-discount ladder made
 * visible at booking time. Server-rendered from the "from" price. */
export function GroupPricingTable({ baseFrom }: { baseFrom: number }) {
  const rows = [
    { label: '2 travellers', size: 2, requestQuote: false },
    ...GROUP_DISCOUNT_TIERS.map((t) => ({
      label: t.maxGuests ? `${t.minGuests}–${t.maxGuests}` : `${t.minGuests}+`,
      size: t.minGuests,
      requestQuote: Boolean(t.requestQuote),
    })),
  ]

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Per person by group size</p>
      <dl className="mt-2 space-y-1.5 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3">
            <dt className="text-text-secondary">{r.label}</dt>
            <dd className="font-medium text-text-primary">
              {r.requestQuote ? 'Group quote' : formatPrice(perPersonPrice(baseFrom, r.size))}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-text-muted">Children (3–11) pay 60% of the adult rate; infants free.</p>
    </div>
  )
}
