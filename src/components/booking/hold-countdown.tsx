'use client'

import { useEffect, useState } from 'react'
import { Clock3 } from 'lucide-react'

export function HoldCountdown({ expiresAt }: { expiresAt: string }) {
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null)

  useEffect(() => {
    const update = () => {
      setSecondsRemaining(
        Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000)),
      )
    }
    update()
    const timer = window.setInterval(update, 1000)
    return () => window.clearInterval(timer)
  }, [expiresAt])

  const label =
    secondsRemaining === null
      ? 'Calculating hold time…'
      : secondsRemaining <= 0
        ? 'This seat hold has expired'
        : `Seats held for ${String(Math.floor(secondsRemaining / 60)).padStart(2, '0')}:${String(secondsRemaining % 60).padStart(2, '0')}`

  return (
    <p
      className={
        secondsRemaining === 0
          ? 'inline-flex items-center gap-2 font-semibold text-danger'
          : 'inline-flex items-center gap-2 font-semibold text-brand-link'
      }
      role="timer"
      aria-live={secondsRemaining === 0 ? 'polite' : 'off'}
    >
      <Clock3 className="size-4" /> {label}
    </p>
  )
}
