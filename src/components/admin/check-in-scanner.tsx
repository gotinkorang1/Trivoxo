'use client'

import { useActionState, useEffect, useRef } from 'react'
import { checkInTicketAction, type CheckInState } from '@/app/actions/checkin'

const initial: CheckInState = {}

const TONE: Record<string, { bg: string; fg: string; label: string }> = {
  valid: { bg: '#137a4b', fg: '#ffffff', label: 'VALID' },
  already: { bg: '#b8860b', fg: '#ffffff', label: 'ALREADY CHECKED IN' },
  void: { bg: '#b02a2a', fg: '#ffffff', label: 'VOID' },
  not_found: { bg: '#b02a2a', fg: '#ffffff', label: 'NOT FOUND' },
  invalid: { bg: '#b02a2a', fg: '#ffffff', label: 'INVALID' },
  error: { bg: '#b02a2a', fg: '#ffffff', label: 'ERROR' },
}

export function CheckInScanner() {
  const [state, formAction, pending] = useActionState(checkInTicketAction, initial)
  const inputRef = useRef<HTMLInputElement>(null)

  // After each scan result, clear and refocus so a hardware scanner (which types
  // the token then presses Enter) can immediately scan the next ticket.
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.focus()
    }
  }, [state])

  const tone = state.result ? TONE[state.result] : undefined
  const when = state.detail?.checkedInAt
    ? new Date(state.detail.checkedInAt).toLocaleString('en-GB', { timeZone: 'Africa/Accra' })
    : undefined

  return (
    <div style={{ maxWidth: 560 }}>
      <form action={formAction}>
        <label
          htmlFor="checkin-code"
          style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}
        >
          Scan or enter ticket
        </label>
        <input
          id="checkin-code"
          name="code"
          ref={inputRef}
          autoFocus
          autoComplete="off"
          placeholder="Scan a QR code or type TVXE-XXXXX"
          style={{
            width: '100%',
            padding: '0.9rem 1rem',
            fontSize: '1.1rem',
            fontFamily: 'monospace',
            borderRadius: 8,
            border: '1px solid var(--theme-elevation-150)',
            background: 'var(--theme-input-bg, var(--theme-elevation-50))',
            color: 'var(--theme-text)',
          }}
        />
        <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center' }}>
          <input
            name="gate"
            placeholder="Gate / location (optional)"
            defaultValue=""
            style={{
              flex: 1,
              padding: '0.6rem 0.8rem',
              borderRadius: 8,
              border: '1px solid var(--theme-elevation-150)',
              background: 'var(--theme-elevation-50)',
              color: 'var(--theme-text)',
            }}
          />
          <button
            type="submit"
            disabled={pending}
            style={{
              padding: '0.65rem 1.4rem',
              borderRadius: 8,
              border: 'none',
              fontWeight: 700,
              cursor: pending ? 'default' : 'pointer',
              background: 'var(--theme-success-500, #137a4b)',
              color: '#fff',
              opacity: pending ? 0.7 : 1,
            }}
          >
            {pending ? 'Checking…' : 'Check in'}
          </button>
        </div>
      </form>

      {tone && (
        <div
          role="status"
          aria-live="assertive"
          style={{
            marginTop: 20,
            borderRadius: 12,
            padding: '1.25rem 1.5rem',
            background: tone.bg,
            color: tone.fg,
          }}
        >
          <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.02em' }}>{tone.label}</div>
          {state.message && <div style={{ marginTop: 4, opacity: 0.95 }}>{state.message}</div>}
          {state.detail && (
            <div style={{ marginTop: 12, fontSize: '0.95rem', lineHeight: 1.7 }}>
              {state.detail.attendee && (
                <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{state.detail.attendee}</div>
              )}
              {state.detail.ticketType && <div>{state.detail.ticketType}</div>}
              {state.detail.event && <div style={{ opacity: 0.9 }}>{state.detail.event}</div>}
              <div style={{ fontFamily: 'monospace', opacity: 0.9 }}>{state.detail.reference}</div>
              {when && state.result === 'already' && (
                <div style={{ marginTop: 4, opacity: 0.9 }}>First checked in: {when}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
