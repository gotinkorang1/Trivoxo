import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function SectionHeading({
  eyebrow,
  title,
  description,
  link,
}: {
  eyebrow?: string
  title: string
  description?: string
  link?: { href: string; label: string }
}) {
  return (
    <div className="mb-9 flex flex-wrap items-end justify-between gap-6 sm:mb-11">
      <div className="max-w-3xl">
        {eyebrow && (
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-link before:h-px before:w-7 before:bg-brand-primary">
            {eyebrow}
          </p>
        )}
        <h2 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">{title}</h2>
        {description && <p className="mt-4 max-w-2xl leading-relaxed text-text-secondary">{description}</p>}
      </div>
      {link && (
        <Link
          href={link.href}
          className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface-elevated px-5 text-sm font-bold text-brand-link shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-primary hover:shadow-soft"
        >
          {link.label} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  )
}
