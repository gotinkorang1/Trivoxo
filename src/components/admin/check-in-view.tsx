import { Gutter } from '@payloadcms/ui'
import type { AdminViewServerProps } from 'payload'
import type { User } from '@/payload-types'
import { CheckInScanner } from './check-in-scanner'

const ALLOWED = ['super-admin', 'operations', 'event-manager', 'checkin']

/** Custom admin view at /admin/check-in (§66). */
export function CheckInView({ user }: AdminViewServerProps) {
  const roles = (user as User | null)?.roles ?? []
  const authorized = roles.some((r) => ALLOWED.includes(r))

  return (
    <Gutter>
      <h1 style={{ marginBottom: 4 }}>Event check-in</h1>
      <p style={{ opacity: 0.7, marginBottom: 24 }}>
        Scan a ticket QR code — or type the reference — to admit a guest. Each ticket admits once.
      </p>
      {authorized ? (
        <CheckInScanner />
      ) : (
        <p style={{ color: 'var(--theme-error-500)' }}>
          You do not have permission to check in tickets.
        </p>
      )}
    </Gutter>
  )
}
