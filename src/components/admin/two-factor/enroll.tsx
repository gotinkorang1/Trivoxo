'use client'

import { useEffect, useState } from 'react'
import { callTwoFactor } from './api'

type Phase = 'loading' | 'scan' | 'verifying' | 'recovery' | 'error'

/**
 * Two-factor enrolment: shows a QR to scan, verifies a code, then reveals
 * one-time recovery codes. Used both by the mandatory gate and the settings
 * view. `onDone` fires once the user confirms they've stored their codes.
 */
export function TwoFactorEnroll({
  onDone,
  onCancel,
}: {
  onDone: () => void
  onCancel?: () => void
}) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [qr, setQr] = useState<string | null>(null)
  const [secret, setSecret] = useState<string>('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true
    callTwoFactor<{ qr: string; secret: string }>('/enroll/start').then((res) => {
      if (!active) return
      if (res.ok && res.data.qr) {
        setQr(res.data.qr)
        setSecret(res.data.secret)
        setPhase('scan')
      } else {
        setError(res.data.error ?? 'Could not start setup. Please try again.')
        setPhase('error')
      }
    })
    return () => {
      active = false
    }
  }, [])

  async function submitCode(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPhase('verifying')
    const res = await callTwoFactor<{ recoveryCodes: string[] }>('/enroll/verify', { code })
    if (res.ok && res.data.status === 'ok') {
      setRecoveryCodes(res.data.recoveryCodes ?? [])
      setPhase('recovery')
    } else {
      setError(res.data.error ?? 'That code didn’t match. Try again.')
      setPhase('scan')
    }
  }

  if (phase === 'loading') {
    return <p className="tvx-2fa__muted">Preparing your setup…</p>
  }

  if (phase === 'error') {
    return (
      <div>
        <p className="tvx-2fa__error">{error}</p>
        {onCancel && (
          <button type="button" className="tvx-2fa__btn tvx-2fa__btn--ghost" onClick={onCancel}>
            Close
          </button>
        )}
      </div>
    )
  }

  if (phase === 'recovery') {
    return (
      <div className="tvx-2fa__panel">
        <h2 className="tvx-2fa__title">Save your recovery codes</h2>
        <p className="tvx-2fa__muted">
          Store these somewhere safe. Each code works once if you ever lose your authenticator app.
          They won’t be shown again.
        </p>
        <ul className="tvx-2fa__codes">
          {recoveryCodes.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <button
          type="button"
          className="tvx-2fa__btn tvx-2fa__btn--ghost"
          onClick={() => navigator.clipboard?.writeText(recoveryCodes.join('\n'))}
        >
          Copy codes
        </button>
        <label className="tvx-2fa__check">
          <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
          I’ve saved my recovery codes
        </label>
        <button
          type="button"
          className="tvx-2fa__btn"
          disabled={!saved}
          onClick={onDone}
        >
          Finish
        </button>
      </div>
    )
  }

  // phase === 'scan' | 'verifying'
  return (
    <div className="tvx-2fa__panel">
      <h2 className="tvx-2fa__title">Set up two-factor authentication</h2>
      <ol className="tvx-2fa__steps">
        <li>Open your authenticator app (Google Authenticator, Authy, 1Password…).</li>
        <li>Scan this QR code, or enter the key manually.</li>
        <li>Type the 6-digit code it shows to confirm.</li>
      </ol>
      {qr && (
        // eslint-disable-next-line @next/next/no-img-element -- inline data-URI QR, not an optimizable asset
        <img src={qr} alt="Two-factor QR code" className="tvx-2fa__qr" width={180} height={180} />
      )}
      {secret && (
        <p className="tvx-2fa__secret">
          <span>Manual key</span>
          <code>{secret}</code>
        </p>
      )}
      <form onSubmit={submitCode} className="tvx-2fa__form">
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          className="tvx-2fa__input"
          aria-label="6-digit code"
        />
        {error && <p className="tvx-2fa__error">{error}</p>}
        <button type="submit" className="tvx-2fa__btn" disabled={phase === 'verifying' || code.length !== 6}>
          {phase === 'verifying' ? 'Verifying…' : 'Confirm'}
        </button>
      </form>
      {onCancel && (
        <button type="button" className="tvx-2fa__btn tvx-2fa__btn--ghost" onClick={onCancel}>
          Cancel
        </button>
      )}
    </div>
  )
}
