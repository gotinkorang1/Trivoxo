'use client'

import { useState } from 'react'
import { callTwoFactor, TWO_FACTOR_ENFORCED } from './api'

function safeRedirect(): string {
  if (typeof window === 'undefined') return '/admin'
  const target = new URLSearchParams(window.location.search).get('redirect')
  return target && target.startsWith('/admin') ? target : '/admin'
}

/**
 * Custom admin sign-in used when 2FA is enforced. Replaces Payload's native
 * form (hidden via CSS): password first, then the authenticator code. The
 * session cookie is only issued by the server once the code verifies. When
 * enforcement is off this renders nothing and the native form is used.
 */
export function TwoFactorLogin() {
  const [step, setStep] = useState<'password' | 'code'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [challenge, setChallenge] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!TWO_FACTOR_ENFORCED) return null

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const res = await callTwoFactor<{ challenge?: string }>('/login', { email, password })
    setBusy(false)
    if (res.data.status === 'ok') {
      window.location.href = safeRedirect()
      return
    }
    if (res.data.status === '2fa' && res.data.challenge) {
      setChallenge(res.data.challenge)
      setStep('code')
      return
    }
    setError(res.data.error ?? 'Invalid email or password.')
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const res = await callTwoFactor('/verify', { challenge, code })
    setBusy(false)
    if (res.data.status === 'ok') {
      window.location.href = safeRedirect()
      return
    }
    setError(res.data.error ?? 'That code didn’t match. Try again.')
  }

  return (
    <div className="tvx-2fa-login">
      {/* Hide Payload's native email/password form; we own the flow here. */}
      <style>{`.login .login__form{display:none!important}`}</style>

      {step === 'password' ? (
        <form onSubmit={submitPassword} className="tvx-2fa__form">
          <label className="tvx-2fa__label">
            Email
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="tvx-2fa__input"
              required
            />
          </label>
          <label className="tvx-2fa__label">
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="tvx-2fa__input"
              required
            />
          </label>
          {error && <p className="tvx-2fa__error">{error}</p>}
          <button type="submit" className="tvx-2fa__btn" disabled={busy}>
            {busy ? 'Checking…' : 'Continue'}
          </button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- full nav into Payload's own route */}
          <a href="/admin/forgot" className="tvx-2fa__link">
            Forgot your password?
          </a>
        </form>
      ) : (
        <form onSubmit={submitCode} className="tvx-2fa__form">
          <p className="tvx-2fa__muted">
            Enter the 6-digit code from your authenticator app, or a recovery code.
          </p>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="tvx-2fa__input"
            aria-label="Authentication code"
            autoFocus
          />
          {error && <p className="tvx-2fa__error">{error}</p>}
          <button type="submit" className="tvx-2fa__btn" disabled={busy || code.length < 6}>
            {busy ? 'Verifying…' : 'Verify & sign in'}
          </button>
          <button
            type="button"
            className="tvx-2fa__link"
            onClick={() => {
              setStep('password')
              setCode('')
              setError(null)
            }}
          >
            ← Back
          </button>
        </form>
      )}
    </div>
  )
}
