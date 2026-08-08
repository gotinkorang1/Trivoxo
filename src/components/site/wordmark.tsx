import { cn } from '@/lib/utils'

/**
 * Text wordmark echoing the Trivoxo logo colour split — "Tri" and "oxo" in
 * orange, the "v" in golden yellow. A CSS stand-in for the logo graphic; swap
 * for an <Image> of the vector logo once the asset file is in `public/`.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-display font-semibold tracking-tight', className)} aria-label="Trivoxo">
      <span className="text-brand-primary" aria-hidden>Tri</span>
      <span className="text-brand-secondary" aria-hidden>v</span>
      <span className="text-brand-primary" aria-hidden>oxo</span>
    </span>
  )
}
