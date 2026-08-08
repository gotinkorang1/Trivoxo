'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, User } from 'lucide-react'
import { PRIMARY_NAV } from '@/lib/constants'
import { Container } from '@/components/ui/container'
import { ButtonLink } from '@/components/ui/button'
import { Wordmark } from '@/components/site/wordmark'
import { cn } from '@/lib/utils'

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Trivoxo home">
          <Wordmark className="h-10 w-auto" priority />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-text-secondary transition-colors hover:text-brand-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/my-trips"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-brand-primary"
          >
            <User className="size-4" /> My Trips
          </Link>
          <ButtonLink href="/experiences" size="sm">
            Book an Experience
          </ButtonLink>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-text-primary lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </Container>

      {/* Mobile drawer */}
      <div className={cn('lg:hidden', open ? 'block' : 'hidden')}>
        <Container className="flex flex-col gap-1 border-t border-border py-4">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2.5 text-base font-medium text-text-primary hover:bg-surface"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-3 flex items-center gap-3">
            <ButtonLink href="/experiences" className="flex-1" onClick={() => setOpen(false)}>
              Book an Experience
            </ButtonLink>
            <ButtonLink href="/my-trips" variant="outline" onClick={() => setOpen(false)}>
              My Trips
            </ButtonLink>
          </div>
        </Container>
      </div>
    </header>
  )
}
