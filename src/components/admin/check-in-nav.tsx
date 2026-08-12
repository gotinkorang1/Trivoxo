'use client'

import Link from 'next/link'
import { useConfig } from '@payloadcms/ui'

/** Nav link to the custom check-in view (rendered via admin.components.afterNavLinks). */
export function CheckInNavLink() {
  const { config } = useConfig()
  const adminRoute = config?.routes?.admin || '/admin'
  return (
    <Link
      href={`${adminRoute}/check-in`}
      className="nav__link"
      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
    >
      🎟️ Event check-in
    </Link>
  )
}
