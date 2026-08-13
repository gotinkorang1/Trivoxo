'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, Mail, Menu, MessageCircle, Phone, User, X } from 'lucide-react'
import { PRIMARY_NAV, CONTACT, whatsappLink } from '@/lib/constants'
import { Container } from '@/components/ui/container'
import { ButtonLink } from '@/components/ui/button'
import { Wordmark } from '@/components/site/wordmark'
import { ThemeToggle } from '@/components/site/theme-toggle'
import { cn } from '@/lib/utils'

const MENU_ID = 'trivoxo-mobile-navigation'
/** Scroll distance before the bar starts auto-hiding, in px. */
const HIDE_AFTER = 140

export function Header() {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const lastY = useRef(0)
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  // Auto-hide on scroll down, reveal on scroll up or near the top.
  useEffect(() => {
    lastY.current = window.scrollY
    function onScroll() {
      const y = window.scrollY
      setScrolled(y > 8)
      const goingDown = y > lastY.current
      setHidden(goingDown && y > HIDE_AFTER)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu on Escape.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Close the mobile menu when a click lands outside the header.
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  // Collapse the menu once the layout grows to the desktop nav.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1280px)')
    function onChange(event: MediaQueryListEvent) {
      if (event.matches) setOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Lock body scroll while the mobile menu is open (DOM only, no state).
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      ref={headerRef}
      id="top"
      className={cn(
        'sticky top-0 z-50 border-b backdrop-blur-xl transition-[transform,background-color,box-shadow] duration-300 will-change-transform',
        scrolled
          ? 'border-border/70 bg-background/95 shadow-[0_10px_30px_-22px_rgba(0,0,0,.65)]'
          : 'border-border/60 bg-background/88 shadow-none',
        // Never hide while the mobile menu is open.
        !open && hidden ? '-translate-y-full' : 'translate-y-0',
      )}
    >
      <div
        className={cn(
          'hidden overflow-hidden border-b border-border/60 bg-brand-navy text-white transition-[max-height,opacity] duration-300 sm:block',
          scrolled ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100',
        )}
      >
        <Container className="flex min-h-11 items-center justify-between gap-6 text-[0.7rem] font-semibold tracking-wide">
          <p className="uppercase tracking-[0.18em] text-white/76">
            Ghanaian-owned <span className="mx-2 text-brand-secondary">•</span> Locally curated
          </p>
          <div className="flex items-center gap-5 text-white/76">
            <a className="inline-flex min-h-11 items-center gap-1.5 hover:text-brand-secondary" href={`tel:${CONTACT.primaryPhone}`}>
              <Phone className="size-3.5" aria-hidden="true" /> {CONTACT.primaryPhone}
            </a>
            <a
              className="inline-flex min-h-11 items-center gap-1.5 hover:text-brand-secondary"
              href={whatsappLink('Hi Trivoxo, I have a question.')}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="size-3.5" aria-hidden="true" /> WhatsApp
            </a>
            <a className="hidden min-h-11 items-center gap-1.5 hover:text-brand-secondary md:inline-flex" href={`mailto:${CONTACT.email}`}>
              <Mail className="size-3.5" aria-hidden="true" /> {CONTACT.email}
            </a>
          </div>
        </Container>
      </div>

      <Container className="flex h-[4.5rem] items-center justify-between gap-4">
        <Link href="/" aria-label="Trivoxo home" className="inline-flex min-h-11 shrink-0 items-center">
          <Wordmark className="h-9 w-auto sm:h-10" />
        </Link>

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary navigation">
          {PRIMARY_NAV.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-11 items-center rounded-full px-3.5 py-2 text-[0.82rem] font-semibold transition-all',
                  active
                    ? 'bg-surface text-brand-link'
                    : 'text-text-secondary hover:bg-surface hover:text-brand-link',
                )}
              >
                {item.label}
              </Link>
            )
          })}
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
              {PRIMARY_NAV.map((item, index) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group flex min-h-12 items-center justify-between rounded-xl px-4 py-3 font-semibold transition',
                      active
                        ? 'bg-surface text-brand-link'
                        : 'text-text-primary hover:bg-surface hover:text-brand-link',
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <span>
                      <span className="mr-3 text-xs font-bold text-text-muted">{String(index + 1).padStart(2, '0')}</span>
                      {item.label}
                    </span>
                    <ArrowUpRight className="size-4 opacity-45 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" aria-hidden="true" />
                  </Link>
                )
              })}
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
