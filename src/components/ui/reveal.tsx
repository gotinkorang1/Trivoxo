import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const style = {
    '--reveal-start': `${Math.min(delay * 30, 8)}%`,
  } as CSSProperties

  return (
    <div className={cn('reveal-on-scroll', className)} style={style}>
      {children}
    </div>
  )
}
