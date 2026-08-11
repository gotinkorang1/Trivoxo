'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Mail, Menu, Phone, User, X } from 'lucide-react'
import { PRIMARY_NAV, CONTACT } from '@/lib/constants'
import { Container } from '@/components/ui/container'
import { ButtonLink } from '@/components/ui/button'
import { Wordmark } from '@/components/site/wordmark'
import { ThemeToggle } from '@/components/site/theme-toggle'
import { cn } from '@/lib/utils'

const MENU_ID = 'trivoxo-mobile-navigation'

export function Header() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/88 shadow-[0_8px_30px_-24px_rgba(0,0,0,.55)] backdrop-blur-xl">
      <div className="hidden border-b border-border/60 bg-brand-navy text-white sm:block">
        <Container className="flex min-h-11 items-center justify-between gap-6 text-[0.7rem] font-semibold tracking-wide">
          <p className="uppercase tracking-[0.18em] text-white/76">
            Ghanaian-owned <span className="mx-2 text-brand-secondary">•</span> Locally curated
          </p>
          <div className="flex items-center gap-5 text-white/76">
            <a className="inline-flex min-h-11 items-center gap-1.5 hover:text-brand-secondary" href={`tel:${CONTACT.primaryPhone}`}>
              <Phone className="size-3.5" aria-hidden="true" /> {CONTACT.primaryPhone}
            </a>
            <a className="hidden min-h-11 items-center gap-1.5 hover:text-brand-secondary md:inline-flex" href={`mailto:${CONTACT.email}`}>
              <Mail className="size-3.5" aria-hidden="true" /> {CONTACT.email}
            </a>
          </div>
        </Container>
      </div>

      <Container className="flex h-[4.5rem] items-center justify-between gap-4">
        <Link href="/" aria-label="Trivoxo home" className="inline-flex min-h-11 shrink-0 items-center">
          <Wordmark className="h-9 w-auto sm:h-10" priority />
        </Link>

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary navigation">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center rounded-full px-3.5 py-2 text-[0.82rem] font-semibold text-text-secondary transition-all hover:bg-surface hover:text-brand-link"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 xl:flex">
          <ThemeToggle />
          <Link
            href="/my-trips"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-text-secondary hover:bg-surface hover:text-brand-link"
          >
            <User className="size-4" aria-hidden="true" /> My Trips
          </Link>
          <ButtonLink href="/experiences" size="sm">
            Book now <ArrowUpRight className="size-4" aria-hidden="true" />
          </ButtonLink>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-surface-elevated text-text-primary shadow-sm transition hover:border-brand-primary hover:text-brand-link"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls={MENU_ID}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </Container>

      <div
        id={MENU_ID}
        aria-hidden={!open}
        inert={!open ? true : undefined}
        className={cn(
          'grid overflow-hidden border-border bg-background transition-[grid-template-rows,border-color] duration-300 xl:hidden',
          open ? 'grid-rows-[1fr] border-t' : 'grid-rows-[0fr] border-transparent',
        )}
      >
        <div className="min-h-0">
          <Container className="py-4">
            <nav className="grid gap-1 sm:grid-cols-2" aria-label="Mobile navigation">
              {PRIMARY_NAV.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex min-h-12 items-center justify-between rounded-xl px-4 py-3 font-semibold text-text-primary transition hover:bg-surface hover:text-brand-link"
                  onClick={() => setOpen(false)}
                >
                  <span>
                    <span className="mr-3 text-xs font-bold text-text-muted">{String(index + 1).padStart(2, '0')}</span>
                    {item.label}
                  </span>
                  <ArrowUpRight className="size-4 opacity-45 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" aria-hidden="true" />
                </Link>
              ))}
            </nav>
            <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
              <ButtonLink href="/experiences" onClick={() => setOpen(false)}>
                Book an Experience
              </ButtonLink>
              <ButtonLink href="/my-trips" variant="outline" onClick={() => setOpen(false)}>
                <User className="size-4" aria-hidden="true" /> My Trips
              </ButtonLink>
            </div>
          </Container>
        </div>
      </div>
    </header>
  )
}
