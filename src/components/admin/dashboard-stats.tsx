import { Gutter } from '@payloadcms/ui'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Compass,
  ExternalLink,
  FileText,
  Gauge,
  MailWarning,
  MessageSquareMore,
  Plus,
  ReceiptText,
  Sparkles,
  Star,
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
type ReportingPeriod = 7 | 30 | 90

type DashboardMetric = {
  helper: string
  href?: string
  icon: LucideIcon
  label: string
  tone: Tone
  value: string
}

type DashboardQuickAction = {
  description: string
  href: string
  icon: LucideIcon
  label: string
  tone: Tone
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

type PerformancePoint = {
  bookings: number
  label: string
  revenue: number
  shortLabel: string
}

type SourceSummary = {
  count: number
  label: string
  percentage: number
  source: string
}

type RecentBooking = {
  createdAt: string
  experience: string
  guest: string
  id: number | string
  reference: string
  source: string
  status: string
  totalAmount: number
}

type OperationsData = {
  averageBookingValue: number
  bookingsToday: number
  capacityBooked: number
  capacityTotal: number
  capacityUtilisation: number
  departuresToday: number
  emailFailures: number
  inventoryReviews: number
  periodBookings: number
  periodRevenue: number
  performance: PerformancePoint[]
  paymentReviews: number
  recentBookings: RecentBooking[]
  revenueToday: number
  sourceBreakdown: SourceSummary[]
  travellersToday: number
  upcomingDepartures: DepartureSummary[]
  upcomingDepartureCount: number
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
  pendingReviews: number
}

type EventSummary = {
  id: number | string
  title: string
  startsAt: string
  sold: number
  capacity: number
}

type EventSalesData = {
  ticketsSoldPeriod: number
  revenuePeriod: number
  ordersInReview: number
  upcoming: EventSummary[]
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
const DAY_MS = 24 * 60 * 60 * 1000
const REPORTING_PERIODS: ReportingPeriod[] = [7, 30, 90]
const SOURCE_LABELS: Record<string, string> = {
  website: 'Website',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  phone: 'Phone',
  'walk-in': 'Walk-in',
  corporate: 'Corporate',
  referral: 'Referral',
  partner: 'Partner',
  other: 'Other',
}

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

function getBookerName(value: unknown): string {
  if (!value || typeof value !== 'object') return 'Guest booking'
  const booker = value as { firstName?: unknown; lastName?: unknown }
  const name = [booker.firstName, booker.lastName]
    .filter((part): part is string => typeof part === 'string' && Boolean(part.trim()))
    .join(' ')
  return name || 'Guest booking'
}

function humanize(value: string) {
  return value
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function getReportingPeriod(value: unknown): ReportingPeriod {
  const raw = Array.isArray(value) ? value[0] : value
  const parsed = Number(raw)
  return REPORTING_PERIODS.includes(parsed as ReportingPeriod) ? (parsed as ReportingPeriod) : 30
}

function periodStartFor(startOfToday: Date, days: ReportingPeriod) {
  const periodStart = new Date(startOfToday)
  periodStart.setUTCDate(periodStart.getUTCDate() - (days - 1))
  return periodStart
}

function buildPerformanceSeries(
  periodStart: Date,
  days: ReportingPeriod,
  payments: Array<{ amountMinor: number; paidAt?: null | string }>,
  bookings: Array<{ createdAt: string }>,
): PerformancePoint[] {
  const bucketDays = days === 7 ? 1 : days === 30 ? 3 : 8
  const bucketCount = Math.ceil(days / bucketDays)
  const points = Array.from({ length: bucketCount }, (_, index) => {
    const pointStart = new Date(periodStart.getTime() + index * bucketDays * DAY_MS)
    const pointEnd = new Date(
      periodStart.getTime() + Math.min(days - 1, (index + 1) * bucketDays - 1) * DAY_MS,
    )
    const shortStart = new Intl.DateTimeFormat('en-GH', {
      day: 'numeric',
      month: 'short',
      timeZone: 'Africa/Accra',
    }).format(pointStart)
    const shortEnd = new Intl.DateTimeFormat('en-GH', {
      day: 'numeric',
      month: 'short',
      timeZone: 'Africa/Accra',
    }).format(pointEnd)
    return {
      bookings: 0,
      label: shortStart === shortEnd ? shortStart : `${shortStart} – ${shortEnd}`,
      revenue: 0,
      shortLabel: shortStart,
    }
  })

  for (const payment of payments) {
    if (!payment.paidAt) continue
    const dayIndex = Math.floor(
      (new Date(payment.paidAt).getTime() - periodStart.getTime()) / DAY_MS,
    )
    const bucketIndex = Math.floor(dayIndex / bucketDays)
    if (bucketIndex >= 0 && bucketIndex < points.length) {
      points[bucketIndex].revenue += payment.amountMinor / 100
    }
  }

  for (const booking of bookings) {
    const dayIndex = Math.floor(
      (new Date(booking.createdAt).getTime() - periodStart.getTime()) / DAY_MS,
    )
    const bucketIndex = Math.floor(dayIndex / bucketDays)
    if (bucketIndex >= 0 && bucketIndex < points.length) points[bucketIndex].bookings += 1
  }

  return points
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
  const inThirtyDays = new Date(start)
  inThirtyDays.setUTCDate(inThirtyDays.getUTCDate() + 30)
  return { end, inSevenDays, inThirtyDays, start }
}

async function loadOperationsData(
  payload: Payload,
  start: Date,
  end: Date,
  inSevenDays: Date,
  inThirtyDays: Date,
  periodStart: Date,
  periodDays: ReportingPeriod,
): Promise<OperationsData> {
  const [
    futureDepartures,
    bookingsToday,
    periodBookings,
    periodPayments,
    recentBookings,
    paymentReviews,
    inventoryReviews,
    emailFailures,
  ] = await Promise.all([
    payload.find({
      collection: 'departures',
      depth: 1,
      limit: 500,
      sort: 'startsAt',
      where: {
        and: [
          { startsAt: { greater_than_equal: start.toISOString() } },
          { startsAt: { less_than: inThirtyDays.toISOString() } },
          { status: { equals: 'scheduled' } },
        ],
      },
    }),
    payload.count({
      collection: 'bookings',
      where: { createdAt: { greater_than_equal: start.toISOString() } },
    }),
    payload.find({
      collection: 'bookings',
      depth: 0,
      limit: 5000,
      sort: '-createdAt',
      where: {
        and: [
          { createdAt: { greater_than_equal: periodStart.toISOString() } },
          { createdAt: { less_than: end.toISOString() } },
        ],
      },
    }),
    payload.find({
      collection: 'payments',
      limit: 5000,
      where: {
        and: [
          { status: { equals: 'succeeded' } },
          { paidAt: { greater_than_equal: periodStart.toISOString() } },
          { paidAt: { less_than: end.toISOString() } },
        ],
      },
    }),
    payload.find({ collection: 'bookings', depth: 1, limit: 6, sort: '-createdAt' }),
    payload.count({ collection: 'payments', where: { status: { equals: 'review' } } }),
    payload.count({ collection: 'bookings', where: { status: { equals: 'payment_review' } } }),
    payload.count({ collection: 'notifications', where: { status: { equals: 'dead_letter' } } }),
  ])

  const departureIDs = futureDepartures.docs.map((departure) => departure.id)
  const confirmedBookings = departureIDs.length
    ? await payload.find({
        collection: 'bookings',
        depth: 0,
        limit: 5000,
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

  const upcomingDepartures = futureDepartures.docs
    .filter((departure) => new Date(departure.startsAt) < inSevenDays)
    .slice(0, 6)
  const departuresToday = futureDepartures.docs.filter(
    (departure) => new Date(departure.startsAt) < end,
  )
  const departureSummaries = upcomingDepartures.map((departure) => ({
    booked: seatsByDeparture.get(String(departure.id)) ?? 0,
    capacity: departure.capacity,
    id: departure.id,
    startsAt: departure.startsAt,
    title: getRelationshipTitle(departure.experience),
  }))
  const travellersToday = departuresToday.reduce(
    (total, departure) => total + (seatsByDeparture.get(String(departure.id)) ?? 0),
    0,
  )
  const revenueToday = periodPayments.docs.reduce(
    (total, payment) =>
      payment.paidAt && new Date(payment.paidAt) >= start
        ? total + payment.amountMinor / 100
        : total,
    0,
  )
  const periodRevenue = periodPayments.docs.reduce(
    (total, payment) => total + payment.amountMinor / 100,
    0,
  )
  const sourceCounts = new Map<string, number>()
  for (const booking of periodBookings.docs) {
    const source = booking.source || 'other'
    sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1)
  }
  const sourceBreakdown = Array.from(sourceCounts, ([source, count]) => ({
    count,
    label: SOURCE_LABELS[source] ?? humanize(source),
    percentage: Math.round((count / Math.max(periodBookings.docs.length, 1)) * 100),
    source,
  }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
  const capacityTotal = futureDepartures.docs.reduce(
    (total, departure) => total + departure.capacity,
    0,
  )
  const capacityBooked = futureDepartures.docs.reduce(
    (total, departure) => total + (seatsByDeparture.get(String(departure.id)) ?? 0),
    0,
  )
  const recentBookingSummaries = recentBookings.docs.map((booking) => ({
    createdAt: booking.createdAt,
    experience: getRelationshipTitle(booking.experience),
    guest: getBookerName(booking.booker),
    id: booking.id,
    reference: booking.reference ?? `Booking ${booking.id}`,
    source: SOURCE_LABELS[booking.source] ?? humanize(booking.source),
    status: booking.status,
    totalAmount: booking.totalAmount ?? 0,
  }))

  return {
    averageBookingValue:
      periodPayments.docs.length > 0 ? periodRevenue / periodPayments.docs.length : 0,
    bookingsToday: bookingsToday.totalDocs,
    capacityBooked,
    capacityTotal,
    capacityUtilisation: capacityTotal > 0 ? Math.round((capacityBooked / capacityTotal) * 100) : 0,
    departuresToday: departuresToday.length,
    emailFailures: emailFailures.totalDocs,
    inventoryReviews: inventoryReviews.totalDocs,
    periodBookings: periodBookings.totalDocs,
    periodRevenue,
    performance: buildPerformanceSeries(
      periodStart,
      periodDays,
      periodPayments.docs,
      periodBookings.docs,
    ),
    paymentReviews: paymentReviews.totalDocs,
    recentBookings: recentBookingSummaries,
    revenueToday,
    sourceBreakdown,
    travellersToday,
    upcomingDepartures: departureSummaries,
    upcomingDepartureCount: futureDepartures.totalDocs,
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
  const [publishedExperiences, draftExperiences, publishedGuides, pendingReviews] =
    await Promise.all([
      payload.count({ collection: 'experiences', where: { _status: { equals: 'published' } } }),
      payload.count({ collection: 'experiences', where: { _status: { equals: 'draft' } } }),
      payload.count({ collection: 'posts', where: { _status: { equals: 'published' } } }),
      payload.count({ collection: 'reviews', where: { status: { equals: 'pending' } } }),
    ])
  return {
    draftExperiences: draftExperiences.totalDocs,
    publishedExperiences: publishedExperiences.totalDocs,
    publishedGuides: publishedGuides.totalDocs,
    pendingReviews: pendingReviews.totalDocs,
  }
}

/** Event ticketing summary — sales this period plus upcoming events with sold/capacity. */
async function loadEventSalesData(
  payload: Payload,
  periodStart: Date,
  end: Date,
): Promise<EventSalesData> {
  const nowISO = new Date().toISOString()
  const [upcomingEvents, periodOrders, ordersInReview] = await Promise.all([
    payload.find({
      collection: 'events',
      depth: 0,
      limit: 6,
      sort: 'startsAt',
      where: {
        and: [{ startsAt: { greater_than_equal: nowISO } }, { _status: { equals: 'published' } }],
      },
    }),
    payload.find({
      collection: 'event-orders',
      depth: 0,
      limit: 5000,
      where: {
        and: [
          { status: { equals: 'paid' } },
          { createdAt: { greater_than_equal: periodStart.toISOString() } },
          { createdAt: { less_than: end.toISOString() } },
        ],
      },
    }),
    payload.count({
      collection: 'event-orders',
      where: { status: { equals: 'payment_review' } },
    }),
  ])

  const ticketsSoldPeriod = periodOrders.docs.reduce((t, o) => t + (o.quantityTotal ?? 0), 0)
  const revenuePeriod = periodOrders.docs.reduce((t, o) => t + (o.totalAmount ?? 0), 0)

  const upcomingIDs = upcomingEvents.docs.map((event) => event.id)
  const soldByEvent = new Map<string, number>()
  if (upcomingIDs.length > 0) {
    const paid = await payload.find({
      collection: 'event-orders',
      depth: 0,
      limit: 5000,
      where: { and: [{ event: { in: upcomingIDs } }, { status: { equals: 'paid' } }] },
    })
    for (const order of paid.docs) {
      const id = getRelationshipID(order.event)
      if (id === undefined) continue
      const key = String(id)
      soldByEvent.set(key, (soldByEvent.get(key) ?? 0) + (order.quantityTotal ?? 0))
    }
  }

  const upcoming: EventSummary[] = upcomingEvents.docs.map((event) => ({
    id: event.id,
    title: event.title,
    startsAt: event.startsAt,
    sold: soldByEvent.get(String(event.id)) ?? 0,
    capacity: (event.ticketTypes ?? []).reduce((t, ticket) => t + (ticket.quantity ?? 0), 0),
  }))

  return {
    ticketsSoldPeriod,
    revenuePeriod,
    ordersInReview: ordersInReview.totalDocs,
    upcoming,
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

function formatBookingDate(value: string) {
  return new Intl.DateTimeFormat('en-GH', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Accra',
  }).format(new Date(value))
}

function StatCard({ helper, href, icon: Icon, label, tone, value }: DashboardMetric) {
  const content = (
    <>
      <div className="tvx-stat-card__topline">
        <span className="tvx-stat-card__icon" aria-hidden="true">
          <Icon size={19} strokeWidth={1.9} />
        </span>
        <span className="tvx-stat-card__helper">{helper}</span>
      </div>
      <strong className="tvx-stat-card__value">{value}</strong>
      <span className="tvx-stat-card__footer">
        <span className="tvx-stat-card__label">{label}</span>
        {href ? <ArrowRight size={15} aria-hidden="true" /> : null}
      </span>
    </>
  )

  return href ? (
    <Link
      href={href}
      className={`tvx-stat-card tvx-stat-card--${tone} tvx-stat-card--linked`}
      aria-label={`${label}: ${value}. ${helper}`}
    >
      {content}
    </Link>
  ) : (
    <article className={`tvx-stat-card tvx-stat-card--${tone}`}>{content}</article>
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

function SectionTitle({
  icon: Icon,
  id,
  kicker,
  title,
}: {
  icon: LucideIcon
  id: string
  kicker: string
  title: string
}) {
  return (
    <div className="tvx-section-heading__title">
      <span className="tvx-section-heading__icon" aria-hidden="true">
        <Icon size={17} strokeWidth={1.9} />
      </span>
      <div>
        <span className="tvx-section-kicker">{kicker}</span>
        <h2 id={id}>{title}</h2>
      </div>
    </div>
  )
}

/* Payload's admin router owns this view, so these query-string changes need a
 * browser navigation to refresh the server-rendered reporting data reliably. */
function PeriodSwitch({ period }: { period: ReportingPeriod }) {
  return (
    <nav className="tvx-period-switch" aria-label="Reporting period">
      {REPORTING_PERIODS.map((days) => (
        <a
          href={`/admin?period=${days}`}
          key={days}
          className="tvx-period-switch__link"
          aria-current={period === days ? 'page' : undefined}
        >
          {days} days
        </a>
      ))}
    </nav>
  )
}

function PerformancePanel({
  operations,
  period,
}: {
  operations: OperationsData
  period: ReportingPeriod
}) {
  const maxRevenue = Math.max(...operations.performance.map((point) => point.revenue), 1)
  const maxBookings = Math.max(...operations.performance.map((point) => point.bookings), 1)
  const summaries = [
    {
      icon: CircleDollarSign,
      label: 'Paid revenue',
      value: `GHS ${currencyFormatter.format(operations.periodRevenue)}`,
    },
    {
      icon: ReceiptText,
      label: 'Bookings created',
      value: numberFormatter.format(operations.periodBookings),
    },
    {
      icon: BarChart3,
      label: 'Average paid booking',
      value: `GHS ${currencyFormatter.format(operations.averageBookingValue)}`,
    },
    {
      icon: Gauge,
      label: 'Next 30-day capacity',
      value: `${operations.capacityUtilisation}%`,
    },
  ]

  return (
    <section className="tvx-panel tvx-performance-panel" aria-labelledby="performance-heading">
      <div className="tvx-section-heading tvx-section-heading--responsive">
        <SectionTitle
          icon={BarChart3}
          id="performance-heading"
          kicker="Business performance"
          title="Revenue & booking trend"
        />
        <PeriodSwitch period={period} />
      </div>

      <div className="tvx-performance-summary">
        {summaries.map(({ icon: Icon, label, value }) => (
          <div className="tvx-performance-summary__item" key={label}>
            <Icon size={16} aria-hidden="true" />
            <span>
              <strong>{value}</strong>
              <small>{label}</small>
            </span>
          </div>
        ))}
      </div>

      <figure className="tvx-performance-chart">
        <div
          className="tvx-performance-chart__plot"
          role="img"
          aria-label={`${period}-day revenue chart`}
        >
          {operations.performance.map((point, index) => {
            const revenueHeight = point.revenue
              ? Math.max(10, Math.round((point.revenue / maxRevenue) * 100))
              : 4
            const bookingHeight = point.bookings
              ? Math.max(8, Math.round((point.bookings / maxBookings) * 86))
              : 3
            return (
              <div
                className="tvx-performance-chart__bucket"
                key={point.label}
                aria-label={`${point.label}: GHS ${currencyFormatter.format(point.revenue)}, ${point.bookings} bookings`}
              >
                <span className="tvx-performance-chart__track">
                  <span
                    className="tvx-performance-chart__bar"
                    style={{ height: `${revenueHeight}%` }}
                  />
                  <span
                    className="tvx-performance-chart__booking-dot"
                    style={{ bottom: `${bookingHeight}%` }}
                  />
                </span>
                <small
                  className={
                    index === 0 || index === operations.performance.length - 1
                      ? 'tvx-performance-chart__label tvx-performance-chart__label--visible'
                      : 'tvx-performance-chart__label'
                  }
                >
                  {point.shortLabel}
                </small>
              </div>
            )
          })}
        </div>
        <figcaption className="tvx-chart-legend">
          <span>
            <i className="tvx-chart-legend__revenue" /> Revenue
          </span>
          <span>
            <i className="tvx-chart-legend__bookings" /> Bookings
          </span>
        </figcaption>
      </figure>
    </section>
  )
}

function SourceAndCapacityPanel({
  operations,
  period,
}: {
  operations: OperationsData
  period: ReportingPeriod
}) {
  const topSource = operations.sourceBreakdown[0]
  const remainingCapacity = Math.max(0, operations.capacityTotal - operations.capacityBooked)

  return (
    <section className="tvx-panel tvx-source-panel" aria-labelledby="sources-heading">
      <div className="tvx-section-heading">
        <SectionTitle
          icon={Gauge}
          id="sources-heading"
          kicker="Demand mix"
          title="Booking sources"
        />
        <span className="tvx-panel-period">{period} days</span>
      </div>

      <div className="tvx-capacity-overview">
        <span
          className="tvx-capacity-ring"
          style={{
            background: `conic-gradient(var(--tvx-green) ${operations.capacityUtilisation}%, var(--tvx-navy-soft) 0)`,
          }}
          aria-label={`${operations.capacityUtilisation}% of upcoming capacity booked`}
        >
          <span>
            <strong>{operations.capacityUtilisation}%</strong>
            <small>booked</small>
          </span>
        </span>
        <span className="tvx-capacity-overview__copy">
          <strong>
            {operations.capacityBooked} of {operations.capacityTotal} seats
          </strong>
          <small>
            Across {operations.upcomingDepartureCount} scheduled departures in the next 30 days.
          </small>
          <Link href="/admin/collections/departures">
            Manage capacity <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </span>
      </div>

      {operations.sourceBreakdown.length > 0 ? (
        <>
          <div className="tvx-source-list">
            {operations.sourceBreakdown.map((source) => (
              <div className="tvx-source-row" key={source.source}>
                <span className="tvx-source-row__label">
                  <strong>{source.label}</strong>
                  <small>{source.count}</small>
                </span>
                <span className="tvx-source-row__track" aria-hidden="true">
                  <span style={{ width: `${source.percentage}%` }} />
                </span>
                <span className="tvx-source-row__percentage">{source.percentage}%</span>
              </div>
            ))}
          </div>
          <div className="tvx-channel-summary">
            <span>
              <small>Top booking channel</small>
              <strong>{topSource.label}</strong>
              <span>{topSource.percentage}% of period bookings</span>
            </span>
            <span>
              <small>Seats still available</small>
              <strong>{numberFormatter.format(remainingCapacity)}</strong>
              <span>Across the next 30 days</span>
            </span>
          </div>
        </>
      ) : (
        <EmptyState>No bookings were created during this reporting period.</EmptyState>
      )}
    </section>
  )
}

function RecentBookingsPanel({ bookings }: { bookings: RecentBooking[] }) {
  return (
    <section className="tvx-panel tvx-recent-bookings" aria-labelledby="recent-bookings-heading">
      <div className="tvx-section-heading">
        <SectionTitle
          icon={ReceiptText}
          id="recent-bookings-heading"
          kicker="Latest activity"
          title="Recent bookings"
        />
        <Link href="/admin/collections/bookings" className="tvx-section-link">
          View all bookings <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      {bookings.length > 0 ? (
        <div className="tvx-booking-table" role="table" aria-label="Recent bookings">
          <div className="tvx-booking-table__header" role="row">
            <span role="columnheader">Booking</span>
            <span role="columnheader">Experience</span>
            <span role="columnheader">Source</span>
            <span role="columnheader">Status</span>
            <span role="columnheader">Total</span>
          </div>
          {bookings.map((booking) => (
            <Link
              href={`/admin/collections/bookings/${booking.id}`}
              className="tvx-booking-row"
              role="row"
              key={booking.id}
            >
              <span className="tvx-booking-row__primary" role="cell">
                <span className="tvx-booking-avatar" aria-hidden="true">
                  {booking.guest.charAt(0).toUpperCase()}
                </span>
                <span className="tvx-booking-row__primary-copy">
                  <strong>{booking.reference}</strong>
                  <small>
                    {booking.guest} ·{' '}
                    <time dateTime={booking.createdAt}>{formatBookingDate(booking.createdAt)}</time>
                  </small>
                </span>
              </span>
              <span className="tvx-booking-row__experience" role="cell">
                {booking.experience}
              </span>
              <span role="cell">
                <small className="tvx-source-pill">{booking.source}</small>
              </span>
              <span role="cell">
                <small className="tvx-status-pill" data-status={booking.status}>
                  {humanize(booking.status)}
                </small>
              </span>
              <span className="tvx-booking-row__total" role="cell">
                <strong>GHS {currencyFormatter.format(booking.totalAmount)}</strong>
                <ArrowRight size={15} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState>No bookings have been created yet.</EmptyState>
      )}
    </section>
  )
}

export function AdminLogo() {
  return (
    <div className="tvx-admin-brand" aria-label="Trivoxo Operations">
      <Image
        className="tvx-admin-brand__logo tvx-admin-brand__logo--light"
        src="/logo/colored.webp"
        alt=""
        width={301}
        height={96}
        loading="eager"
      />
      <Image
        className="tvx-admin-brand__logo tvx-admin-brand__logo--dark"
        src="/logo/white.webp"
        alt=""
        width={301}
        height={96}
        loading="eager"
      />
      <span className="tvx-admin-brand__label">Operations</span>
    </div>
  )
}

export function AdminIcon() {
  return (
    <span className="tvx-admin-icon" aria-label="Trivoxo">
      <Image
        className="tvx-admin-icon__logo tvx-admin-icon__logo--light"
        src="/logo/colored.webp"
        alt=""
        width={301}
        height={96}
        loading="eager"
      />
      <Image
        className="tvx-admin-icon__logo tvx-admin-icon__logo--dark"
        src="/logo/white.webp"
        alt=""
        width={301}
        height={96}
        loading="eager"
      />
    </span>
  )
}

function EventsSalesPanel({ data, period }: { data: EventSalesData; period: ReportingPeriod }) {
  return (
    <section className="tvx-panel" aria-labelledby="events-heading">
      <div className="tvx-section-heading">
        <SectionTitle
          icon={TicketCheck}
          id="events-heading"
          kicker={`Last ${period} days`}
          title="Events & ticket sales"
        />
        <Link href="/admin/collections/event-orders" className="tvx-section-link">
          View orders <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
      <div className="tvx-channel-summary">
        <span>
          <small>Tickets sold</small>
          <strong>{numberFormatter.format(data.ticketsSoldPeriod)}</strong>
        </span>
        <span>
          <small>Ticket revenue</small>
          <strong>GHS {currencyFormatter.format(data.revenuePeriod)}</strong>
        </span>
      </div>
      {data.upcoming.length > 0 ? (
        <div className="tvx-departure-list">
          {data.upcoming.map((event) => {
            const percentage =
              event.capacity > 0
                ? Math.min(100, Math.round((event.sold / event.capacity) * 100))
                : 0
            const remaining = Math.max(0, event.capacity - event.sold)
            const availability =
              event.capacity === 0
                ? 'open'
                : remaining === 0
                  ? 'full'
                  : remaining <= Math.max(2, Math.ceil(event.capacity * 0.2))
                    ? 'limited'
                    : 'open'
            return (
              <Link
                href={`/admin/collections/events/${event.id}`}
                className="tvx-departure-row"
                key={event.id}
              >
                <span className="tvx-departure-row__date">
                  <strong>{formatDepartureTime(event.startsAt)}</strong>
                  <small>{formatDepartureDate(event.startsAt)}</small>
                </span>
                <span className="tvx-departure-row__main">
                  <strong>{event.title}</strong>
                  <span className="tvx-capacity-bar" aria-hidden="true">
                    <span style={{ width: `${percentage}%` }} />
                  </span>
                </span>
                <span className="tvx-departure-row__capacity">
                  <small className={`tvx-availability-pill tvx-availability-pill--${availability}`}>
                    {event.capacity === 0
                      ? 'Uncapped'
                      : remaining === 0
                        ? 'Sold out'
                        : availability === 'limited'
                          ? 'Selling fast'
                          : 'On sale'}
                  </small>
                  <strong>
                    {event.capacity > 0 ? `${event.sold}/${event.capacity} sold` : `${event.sold} sold`}
                  </strong>
                </span>
                <ArrowRight className="tvx-departure-row__arrow" size={17} aria-hidden="true" />
              </Link>
            )
          })}
        </div>
      ) : (
        <EmptyState>
          No upcoming published events. Create an event to start selling tickets.
        </EmptyState>
      )}
    </section>
  )
}

/** Role-aware operations cockpit replacing Payload's generic card dashboard. */
export async function AdminDashboard({ payload, searchParams, user }: AdminViewServerProps) {
  const staff = user as User | null | undefined
  const roles = staff?.roles ?? []
  const canViewOperations = hasAnyRole(roles, 'operations', 'finance')
  const canViewEnquiries = hasAnyRole(roles, 'operations', 'event-manager', 'finance')
  const canViewContent = hasAnyRole(roles, 'operations', 'content-editor')
  const canViewEvents = hasAnyRole(roles, 'operations', 'event-manager')
  const canSeeEventSales = hasAnyRole(roles, 'operations', 'event-manager', 'finance')
  const canManageOperations = hasAnyRole(roles, 'operations')
  const canManageContent = hasAnyRole(roles, 'operations', 'content-editor')
  const canManageEvents = hasAnyRole(roles, 'operations', 'event-manager')
  const reportingPeriod = getReportingPeriod(searchParams?.period)
  const { end, inSevenDays, inThirtyDays, start } = ghanaDayBounds()
  const reportingStart = periodStartFor(start, reportingPeriod)

  const [operations, enquiries, content, upcomingEvents, eventSales] = await Promise.all([
    canViewOperations
      ? loadOperationsData(
          payload,
          start,
          end,
          inSevenDays,
          inThirtyDays,
          reportingStart,
          reportingPeriod,
        )
      : Promise.resolve<OperationsData | null>(null),
    canViewEnquiries ? loadEnquiryData(payload, roles) : Promise.resolve<EnquiryData | null>(null),
    canViewContent ? loadContentData(payload) : Promise.resolve<ContentData | null>(null),
    canViewEvents ? loadUpcomingEvents(payload) : Promise.resolve<number | null>(null),
    canSeeEventSales
      ? loadEventSalesData(payload, reportingStart, end)
      : Promise.resolve<EventSalesData | null>(null),
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
        href: '/admin/collections/payments',
        icon: CircleDollarSign,
        label: 'Revenue today',
        tone: 'brand',
        value: `GHS ${currencyFormatter.format(operations.revenueToday)}`,
      },
      {
        helper: `${operations.travellersToday} confirmed traveller${operations.travellersToday === 1 ? '' : 's'}`,
        href: '/admin/collections/departures',
        icon: CalendarDays,
        label: "Today's departures",
        tone: 'gold',
        value: numberFormatter.format(operations.departuresToday),
      },
      {
        helper: 'All booking sources',
        href: '/admin/collections/bookings',
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
      href: '/admin/collections/experiences',
      icon: Compass,
      label: 'Published experiences',
      tone: 'navy',
      value: numberFormatter.format(content.publishedExperiences),
    })
  }
  if (upcomingEvents !== null && !operations) {
    metrics.push({
      helper: 'Published and upcoming',
      href: '/admin/collections/events',
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
  if (eventSales?.ordersInReview)
    tasks.push({
      description: 'Event ticket payments completed but need an operations decision.',
      href: '/admin/collections/event-orders',
      icon: TicketCheck,
      label: 'Ticket orders need review',
      tone: 'warning',
      value: eventSales.ordersInReview,
    })
  if (content?.pendingReviews)
    tasks.push({
      description: 'Guest reviews are awaiting moderation before they go public.',
      href: '/admin/collections/reviews',
      icon: Star,
      label: 'Reviews to moderate',
      tone: 'info',
      value: content.pendingReviews,
    })

  const quickActions: Array<DashboardQuickAction | null> = [
    canManageOperations
      ? {
          description: 'Add a WhatsApp, phone, or walk-in customer.',
          href: '/admin/collections/bookings/create',
          icon: Plus,
          label: 'New manual booking',
          tone: 'brand',
        }
      : null,
    canManageOperations
      ? {
          description: 'Open a date, time, and seat capacity for sale.',
          href: '/admin/collections/departures/create',
          icon: CalendarPlus,
          label: 'Schedule departure',
          tone: 'gold',
        }
      : null,
    canManageContent
      ? {
          description: 'Build pricing, itinerary, photos, and availability.',
          href: '/admin/collections/experiences/create',
          icon: Compass,
          label: 'Create experience',
          tone: 'green',
        }
      : null,
    canManageEvents
      ? {
          description: 'Publish an event and prepare ticket categories.',
          href: '/admin/collections/events/create',
          icon: CalendarDays,
          label: 'Create event',
          tone: 'purple',
        }
      : null,
    canManageContent
      ? {
          description: 'Share destination advice, stories, and travel ideas.',
          href: '/admin/collections/posts/create',
          icon: FileText,
          label: 'Write Ghana Guide',
          tone: 'navy',
        }
      : null,
  ]
  const visibleQuickActions = quickActions.filter(
    (action): action is DashboardQuickAction => action !== null,
  )
  const attentionTotal = tasks.reduce((total, task) => total + task.value, 0)
  const queueSummary =
    attentionTotal === 0
      ? 'No urgent items are waiting for review.'
      : `${numberFormatter.format(attentionTotal)} record${attentionTotal === 1 ? '' : 's'} across ${tasks.length} queue${tasks.length === 1 ? '' : 's'} need review.`

  return (
    <Gutter className="tvx-dashboard ops-dashboard">
      <header className="tvx-dashboard-hero">
        <div className="tvx-dashboard-hero__content">
          <div className="tvx-dashboard-hero__eyebrow">
            <span className="tvx-live-dot" aria-hidden="true" />
            Trivoxo operations
          </div>
          <h1>
            {greeting}, {firstName}
          </h1>
          <p>{today} · Your live view of bookings, departures, enquiries, and content.</p>
        </div>
        <div className="tvx-dashboard-hero__aside">
          <span className="tvx-role-badge">{primaryRole}</span>
          <div className="tvx-dashboard-pulse">
            <span
              className={`tvx-dashboard-pulse__icon${attentionTotal > 0 ? ' tvx-dashboard-pulse__icon--attention' : ''}`}
              aria-hidden="true"
            >
              {attentionTotal > 0 ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
            </span>
            <span className="tvx-dashboard-pulse__copy">
              <small>Operations pulse</small>
              <strong>{attentionTotal > 0 ? 'Action required' : 'Everything looks clear'}</strong>
              <span>{queueSummary}</span>
            </span>
          </div>
          <Link href="/" target="_blank" rel="noreferrer" className="tvx-view-site-link">
            Open public website <ExternalLink size={15} aria-hidden="true" />
          </Link>
        </div>
      </header>

      {metrics.length > 0 ? (
        <section className="tvx-overview" aria-labelledby="business-overview-heading">
          <div className="tvx-section-heading tvx-overview__heading">
            <SectionTitle
              icon={Gauge}
              id="business-overview-heading"
              kicker="Today at a glance"
              title="Business overview"
            />
            <span className="tvx-data-status">
              <span className="tvx-live-dot" aria-hidden="true" /> Live database
            </span>
          </div>
          <div className="tvx-stats-grid">
            {metrics.map((metric) => (
              <StatCard key={metric.label} {...metric} />
            ))}
          </div>
        </section>
      ) : null}

      {visibleQuickActions.length > 0 ? (
        <section className="tvx-quick-actions" aria-labelledby="quick-actions-heading">
          <div className="tvx-section-heading tvx-section-heading--inline">
            <SectionTitle
              icon={Sparkles}
              id="quick-actions-heading"
              kicker="Shortcuts"
              title="Quick actions"
            />
          </div>
          <div className="tvx-quick-actions__list">
            {visibleQuickActions.map(({ description, href, icon: Icon, label, tone }) => (
              <Link href={href} key={href} className={`tvx-quick-action tvx-quick-action--${tone}`}>
                <span className="tvx-quick-action__icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span className="tvx-quick-action__copy">
                  <strong>{label}</strong>
                  <small>{description}</small>
                </span>
                <ArrowRight className="tvx-quick-action__arrow" size={16} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {operations ? (
        <div className="tvx-insights-grid">
          <PerformancePanel operations={operations} period={reportingPeriod} />
          <SourceAndCapacityPanel operations={operations} period={reportingPeriod} />
        </div>
      ) : null}

      <div className={`tvx-dashboard-grid${operations ? '' : ' tvx-dashboard-grid--single'}`}>
        {operations ? (
          <section className="tvx-panel" aria-labelledby="departures-heading">
            <div className="tvx-section-heading">
              <SectionTitle
                icon={CalendarDays}
                id="departures-heading"
                kicker="Next 7 days"
                title="Upcoming departures"
              />
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
                  const availability =
                    remaining === 0
                      ? 'full'
                      : remaining <= Math.max(2, Math.ceil(departure.capacity * 0.2))
                        ? 'limited'
                        : 'open'
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
                        <small
                          className={`tvx-availability-pill tvx-availability-pill--${availability}`}
                        >
                          {remaining === 0
                            ? 'Full'
                            : availability === 'limited'
                              ? 'Filling fast'
                              : 'Open'}
                        </small>
                        <strong>
                          {departure.booked}/{departure.capacity} seats
                        </strong>
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
            <SectionTitle
              icon={AlertTriangle}
              id="attention-heading"
              kicker="Priority queue"
              title="Needs attention"
            />
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

      {eventSales ? (
        <div className="tvx-dashboard-grid tvx-dashboard-grid--single">
          <EventsSalesPanel data={eventSales} period={reportingPeriod} />
        </div>
      ) : null}

      {operations ? <RecentBookingsPanel bookings={operations.recentBookings} /> : null}

      {(content || upcomingEvents !== null) && !operations ? (
        <section
          className="tvx-panel tvx-content-summary"
          aria-labelledby="workspace-summary-heading"
        >
          <div className="tvx-section-heading">
            <SectionTitle
              icon={Compass}
              id="workspace-summary-heading"
              kicker="Workspace"
              title="At a glance"
            />
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
