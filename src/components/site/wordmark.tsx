import Image from 'next/image'
import { cn } from '@/lib/utils'

export type LogoVariant = 'adaptive' | 'colored' | 'black' | 'white'

const LOGOS: Record<Exclude<LogoVariant, 'adaptive'>, string> = {
  colored: '/logo/colored.webp',
  black: '/logo/black.webp',
  white: '/logo/white.webp',
}

/**
 * Official Trivoxo wordmark.
 *
 * - `colored`: default on white and light neutral surfaces.
 * - `black`: monochrome use on very light or visually busy surfaces.
 * - `white`: reversed use on navy, photography and other dark surfaces.
 */
export function Wordmark({
  variant = 'adaptive',
  className,
  preload = false,
}: {
  variant?: LogoVariant
  className?: string
  preload?: boolean
}) {
  if (variant === 'adaptive') {
    return (
      <span className="inline-flex items-center">
        <Image
          src={LOGOS.colored}
          alt="Trivoxo"
          width={301}
          height={96}
          preload={preload}
          className={cn('h-auto w-auto object-contain dark:hidden', className)}
        />
        <Image
          src={LOGOS.white}
          alt=""
          width={301}
          height={96}
          preload={preload}
          className={cn('hidden h-auto w-auto object-contain dark:block', className)}
        />
      </span>
    )
  }

  return (
    <Image
      src={LOGOS[variant]}
      alt="Trivoxo"
      width={301}
      height={96}
      preload={preload}
      className={cn('h-auto w-auto object-contain', className)}
    />
  )
}
