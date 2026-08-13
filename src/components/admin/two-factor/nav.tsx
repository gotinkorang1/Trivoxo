'use client'

import Link from 'next/link'
import { useConfig } from '@payloadcms/ui'

/** Nav link to the Security view (rendered via admin.components.afterNavLinks). */
export function TwoFactorNavLink() {
  const { config } = useConfig()
  const adminRoute = config?.routes?.admin || '/admin'
  return (
    <Link
      href={`${adminRoute}/security`}
      className="nav__link"
      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
    >
      🔐 Security
    </Link>
  )
}
