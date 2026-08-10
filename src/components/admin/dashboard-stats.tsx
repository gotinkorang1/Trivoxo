import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Admin dashboard summary (§53) — rendered above the default Payload
 * dashboard via `admin.components.beforeDashboard`. Shows only real counts
 * from the database; no revenue/payment figures are shown since Paystack
 * isn't wired up yet (nothing to report honestly).
 */
export async function DashboardStats() {
  const payload = await getPayload({ config })

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)
  const in7Days = new Date(startOfDay)
  in7Days.setDate(in7Days.getDate() + 7)

  const [
    departuresToday,
    bookingsCreatedToday,
    departures7d,
    corporateNew,
    customTripNew,
    serviceNew,
    publishedExperiences,
  ] = await Promise.all([
    payload.count({
      collection: 'departures',
      where: {
        and: [
          { startsAt: { greater_than_equal: startOfDay.toISOString() } },
          { startsAt: { less_than: endOfDay.toISOString() } },
          { status: { equals: 'scheduled' } },
        ],
      },
    }),
    payload.count({
      collection: 'bookings',
      where: { createdAt: { greater_than_equal: startOfDay.toISOString() } },
    }),
    payload.count({
      collection: 'departures',
      where: {
        and: [
          { startsAt: { greater_than_equal: startOfDay.toISOString() } },
          { startsAt: { less_than: in7Days.toISOString() } },
          { status: { equals: 'scheduled' } },
        ],
      },
    }),
    payload.count({
      collection: 'corporate-enquiries',
      where: { pipelineStatus: { equals: 'new' } },
    }),
    payload.count({ collection: 'custom-trip-requests', where: { status: { equals: 'new' } } }),
    payload.count({ collection: 'travel-service-requests', where: { status: { equals: 'new' } } }),
    payload.count({ collection: 'experiences', where: { _status: { equals: 'published' } } }),
  ])

  const pendingEnquiries = corporateNew.totalDocs + customTripNew.totalDocs + serviceNew.totalDocs

  const stats: { label: string; value: number }[] = [
    { label: "Today's departures", value: departuresToday.totalDocs },
    { label: 'Bookings created today', value: bookingsCreatedToday.totalDocs },
    { label: 'Departures this week', value: departures7d.totalDocs },
    { label: 'Pending enquiries', value: pendingEnquiries },
    { label: 'Published experiences', value: publishedExperiences.totalDocs },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const today = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ margin: '0 0 0.25rem' }}>{greeting}</h3>
      <p style={{ margin: '0 0 1rem', opacity: 0.7, fontSize: '0.875rem' }}>{today}</p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: 'var(--style-radius-m)',
              padding: '1rem',
              background: 'var(--theme-elevation-50)',
            }}
          >
            <div style={{ fontSize: '1.75rem', fontWeight: 600, lineHeight: 1 }}>{s.value}</div>
            <div style={{ marginTop: '0.35rem', fontSize: '0.8125rem', opacity: 0.75 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
