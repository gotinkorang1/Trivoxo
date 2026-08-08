import * as React from 'react'
import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-brand-primary text-white hover:bg-brand-primary-hover',
        secondary: 'bg-brand-navy text-white hover:bg-brand-navy-700',
        outline: 'border border-border-strong bg-transparent text-text-primary hover:bg-surface',
        ghost: 'bg-transparent text-text-primary hover:bg-surface',
        white: 'bg-white text-brand-navy hover:bg-white/90',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-sm',
        lg: 'h-13 px-8 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

type ButtonBaseProps = VariantProps<typeof buttonVariants> & { className?: string }

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonBaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

export function ButtonLink({
  className,
  variant,
  size,
  href,
  external,
  ...props
}: ButtonBaseProps & { href: string; external?: boolean } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const classes = cn(buttonVariants({ variant, size }), className)
  if (external) {
    return <a className={classes} href={href} target="_blank" rel="noopener noreferrer" {...props} />
  }
  return <Link className={classes} href={href} {...props} />
}

export { buttonVariants }
