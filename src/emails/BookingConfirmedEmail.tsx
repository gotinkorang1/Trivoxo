import type { CSSProperties } from 'react'
import type { BookingLinks, BookingMaterial } from '@/lib/booking-materials'
import { formatGhanaDeparture, formatGHS } from '@/lib/booking-materials'
import { CONTACT } from '@/lib/constants'

type Props = {
  booking: BookingMaterial
  links: BookingLinks
}

const colors = {
  navy: '#0c1d35',
  orange: '#f15a29',
  gold: '#f9b233',
  cream: '#fff8ef',
  ink: '#172033',
  muted: '#637083',
  line: '#e8e2da',
  green: '#147d64',
}

const styles: Record<string, CSSProperties> = {
  body: {
    backgroundColor: '#f3f5f7',
    color: colors.ink,
    fontFamily: 'Arial, Helvetica, sans-serif',
    margin: 0,
    padding: '32px 12px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: `1px solid ${colors.line}`,
    borderRadius: '20px',
    margin: '0 auto',
    maxWidth: '620px',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: colors.navy,
    color: '#ffffff',
    padding: '28px 34px',
  },
  content: { padding: '32px 34px' },
  label: {
    color: colors.muted,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1.2px',
    margin: '0 0 4px',
    textTransform: 'uppercase',
  },
  value: { color: colors.ink, fontSize: '15px', fontWeight: 700, margin: 0 },
  button: {
    backgroundColor: colors.orange,
    borderRadius: '999px',
    color: '#ffffff',
    display: 'inline-block',
    fontSize: '14px',
    fontWeight: 700,
    padding: '13px 22px',
    textDecoration: 'none',
  },
  secondaryButton: {
    border: `1px solid ${colors.line}`,
    borderRadius: '999px',
    color: colors.navy,
    display: 'inline-block',
    fontSize: '14px',
    fontWeight: 700,
    marginLeft: '8px',
    padding: '12px 18px',
    textDecoration: 'none',
  },
}

export function BookingConfirmedEmail({ booking, links }: Props) {
  return (
    <html lang="en">
      <body style={styles.body}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div
              style={{
                color: colors.gold,
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '2px',
              }}
            >
              TRIVOXO
            </div>
            <h1 style={{ fontSize: '28px', lineHeight: 1.2, margin: '14px 0 8px' }}>
              Your experience is confirmed.
            </h1>
            <p style={{ color: '#dce4ee', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
              Hi {booking.bookerName || 'traveller'}, your payment is verified and your places are
              secured.
            </p>
          </div>

          <div style={styles.content}>
            <div
              style={{
                backgroundColor: colors.cream,
                borderLeft: `4px solid ${colors.orange}`,
                borderRadius: '12px',
                padding: '18px 20px',
              }}
            >
              <p style={{ ...styles.label, color: colors.orange }}>Booking reference</p>
              <p
                style={{
                  color: colors.navy,
                  fontFamily: 'monospace',
                  fontSize: '22px',
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                {booking.reference}
              </p>
            </div>

            <table
              role="presentation"
              style={{ borderCollapse: 'collapse', marginTop: '26px', width: '100%' }}
            >
              <tbody>
                <DetailRow label="Experience" value={booking.experienceTitle} />
                <DetailRow label="Departure" value={formatGhanaDeparture(booking)} />
                <DetailRow
                  label="Travellers"
                  value={`${booking.travellers} (${booking.adults} adult${booking.adults === 1 ? '' : 's'}${
                    booking.children
                      ? `, ${booking.children} child${booking.children === 1 ? '' : 'ren'}`
                      : ''
                  })`}
                />
                <DetailRow label="Amount paid" value={formatGHS(booking.totalAmount)} />
                <DetailRow label="Pickup / meeting" value={booking.pickup} last />
              </tbody>
            </table>

            <div style={{ marginTop: '28px' }}>
              <a href={links.manage} style={styles.button}>
                Manage my trip
              </a>
              <a href={links.voucher} style={styles.secondaryButton}>
                Download voucher
              </a>
            </div>
            <p
              style={{ color: colors.muted, fontSize: '13px', lineHeight: 1.6, margin: '20px 0 0' }}
            >
              You can also{' '}
              <a href={links.calendar} style={{ color: colors.orange }}>
                add the experience to your calendar
              </a>
              . Final guide and pickup details will be shared before departure.
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#f8fafc',
              borderTop: `1px solid ${colors.line}`,
              padding: '20px 34px',
            }}
          >
            <p style={{ color: colors.muted, fontSize: '12px', lineHeight: 1.6, margin: 0 }}>
              Need help? Call or WhatsApp {CONTACT.primaryPhone}, or email {CONTACT.email}. This
              private link gives access to your booking, so please do not forward it.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}

function DetailRow({
  label,
  value,
  last = false,
}: {
  label: string
  value: string
  last?: boolean
}) {
  return (
    <tr>
      <td
        style={{
          borderBottom: last ? 'none' : `1px solid ${colors.line}`,
          padding: '13px 0',
          verticalAlign: 'top',
          width: '34%',
        }}
      >
        <p style={styles.label}>{label}</p>
      </td>
      <td
        style={{
          borderBottom: last ? 'none' : `1px solid ${colors.line}`,
          padding: '13px 0',
          verticalAlign: 'top',
        }}
      >
        <p style={styles.value}>{value}</p>
      </td>
    </tr>
  )
}

export default BookingConfirmedEmail
