'use client'

import { ArrowUp } from 'lucide-react'

/**
 * Footer "back to top" control. Scrolls explicitly to the page top rather than
 * anchoring to an element — the header is `position: sticky`, so an #anchor
 * jump to it doesn't reliably reach y=0. Honours reduced-motion.
 */
export function BackToTop() {
  function toTop() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={toTop}
      className="group inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 font-medium text-white/70 transition hover:border-brand-secondary hover:text-brand-secondary"
    >
      Back to top
      <ArrowUp className="size-3.5 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
    </button>
  )
}
