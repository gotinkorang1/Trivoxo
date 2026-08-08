import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function GuidedFormProgress({
  steps,
  current,
}: {
  steps: readonly string[]
  current: number
}) {
  return (
    <nav aria-label="Form progress" className="mb-8">
      <ol
        className="grid gap-1.5 sm:gap-3"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        {steps.map((label, index) => {
          const complete = index < current
          const active = index === current
          return (
            <li key={label} className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span
                  className={cn(
                    'inline-flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors',
                    complete && 'border-brand-accent bg-brand-accent text-white',
                    active && 'border-brand-primary bg-brand-primary text-brand-navy',
                    !complete && !active && 'border-border bg-surface text-text-muted',
                  )}
                  aria-current={active ? 'step' : undefined}
                >
                  {complete ? <Check className="size-4" aria-hidden="true" /> : index + 1}
                </span>
                <span
                  className={cn(
                    'hidden truncate text-xs font-semibold sm:block',
                    active ? 'text-text-primary' : 'text-text-muted',
                  )}
                >
                  {label}
                </span>
              </div>
              <span
                className={cn(
                  'mt-2 block h-1 rounded-full',
                  index <= current ? 'bg-brand-primary' : 'bg-surface-strong',
                )}
                aria-hidden="true"
              />
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function StepHeading({
  ref,
  id,
  eyebrow,
  title,
  description,
}: {
  ref?: React.Ref<HTMLHeadingElement>
  id?: string
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <header className="mb-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-link">{eyebrow}</p>
      <h3
        id={id}
        ref={ref}
        tabIndex={-1}
        className="mt-2 text-2xl font-semibold text-text-primary outline-none"
      >
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{description}</p>
    </header>
  )
}

export function FormNavigation({
  onBack,
  onNext,
  submitLabel,
  pending,
}: {
  onBack?: () => void
  onNext?: () => void
  submitLabel?: string
  pending?: boolean
}) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
      {onBack ? (
        <Button type="button" variant="ghost" onClick={onBack} className="w-full sm:w-auto">
          <ArrowLeft className="size-4" aria-hidden="true" /> Back
        </Button>
      ) : (
        <span />
      )}
      {onNext ? (
        <Button type="button" size="lg" onClick={onNext} className="w-full sm:w-auto">
          Continue <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      ) : (
        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
          {pending ? 'Sending…' : submitLabel}
        </Button>
      )}
    </div>
  )
}

export function ReviewGrid({ items }: { items: { label: string; value?: string }[] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items
        .filter((item) => item.value)
        .map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-surface p-4">
            <dt className="text-xs font-bold uppercase tracking-wide text-text-muted">
              {item.label}
            </dt>
            <dd className="mt-1 break-words text-sm font-semibold text-text-primary">
              {item.value}
            </dd>
          </div>
        ))}
    </dl>
  )
}
