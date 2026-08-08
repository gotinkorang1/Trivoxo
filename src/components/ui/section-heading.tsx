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
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-primary">{eyebrow}</p>
        )}
        <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
        {description && <p className="mt-3 text-text-secondary">{description}</p>}
      </div>
      {link && (
        <Link
          href={link.href}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:gap-2.5 transition-all"
        >
          {link.label} <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  )
}
