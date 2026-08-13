'use client'

import { useAuth } from '@payloadcms/ui'
import { TWO_FACTOR_ENFORCED } from './api'
import { TwoFactorEnroll } from './enroll'

/**
 * Wraps the admin. When enforcement is on and the signed-in user hasn't set up
 * two-factor yet, the whole panel is replaced by a mandatory enrolment screen —
 * they can't use anything else until they finish.
 */
export function TwoFactorGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const enrolled = (user as { twoFactorEnabled?: boolean } | null)?.twoFactorEnabled
  const mustEnroll = TWO_FACTOR_ENFORCED && Boolean(user) && !enrolled

  if (mustEnroll) {
    return (
      <div className="tvx-2fa__gate">
        <div className="tvx-2fa__gate-card">
          <p className="tvx-2fa__eyebrow">Security · required</p>
          <TwoFactorEnroll onDone={() => window.location.reload()} />
        </div>
      </div>
    )
  }

  return <>{children}</>
}
