import { Gutter } from '@payloadcms/ui'
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Compass,
  ExternalLink,
  FileText,
  MailWarning,
  MessageSquareMore,
  Plus,
  Sparkles,
  TicketCheck,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { AdminViewServerProps, Payload } from 'payload'

import type { User } from '@/payload-types'

type StaffRole = User['roles'][number]
type Tone = 'brand' | 'gold' | 'green' | 'navy' | 'purple'

type DashboardMetric = {
  helper: string
  icon: LucideIcon
  label: string
  tone: Tone
  value: string
}

type DashboardTask = {
  description: string
  href: string
  icon: LucideIcon
  label: string
  tone: 'danger' | 'warning' | 'info'
  value: number
}

type DepartureSummary = {
  booked: number
  capacity: number
  id: number | string
  startsAt: string
  title: string
}

type OperationsData = {
  bookingsToday: number
  departuresToday: number
  emailFailures: number
  inventoryReviews: number
  paymentReviews: number
  revenueToday: number
  travellersToday: number
  upcomingDepartures: DepartureSummary[]
}

type EnquiryData = {
  corporate: number
  customTrips: number
  travelServices: number
}

type ContentData = {
  draftExperiences: number
  publishedExperiences: number
  publishedGuides: number
}

const ROLE_LABELS: Record<StaffRole, string> = {
  'super-admin': 'Super Admin',
  operations: 'Operations Manager',
  'content-editor': 'Content Editor',
  'event-manager': 'Event Manager',
  finance: 'Finance',
  checkin: 'Check-in Staff',
}

const numberFormatter = new Intl.NumberFormat('en-GH')
const currencyFormatter = new Intl.NumberFormat('en-GH', {
  maximumFractionDigits: 0,
})

function hasAnyRole(roles: StaffRole[], ...allowed: StaffRole[]) {
  return roles.includes('super-admin') || allowed.some((role) => roles.includes(role))
}

function getRelationshipID(value: unknown): number | string | undefined {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    return typeof id === 'number' || typeof id === 'string' ? id : undefined
  }
  return undefined
}

function getRelationshipTitle(value: unknown): string {
  if (value && typeof value === 'object' && 'title' in value) {
    const title = (value as { title?: unknown }).title
    if (typeof title === 'string' && title.trim()) return title
  }
  return 'Experience departure'
}

function ghanaDayBounds() {
  // Ghana remains on UTC throughout the year, so UTC day boundaries are the
  // business-day boundaries used for dashboard reporting.
  const start = new Date()
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 1)
  const inSevenDays = new Date(start)
  inSevenDays.setUTCDate(inSevenDays.getUTCDate() + 7)
  return { end, inSevenDays, start }
}

async function loadOperationsData(
  payload: Payload,
  start: Date,
  end: Date,
  inSevenDays: Date,
): Promise<OperationsData> {
  const [
    departuresToday,
    bookingsToday,
    upcomingDepartures,
    successfulPayments,
    paymentReviews,
    inventoryReviews,
    emailFailures,
  ] = await Promise.all([
    payload.find({
      collection: 'departures',
      depth: 0,
      limit: 500,
      where: {
        and: [
          { startsAt: { greater_than_equal: start.toISOString() } },
          { startsAt: { less_than: end.toISOString() } },
          { status: { equals: 'scheduled' } },
        ],
      },
    }),
    payload.count({
      collection: 'bookings',
      where: { createdAt: { greater_than_equal: start.toISOString() } },
    }),
    payload.find({
      collection: 'departures',
      depth: 1,
      limit: 6,
      sort: 'startsAt',
      where: {
        and: [
          { startsAt: { greater_than_equal: start.toISOString() } },
          { startsAt: { less_than: inSevenDays.toISOString() } },
          { status: { equals: 'scheduled' } },
        ],
      },
    }),
    payload.find({
      collection: 'payments',
      limit: 500,
      where: {
        and: [
          { status: { equals: 'succeeded' } },
          { paidAt: { greater_than_equal: start.toISOString() } },
          { paidAt: { less_than: end.toISOString() } },
        ],
      },
    }),
    payload.count({ collection: 'payments', where: { status: { equals: 'review' } } }),
    payload.count({ collection: 'bookings', where: { status: { equals: 'payment_review' } } }),
    payload.count({ collection: 'notifications', where: { status: { equals: 'dead_letter' } } }),
  ])

  const departureIDs = Array.from(
    new Set([
      ...departuresToday.docs.map((departure) => departure.id),
      ...upcomingDepartures.docs.map((departure) => departure.id),
    ]),
  )
  const confirmedBookings = departureIDs.length
    ? await payload.find({
        collection: 'bookings',
        depth: 0,
        limit: 1000,
        where: {
          and: [{ departure: { in: departureIDs } }, { inventoryState: { equals: 'confirmed' } }],
        },
      })
    : { docs: [] }

  const seatsByDeparture = new Map<string, number>()
  for (const booking of confirmedBookings.docs) {
    const departureID = getRelationshipID(booking.departure)
    if (departureID === undefined) continue
    const key = String(departureID)
    const seats = booking.capacitySeats ?? (booking.adults ?? 0) + (booking.children ?? 0)
    seatsByDeparture.set(key, (seatsByDeparture.get(key) ?? 0) + seats)
  }

  const departureSummaries = upcomingDepartures.docs.map((departure) => ({
    booked: seatsByDeparture.get(String(departure.id)) ?? 0,
    capacity: departure.capacity,
    id: departure.id,
    startsAt: departure.startsAt,
    title: getRelationshipTitle(departure.experience),
  }))
  const travellersToday = departuresToday.docs.reduce(
    (total, departure) => total + (seatsByDeparture.get(String(departure.id)) ?? 0),
    0,
  )
  const revenueToday = successfulPayments.docs.reduce(
    (total, payment) => total + payment.amountMinor / 100,
    0,
  )

  return {
    bookingsToday: bookingsToday.totalDocs,
    departuresToday: departuresToday.totalDocs,
    emailFailures: emailFailures.totalDocs,
    inventoryReviews: inventoryReviews.totalDocs,
    paymentReviews: paymentReviews.totalDocs,
    revenueToday,
    travellersToday,
    upcomingDepartures: departureSummaries,
  }
}

async function loadEnquiryData(payload: Payload, roles: StaffRole[]): Promise<EnquiryData> {
  const canViewCorporate = hasAnyRole(roles, 'operations', 'event-manager', 'finance')
  const canViewTravelLeads = hasAnyRole(roles, 'operations')
  const [corporate, customTrips, travelServices] = await Promise.all([
    canViewCorporate
      ? payload.count({
          collection: 'corporate-enquiries',
          where: { pipelineStatus: { equals: 'new' } },
        })
      : Promise.resolve({ totalDocs: 0 }),
    canViewTravelLeads
      ? payload.count({ collection: 'custom-trip-requests', where: { status: { equals: 'new' } } })
      : Promise.resolve({ totalDocs: 0 }),
    canViewTravelLeads
      ? payload.count({
          collection: 'travel-service-requests',
          where: { status: { equals: 'new' } },
        })
      : Promise.resolve({ totalDocs: 0 }),
  ])
  return {
    corporate: corporate.totalDocs,
    customTrips: customTrips.totalDocs,
    travelServices: travelServices.totalDocs,
  }
}

async function loadContentData(payload: Payload): Promise<ContentData> {
  const [publishedExperiences, draftExperiences, publishedGuides] = await Promise.all([
    payload.count({ collection: 'experiences', where: { _status: { equals: 'published' } } }),
    payload.count({ collection: 'experiences', where: { _status: { equals: 'draft' } } }),
    payload.count({ collection: 'posts', where: { _status: { equals: 'published' } } }),
  ])
  return {
    draftExperiences: draftExperiences.totalDocs,
    publishedExperiences: publishedExperiences.totalDocs,
    publishedGuides: publishedGuides.totalDocs,
  }
}

async function loadUpcomingEvents(payload: Payload) {
  const result = await payload.count({
    collection: 'events',
    where: {
      and: [
        { startsAt: { greater_than_equal: new Date().toISOString() } },
        { _status: { equals: 'published' } },
      ],
    },
  })
  return result.totalDocs
}

function formatDepartureDate(value: string) {
  return new Intl.DateTimeFormat('en-GH', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'Africa/Accra',
  }).format(new Date(value))
}

function formatDepartureTime(value: string) {
  return new Intl.DateTimeFormat('en-GH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Africa/Accra',
  }).format(new Date(value))
}

function StatCard({ helper, icon: Icon, label, tone, value }: DashboardMetric) {
  return (
    <article className={`tvx-stat-card tvx-stat-card--${tone}`}>
      <div className="tvx-stat-card__topline">
        <span className="tvx-stat-card__icon" aria-hidden="true">
          <Icon size={19} strokeWidth={1.9} />
        </span>
        <span className="tvx-stat-card__helper">{helper}</span>
      </div>
      <strong className="tvx-stat-card__value">{value}</strong>
      <span className="tvx-stat-card__label">{label}</span>
    </article>
  )
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="tvx-empty-state">
      <span className="tvx-empty-state__icon" aria-hidden="true">
        <CheckCircle2 size={22} />
      </span>
      <p>{children}</p>
    </div>
  )
}

export function AdminLogo() {
  return (
    <div className="tvx-admin-brand" aria-label="Trivoxo Operations">
      <Image
        className="tvx-admin-brand__logo tvx-admin-brand__logo--light"
        src="/logo/colored.webp"
        alt="Trivoxo"
        width={196}
        height={56}
        loading="eager"
      />
      <Image
        className="tvx-admin-brand__logo tvx-admin-brand__logo--dark"
        src="/logo/white.webp"
        alt="Trivoxo"
        width={196}
        height={56}
        loading="eager"
      />
      <span className="tvx-admin-brand__label">Operations</span>
    </div>
  )
}

export function AdminIcon() {
  return (
    <span className="tvx-admin-icon" aria-label="Trivoxo">
      <span className="tvx-admin-icon__letter" aria-hidden="true">
        T
      </span>
      <span className="tvx-admin-icon__mark" aria-hidden="true">
        V
      </span>
    </span>
  )
}

/** Role-aware operations cockpit replacing Payload's generic card dashboard. */
export async function AdminDashboard({ payload, user }: AdminViewServerProps) {
  const staff = user as User | null | undefined
  const roles = staff?.roles ?? []
  const canViewOperations = hasAnyRole(roles, 'operations', 'finance')
  const canViewEnquiries = hasAnyRole(roles, 'operations', 'event-manager', 'finance')
  const canViewContent = hasAnyRole(roles, 'operations', 'content-editor')
  const canViewEvents = hasAnyRole(roles, 'operations', 'event-manager')
  const canManageOperations = hasAnyRole(roles, 'operations')
  const canManageContent = hasAnyRole(roles, 'operations', 'content-editor')
  const canManageEvents = hasAnyRole(roles, 'operations', 'event-manager')
  const { end, inSevenDays, start } = ghanaDayBounds()

  const [operations, enquiries, content, upcomingEvents] = await Promise.all([
    canViewOperations
      ? loadOperationsData(payload, start, end, inSevenDays)
      : Promise.resolve<OperationsData | null>(null),
    canViewEnquiries ? loadEnquiryData(payload, roles) : Promise.resolve<EnquiryData | null>(null),
    canViewContent ? loadContentData(payload) : Promise.resolve<ContentData | null>(null),
    canViewEvents ? loadUpcomingEvents(payload) : Promise.resolve<number | null>(null),
  ])

  const now = new Date()
  const ghanaHour = Number(
    new Intl.DateTimeFormat('en-GH', {
      hour: '2-digit',
      hourCycle: 'h23',
      timeZone: 'Africa/Accra',
    }).format(now),
  )
  const greeting =
    ghanaHour < 12 ? 'Good morning' : ghanaHour < 18 ? 'Good afternoon' : 'Good evening'
  const today = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Accra',
  }).format(now)
  const primaryRole = roles[0] ? ROLE_LABELS[roles[0]] : 'Staff member'
  const firstName = staff?.name?.trim().split(/\s+/)[0] || 'team'

  const metrics: DashboardMetric[] = []
  if (operations) {
    metrics.push(
      {
        helper: 'Paid via Paystack',
        icon: CircleDollarSign,
        label: 'Revenue today',
        tone: 'brand',
        value: `GHS ${currencyFormatter.format(operations.revenueToday)}`,
      },
      {
        helper: `${operations.travellersToday} confirmed traveller${operations.travellersToday === 1 ? '' : 's'}`,
        icon: CalendarDays,
        label: "Today's departures",
        tone: 'gold',
        value: numberFormatter.format(operations.departuresToday),
      },
      {
        helper: 'All booking sources',
        icon: TicketCheck,
        label: 'Bookings created today',
        tone: 'green',
        value: numberFormatter.format(operations.bookingsToday),
      },
    )
  }
  if (enquiries) {
    const total = enquiries.corporate + enquiries.customTrips + enquiries.travelServices
    metrics.push({
      helper: 'Awaiting first response',
      icon: MessageSquareMore,
      label: 'New enquiries',
      tone: 'purple',
      value: numberFormatter.format(total),
    })
  }
  if (content) {
    metrics.push({
      helper: `${content.draftExperiences} experience draft${content.draftExperiences === 1 ? '' : 's'}`,
      icon: Compass,
      label: 'Published experiences',
      tone: 'navy',
      value: numberFormatter.format(content.publishedExperiences),
    })
  }
  if (upcomingEvents !== null && !operations) {
    metrics.push({
      helper: 'Published and upcoming',
      icon: CalendarDays,
      label: 'Upcoming events',
      tone: 'gold',
      value: numberFormatter.format(upcomingEvents),
    })
  }

  const tasks: DashboardTask[] = []
  if (operations?.paymentReviews)
    tasks.push({
      description: 'Verify gateway details before confirming these bookings.',
      href: '/admin/collections/payments',
      icon: AlertTriangle,
      label: 'Payments need review',
      tone: 'danger',
      value: operations.paymentReviews,
    })
  if (operations?.inventoryReviews)
    tasks.push({
      description: 'Payment is complete, but seats need an operations decision.',
      href: '/admin/collections/bookings',
      icon: TicketCheck,
      label: 'Bookings need inventory review',
      tone: 'warning',
      value: operations.inventoryReviews,
    })
  if (operations?.emailFailures)
    tasks.push({
      description: 'Customer confirmations exhausted automatic retries.',
      href: '/admin/collections/notifications',
      icon: MailWarning,
      label: 'Emails need attention',
      tone: 'danger',
      value: operations.emailFailures,
    })
  if (enquiries?.corporate)
    tasks.push({
      description: 'New company and event leads are waiting for a response.',
      href: '/admin/collections/corporate-enquiries',
      icon: UsersRound,
      label: 'New corporate enquiries',
      tone: 'info',
      value: enquiries.corporate,
    })
  if (enquiries?.customTrips)
    tasks.push({
      description: 'Review interests, dates, group size, and requested services.',
      href: '/admin/collections/custom-trip-requests',
      icon: Sparkles,
      label: 'New custom trip requests',
      tone: 'info',
      value: enquiries.customTrips,
    })
  if (enquiries?.travelServices)
    tasks.push({
      description: 'Airport, flight, hotel, or car-rental requests need quotes.',
      href: '/admin/collections/travel-service-requests',
      icon: MessageSquareMore,
      label: 'New travel service requests',
      tone: 'info',
      value: enquiries.travelServices,
    })

  const quickActions = [
    canManageOperations
      ? { href: '/admin/collections/bookings/create', icon: Plus, label: 'New manual booking' }
      : null,
    canManageOperations
      ? {
          href: '/admin/collections/departures/create',
          icon: CalendarPlus,
          label: 'Schedule departure',
        }
      : null,
    canManageContent
      ? { href: '/admin/collections/experiences/create', icon: Compass, label: 'Create experience' }
      : null,
    canManageEvents
      ? { href: '/admin/collections/events/create', icon: CalendarDays, label: 'Create event' }
      : null,
    canManageContent
      ? { href: '/admin/collections/posts/create', icon: FileText, label: 'Write Ghana Guide' }
      : null,
  ].filter((action): action is NonNullable<typeof action> => action !== null)

  return (
    <Gutter className="tvx-dashboard">
      <header className="tvx-dashboard-hero">
        <div className="tvx-dashboard-hero__glow" aria-hidden="true" />
        <div className="tvx-dashboard-hero__content">
          <div className="tvx-dashboard-hero__eyebrow">
            <span className="tvx-live-dot" aria-hidden="true" />
            Trivoxo operations
          </div>
          <h1>
            {greeting}, {firstName}
          </h1>
          <p>{today} · Here is what is happening across the business.</p>
        </div>
        <div className="tvx-dashboard-hero__aside">
          <span className="tvx-role-badge">{primaryRole}</span>
          <Link href="/" target="_blank" rel="noreferrer" className="tvx-view-site-link">
            View website <ExternalLink size={15} aria-hidden="true" />
          </Link>
        </div>
      </header>

      {metrics.length > 0 ? (
        <section className="tvx-stats-grid" aria-label="Business overview">
          {metrics.map((metric) => (
            <StatCard key={metric.label} {...metric} />
          ))}
        </section>
      ) : null}

      {quickActions.length > 0 ? (
        <section className="tvx-quick-actions" aria-labelledby="quick-actions-heading">
          <div className="tvx-section-heading tvx-section-heading--inline">
            <div>
              <span className="tvx-section-kicker">Shortcuts</span>
              <h2 id="quick-actions-heading">Quick actions</h2>
            </div>
          </div>
          <div className="tvx-quick-actions__list">
            {quickActions.map(({ href, icon: Icon, label }) => (
              <Link href={href} key={href} className="tvx-quick-action">
                <span className="tvx-quick-action__icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span>{label}</span>
                <ArrowRight className="tvx-quick-action__arrow" size={16} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className={`tvx-dashboard-grid${operations ? '' : ' tvx-dashboard-grid--single'}`}>
        {operations ? (
          <section className="tvx-panel" aria-labelledby="departures-heading">
            <div className="tvx-section-heading">
              <div>
                <span className="tvx-section-kicker">Next 7 days</span>
                <h2 id="departures-heading">Upcoming departures</h2>
              </div>
              <Link href="/admin/collections/departures" className="tvx-section-link">
                View schedule <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
            {operations.upcomingDepartures.length > 0 ? (
              <div className="tvx-departure-list">
                {operations.upcomingDepartures.map((departure) => {
                  const percentage = Math.min(
                    100,
                    Math.round((departure.booked / Math.max(departure.capacity, 1)) * 100),
                  )
                  const remaining = Math.max(0, departure.capacity - departure.booked)
                  return (
                    <Link
                      href={`/admin/collections/departures/${departure.id}`}
                      className="tvx-departure-row"
                      key={departure.id}
                    >
                      <span className="tvx-departure-row__date">
                        <strong>{formatDepartureTime(departure.startsAt)}</strong>
                        <small>{formatDepartureDate(departure.startsAt)}</small>
                      </span>
                      <span className="tvx-departure-row__main">
                        <strong>{departure.title}</strong>
                        <span className="tvx-capacity-bar" aria-hidden="true">
                          <span style={{ width: `${percentage}%` }} />
                        </span>
                      </span>
                      <span className="tvx-departure-row__capacity">
                        <strong>
                          {departure.booked}/{departure.capacity}
                        </strong>
                        <small>
                          {remaining === 0
                            ? 'Full'
                            : `${remaining} seat${remaining === 1 ? '' : 's'} left`}
                        </small>
                      </span>
                      <ArrowRight
                        className="tvx-departure-row__arrow"
                        size={17}
                        aria-hidden="true"
                      />
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="tvx-empty-state tvx-empty-state--large">
                <span className="tvx-empty-state__icon" aria-hidden="true">
                  <CalendarDays size={22} />
                </span>
                <div>
                  <strong>No scheduled departures in the next 7 days</strong>
                  <p>Create a departure when a date and capacity are ready for booking.</p>
                </div>
                {canManageOperations ? (
                  <Link href="/admin/collections/departures/create">Schedule departure</Link>
                ) : null}
              </div>
            )}
          </section>
        ) : null}

        <section className="tvx-panel" aria-labelledby="attention-heading">
          <div className="tvx-section-heading">
            <div>
              <span className="tvx-section-kicker">Priority queue</span>
              <h2 id="attention-heading">Needs attention</h2>
            </div>
            {tasks.length > 0 ? <span className="tvx-task-count">{tasks.length}</span> : null}
          </div>
          {tasks.length > 0 ? (
            <div className="tvx-task-list">
              {tasks.map(({ description, href, icon: Icon, label, tone, value }) => (
                <Link href={href} className={`tvx-task tvx-task--${tone}`} key={label}>
                  <span className="tvx-task__icon" aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <span className="tvx-task__content">
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                  <span className="tvx-task__value">{value}</span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState>
              You are all caught up. There are no urgent items waiting right now.
            </EmptyState>
          )}
        </section>
      </div>

      {(content || upcomingEvents !== null) && !operations ? (
        <section
          className="tvx-panel tvx-content-summary"
          aria-labelledby="workspace-summary-heading"
        >
          <div className="tvx-section-heading">
            <div>
              <span className="tvx-section-kicker">Workspace</span>
              <h2 id="workspace-summary-heading">At a glance</h2>
            </div>
          </div>
          <div className="tvx-content-summary__grid">
            {content ? (
              <>
                <Link href="/admin/collections/experiences" className="tvx-summary-link">
                  <Compass size={19} aria-hidden="true" />
                  <span>
                    <strong>{content.publishedExperiences}</strong>Published experiences
                  </span>
                </Link>
                <Link href="/admin/collections/posts" className="tvx-summary-link">
                  <BookOpen size={19} aria-hidden="true" />
                  <span>
                    <strong>{content.publishedGuides}</strong>Published Ghana Guides
                  </span>
                </Link>
              </>
            ) : null}
            {upcomingEvents !== null ? (
              <Link href="/admin/collections/events" className="tvx-summary-link">
                <CalendarDays size={19} aria-hidden="true" />
                <span>
                  <strong>{upcomingEvents}</strong>Upcoming events
                </span>
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      <footer className="tvx-dashboard-footer">
        <Clock3 size={15} aria-hidden="true" /> Dashboard data is live from the Trivoxo operations
        database.
      </footer>
    </Gutter>
  )
}
