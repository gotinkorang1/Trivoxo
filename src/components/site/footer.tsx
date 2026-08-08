import Link from 'next/link'
import { Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react'
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
    <footer className="mt-24 border-t border-border bg-surface">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Wordmark className="text-2xl" />
            <p className="mt-3 max-w-xs text-sm text-text-secondary">{BRAND.tagline}</p>
            <div className="mt-5 space-y-2 text-sm text-text-secondary">
              <a href={`tel:${CONTACT.primaryPhone}`} className="flex items-center gap-2 hover:text-brand-primary">
                <Phone className="size-4" /> {CONTACT.primaryPhone}
              </a>
              <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 hover:text-brand-primary">
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
                className="inline-flex size-9 items-center justify-center rounded-full border border-border text-text-secondary hover:border-brand-primary hover:text-brand-primary"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href={SOCIALS.linkedin}
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-9 items-center justify-center rounded-full border border-border text-text-secondary hover:border-brand-primary hover:text-brand-primary"
              >
                <Linkedin className="size-4" />
              </a>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-text-primary">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-text-secondary hover:text-brand-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-text-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <p>{BRAND.domain}</p>
        </div>
      </Container>
    </footer>
  )
}
