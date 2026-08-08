/** Formatting helpers. Trivoxo prices are in Ghanaian Cedi (GHS). */

const cedi = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  currencyDisplay: 'code',
  maximumFractionDigits: 0,
})

/**
 * Format an amount as "GHS 1,400".
 * Amounts are stored as whole Cedi in the catalogue (not pesewas/minor units).
 */
export function formatPrice(amount: number): string {
  // Intl renders "GHS 1,400" already with the `code` display; normalise spacing.
  return cedi.format(amount).replace(/ /g, ' ')
}

/** "From GHS 1,400" — used on cards where the price is a starting point. */
export function formatFromPrice(amount: number): string {
  return `From ${formatPrice(amount)}`
}

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function formatDate(date: Date | string): string {
  return dateFmt.format(typeof date === 'string' ? new Date(date) : date)
}

const dateTimeFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export function formatDateTime(date: Date | string): string {
  return dateTimeFmt.format(typeof date === 'string' ? new Date(date) : date)
}

/** Day number + short upper-case month, for calendar-style date blocks. */
export function dateParts(date: Date | string): { day: string; month: string } {
  const d = typeof date === 'string' ? new Date(date) : date
  return {
    day: new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(d),
    month: new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(d).toUpperCase(),
  }
}
