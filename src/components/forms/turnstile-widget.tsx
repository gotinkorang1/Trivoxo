'use client'

import Script from 'next/script'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { TurnstileAction } from '@/lib/turnstile'
import { cn } from '@/lib/utils'

type WidgetID = string

type TurnstileAPI = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string
      action: string
      theme: 'auto'
      responseField: boolean
      callback: (token: string) => void
      'expired-callback': () => void
      'error-callback': () => void
    },
  ) => WidgetID
  remove: (widget: WidgetID) => void
  reset: (widget: WidgetID) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileAPI
  }
}

export function TurnstileWidget({
  action,
  resetKey,
  className,
  defer = false,
}: {
  action: TurnstileAction
  resetKey?: unknown
  className?: string
  defer?: boolean
}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<WidgetID | null>(null)
  const previousResetKey = useRef(resetKey)
  const [token, setToken] = useState('')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const renderWidget = useCallback(() => {
    if (!siteKey || !containerRef.current || !window.turnstile || widgetRef.current) return
    widgetRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action,
      theme: 'auto',
      responseField: false,
      callback: (value) => {
        setToken(value)
        setStatus('ready')
      },
      'expired-callback': () => {
        setToken('')
        setStatus('loading')
      },
      'error-callback': () => {
        setToken('')
        setStatus('error')
      },
    })
  }, [action, siteKey])

  useEffect(() => {
    return () => {
      if (widgetRef.current && window.turnstile) window.turnstile.remove(widgetRef.current)
      widgetRef.current = null
    }
  }, [])

  useEffect(() => {
    if (previousResetKey.current === resetKey) return
    previousResetKey.current = resetKey
    setToken('')
    setStatus('loading')
    if (widgetRef.current && window.turnstile) window.turnstile.reset(widgetRef.current)
  }, [resetKey])

  if (!siteKey) {
    if (process.env.NODE_ENV !== 'production') return null
    return (
      <p className={cn('text-sm font-semibold text-danger', className)} role="alert">
        Security verification is temporarily unavailable.
      </p>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Script
        id="cloudflare-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy={defer ? 'lazyOnload' : 'afterInteractive'}
        onLoad={renderWidget}
        onReady={renderWidget}
      />
      <div
        ref={containerRef}
        className="min-h-[65px] max-w-full overflow-hidden"
        role="group"
        aria-label="Security verification"
      />
      <input type="hidden" name="cf-turnstile-response" value={token} />
      <p className="text-xs leading-5 text-text-muted" aria-live="polite">
        {status === 'error'
          ? 'The security check could not load. Refresh the page and try again.'
          : token
            ? 'Security check complete.'
            : 'Protected by Cloudflare Turnstile.'}
      </p>
    </div>
  )
}
