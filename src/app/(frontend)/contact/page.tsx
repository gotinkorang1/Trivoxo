import type { Metadata } from 'next'
import { Phone, Mail, MapPin, MessageCircle, Instagram, Linkedin } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { PageHero } from '@/components/site/page-hero'
import { ButtonLink } from '@/components/ui/button'
import { CONTACT, SOCIALS, whatsappLink } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Trivoxo — call, WhatsApp or email us to plan your Ghana experience.',
}

export default function ContactPage() {
  const wa = whatsappLink('Hi Trivoxo, I have a question about your experiences.')
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let’s talk"
        description="Questions, bookings or a big idea for an event? We’re happy to help — WhatsApp is usually fastest."
        image={{ src: '/images/akosombo-riverfront.jpg', alt: 'The Akosombo riverfront on Volta Lake' }}
      />
      <Container className="py-12 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card icon={Phone} title="Call us" value={CONTACT.primaryPhone} href={`tel:${CONTACT.primaryPhone}`} />
          <Card icon={MessageCircle} title="WhatsApp" value="Chat with us" href={wa} external />
          <Card icon={Mail} title="Email" value={CONTACT.email} href={`mailto:${CONTACT.email}`} />
          <Card icon={MapPin} title="Visit" value={CONTACT.address} />
        </div>

        <div className="rounded-card border border-border bg-surface p-6">
          <h2 className="font-semibold text-text-primary">Prefer to message?</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Start a WhatsApp chat and a member of our team will get back to you shortly.
          </p>
          <ButtonLink href={wa} external className="mt-4 w-full">
            <MessageCircle className="size-4" /> Message on WhatsApp
          </ButtonLink>
          <div className="mt-6 border-t border-border pt-5">
            <p className="text-sm font-semibold text-text-primary">Follow along</p>
            <div className="mt-3 flex gap-3">
              <Social icon={Instagram} href={SOCIALS.instagram} label="Instagram" />
              <Social icon={Linkedin} href={SOCIALS.linkedin} label="LinkedIn" />
            </div>
          </div>
        </div>
      </div>
      </Container>
    </>
  )
}

function Card({
  icon: Icon,
  title,
  value,
  href,
  external,
}: {
  icon: typeof Phone
  title: string
  value: string
  href?: string
  external?: boolean
}) {
  const inner = (
    <>
      <span className="inline-flex size-11 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
        <Icon className="size-5" />
      </span>
      <div className="mt-3">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="mt-0.5 text-sm text-text-secondary">{value}</p>
      </div>
    </>
  )
  const cls = 'block rounded-card border border-border bg-surface-elevated p-5 transition-colors hover:border-brand-primary'
  if (!href) return <div className={cls}>{inner}</div>
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
  ) : (
    <a href={href} className={cls}>{inner}</a>
  )
}

function Social({ icon: Icon, href, label }: { icon: typeof Phone; href: string; label: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex size-11 items-center justify-center rounded-full border border-border text-text-secondary hover:border-brand-primary hover:text-brand-link"
    >
      <Icon className="size-4" />
    </a>
  )
}
