import Link from 'next/link'
import { ArrowRight, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Wordmark } from '@/components/site/wordmark'
import { BRAND, CONTACT, SOCIALS } from '@/lib/constants'

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Explore',
    links: [
      { label: 'Experiences', href: '/experiences' },
      { label: 'Destinations', href: '/destinations' },
      { label: 'Events', href: '/events' },
      { label: 'Ghana Guide', href: '/guide' },
    ],
  },
  {
    title: 'Plan',
    links: [
      { label: 'Corporate & Groups', href: '/corporate' },
      { label: 'Custom Trips', href: '/custom-trips' },
      { label: 'Airport Transfer', href: '/travel-services/airport-transfers' },
      { label: 'Ticketing', href: '/travel-services/flights' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Safety', href: '/safety' },
      { label: 'FAQs', href: '/faqs' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'My Trips', href: '/my-trips' },
      { label: 'Booking Terms', href: '/booking-terms' },
      { label: 'Cancellation', href: '/cancellation-policy' },
      { label: 'Privacy', href: '/privacy-policy' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-brand-navy text-white">
      <div className="soft-grid absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="absolute -right-28 -top-36 size-96 rounded-full bg-brand-primary/10 blur-3xl" aria-hidden="true" />
      <Container className="relative py-14 sm:py-18">
        <div className="mb-14 flex flex-col gap-6 rounded-[1.75rem] border border-white/12 bg-white/[0.06] px-6 py-7 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-secondary">Ready when you are</p>
            <h2 className="mt-2 max-w-2xl text-2xl font-semibold text-white sm:text-3xl">
              Your next Ghana story starts with one conversation.
            </h2>
          </div>
          <Link
            href="/contact"
            className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-brand-primary px-6 font-bold text-brand-navy transition hover:-translate-y-0.5 hover:bg-brand-secondary"
          >
            Plan with us <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Wordmark variant="white" className="h-12 w-auto" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/72">
              {BRAND.tagline} Tours, events and travel support designed with care in Accra, Ghana.
            </p>
            <div className="mt-6 space-y-3 text-sm text-white/72">
              <a href={`tel:${CONTACT.primaryPhone}`} className="flex min-h-11 items-center gap-2 hover:text-brand-secondary">
                <Phone className="size-4" /> {CONTACT.primaryPhone}
              </a>
              <a href={`mailto:${CONTACT.email}`} className="flex min-h-11 items-center gap-2 hover:text-brand-secondary">
                <Mail className="size-4" /> {CONTACT.email}
              </a>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" /> {CONTACT.address}
              </p>
            </div>
            <div className="mt-5 flex gap-3">
              <a
                href={SOCIALS.instagram}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-11 items-center justify-center rounded-full border border-white/20 text-white/75 transition hover:-translate-y-0.5 hover:border-brand-secondary hover:text-brand-secondary"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href={SOCIALS.linkedin}
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-11 items-center justify-center rounded-full border border-white/20 text-white/75 transition hover:-translate-y-0.5 hover:border-brand-secondary hover:text-brand-secondary"
              >
                <Linkedin className="size-4" />
              </a>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-secondary">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="inline-flex min-h-11 min-w-11 items-center text-sm text-white/68 transition hover:translate-x-1 hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm text-white/55 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <p>{BRAND.domain}</p>
        </div>
      </Container>
    </footer>
  )
}
