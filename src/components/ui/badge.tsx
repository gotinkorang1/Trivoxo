import { cn } from '@/lib/utils'

const TONES: Record<string, string> = {
  bestseller: 'bg-brand-primary text-white',
  new: 'bg-brand-accent text-white',
  popular: 'bg-brand-secondary text-brand-navy',
  limited: 'bg-brand-navy text-white',
  neutral: 'bg-white/90 text-brand-navy',
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode
  tone?: keyof typeof TONES | string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
        TONES[tone] ?? TONES.neutral,
        className,
      )}
    >
      {children}
    </span>
  )
}
