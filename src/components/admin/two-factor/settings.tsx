'use client'

import { useState } from 'react'
import { useAuth } from '@payloadcms/ui'
import { TwoFactorEnroll } from './enroll'
import { callTwoFactor, TWO_FACTOR_ENFORCED } from './api'

/** Account security panel: set up, or turn off/reset, two-factor. */
export function TwoFactorSettings() {
  const { user } = useAuth()
  const enrolled = (user as { twoFactorEnabled?: boolean } | null)?.twoFactorEnabled
  const [mode, setMode] = useState<'idle' | 'enroll'>('idle')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (mode === 'enroll') {
    return (
      <div className="tvx-2fa__gate-card" style={{ boxShadow: 'none', padding: 0, border: 0 }}>
        <TwoFactorEnroll onDone={() => window.location.reload()} onCancel={() => setMode('idle')} />
      </div>
    )
  }

  async function disable(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const res = await callTwoFactor('/disable', { code })
    setBusy(false)
    if (res.ok && res.data.status === 'ok') {
      window.location.reload()
    } else {
      setError(res.data.error ?? 'Could not turn off two-factor.')
    }
  }

  if (enrolled) {
    return (
      <div className="tvx-2fa__panel">
        <p className="tvx-2fa__status">
          Two-factor is <strong>on</strong> for your account.
        </p>
        <p className="tvx-2fa__muted">
          {TWO_FACTOR_ENFORCED
            ? 'Two-factor is required for all staff. Turning it off will prompt you to set it up again before you can continue.'
            : 'Turn it off below, or reset it (turn off, then set up again) if you have a new phone.'}
        </p>
        <form onSubmit={disable} className="tvx-2fa__form">
          <label className="tvx-2fa__label">
            Enter a current code to confirm
            <input
              inputMode="numeric"
              placeholder="123456 or recovery code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="tvx-2fa__input"
              aria-label="Current code"
            />
          </label>
          {error && <p className="tvx-2fa__error">{error}</p>}
          <button
            type="submit"
            className="tvx-2fa__btn tvx-2fa__btn--ghost"
            disabled={busy || code.length < 6}
          >
            {busy ? 'Working…' : 'Turn off two-factor'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="tvx-2fa__panel">
      <p className="tvx-2fa__status">
        Two-factor is <strong>off</strong> for your account.
      </p>
      <p className="tvx-2fa__muted">
        Add a second step at sign-in with an authenticator app (Google Authenticator, Authy,
        1Password…). Strongly recommended for staff accounts.
      </p>
      <button type="button" className="tvx-2fa__btn" onClick={() => setMode('enroll')}>
        Set up two-factor
      </button>
    </div>
  )
}
