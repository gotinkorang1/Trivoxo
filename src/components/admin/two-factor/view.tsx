import { Gutter } from '@payloadcms/ui'
import type { AdminViewServerProps } from 'payload'
import { TwoFactorSettings } from './settings'

/** Custom admin view at /admin/security. */
export function TwoFactorSecurityView(_props: AdminViewServerProps) {
  return (
    <Gutter>
      <h1 style={{ marginBottom: 4 }}>Security</h1>
      <p style={{ opacity: 0.7, marginBottom: 24 }}>
        Manage two-factor authentication for your account.
      </p>
      <div style={{ maxWidth: 460 }}>
        <TwoFactorSettings />
      </div>
    </Gutter>
  )
}
