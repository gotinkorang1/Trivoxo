import * as React from 'react'
import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-bold whitespace-nowrap transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-primary text-brand-navy shadow-[0_14px_30px_-15px_rgba(241,90,41,.9)] hover:-translate-y-0.5 hover:bg-brand-secondary hover:shadow-[0_18px_38px_-16px_rgba(249,178,51,.8)]',
        secondary: 'bg-brand-navy text-white shadow-soft hover:-translate-y-0.5 hover:bg-brand-navy-700',
        outline:
          'border border-border-strong bg-surface-elevated text-text-primary hover:-translate-y-0.5 hover:border-brand-primary hover:text-brand-link hover:shadow-soft',
        ghost: 'bg-transparent text-text-primary hover:bg-surface hover:text-brand-link',
        white: 'bg-white text-brand-navy shadow-lg hover:-translate-y-0.5 hover:bg-brand-secondary',
        glass:
          'border border-white/30 bg-white/10 text-white backdrop-blur-md hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/18',
      },
      size: {
        sm: 'min-h-11 px-4 text-sm',
        md: 'min-h-11 px-6 text-sm',
        lg: 'min-h-13 px-8 text-base',
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
