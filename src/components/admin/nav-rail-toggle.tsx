'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'tvx-nav-rail'

/**
 * Collapses the admin sidebar to an icon-only rail and back. The rail state is
 * a `data-nav-rail` attribute on <html> (CSS does the rest) and is remembered
 * per browser. Rendered at the top of the nav via admin.components.beforeNavLinks.
 */
export function NavRailToggle() {
  const [rail, setRail] = useState<boolean>(
    () => typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1',
  )

  // Effect only syncs the DOM to state — no setState, so no cascading renders.
  useEffect(() => {
    document.documentElement.toggleAttribute('data-nav-rail', rail)
  }, [rail])

  const toggle = () => {
    const next = !rail
    localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
    setRail(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="nav__link tvx-nav-rail-toggle"
      aria-label={rail ? 'Expand menu' : 'Collapse menu'}
      title={rail ? 'Expand menu' : 'Collapse menu'}
    >
      <svg
        className="tvx-nav-rail-toggle__icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16" />
        <path d={rail ? 'm14 9 3 3-3 3' : 'm16 9-3 3 3 3'} />
      </svg>
      <span className="nav__link-label">Collapse menu</span>
    </button>
  )
}
