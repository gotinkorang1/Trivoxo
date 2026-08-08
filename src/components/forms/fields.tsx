import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function inputCls(error?: string) {
  return cn(
    'min-h-11 w-full rounded-xl border bg-background px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20',
    error ? 'border-danger' : 'border-border',
  )
}

export function Field({
  label,
  error,
  optional,
  className,
  children,
}: {
  label: string
  error?: string
  optional?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 flex items-center justify-between text-sm font-medium text-text-primary">
        {label}
        {optional && <span className="text-xs font-normal text-text-muted">Optional</span>}
        {error && (
          <span className="text-xs font-normal text-danger" role="alert">
            {error}
          </span>
        )}
      </span>
      {children}
    </label>
  )
}

/** Accessible multi-select rendered as toggle chips backed by checkboxes. */
export function CheckboxChips({
  name,
  options,
}: {
  name: string
  options: readonly { value: string; label: string }[]
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <label
          key={o.value}
          className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-border bg-background px-3.5 py-1.5 text-sm text-text-secondary transition-colors has-[:checked]:border-brand-primary has-[:checked]:bg-brand-primary-soft has-[:checked]:text-brand-link hover:border-border-strong focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-primary"
        >
          <input type="checkbox" name={name} value={o.value} className="sr-only" />
          {o.label}
        </label>
      ))}
    </div>
  )
}

export function CheckboxRow({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-background px-3 text-sm text-text-secondary transition hover:border-border-strong focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-primary">
      <input
        type="checkbox"
        name={name}
        className="size-4 rounded border-border-strong text-brand-primary accent-brand-primary"
      />
      {label}
    </label>
  )
}

export function SuccessPanel({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-card border border-brand-accent/30 bg-brand-accent-soft p-8 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-accent text-white">
        <CheckCircle2 className="size-7" />
      </span>
      <p className="mt-4 text-xl font-semibold text-text-primary">{title}</p>
      <p className="mt-2 text-text-secondary">{message}</p>
    </div>
  )
}
