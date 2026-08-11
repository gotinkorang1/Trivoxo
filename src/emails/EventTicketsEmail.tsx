/* eslint-disable @next/next/no-img-element -- email clients require ordinary img tags for CID attachments */
import type { CSSProperties } from 'react'
import { formatGHS } from '@/lib/booking-materials'
import { formatEventStart, type EventTicketMaterial } from '@/lib/event-ticket-materials'
import { CONTACT } from '@/lib/constants'

type Props = {
  order: EventTicketMaterial
  manageLink: string
  qrContentIDs: Record<string, string>
}

const colors = {
  navy: '#0c1d35',
  orange: '#f15a29',
  gold: '#f9b233',
  cream: '#fff8ef',
  ink: '#172033',
  muted: '#637083',
  line: '#e8e2da',
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
    maxWidth: '660px',
    overflow: 'hidden',
  },
  label: {
    color: colors.muted,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1.2px',
    margin: '0 0 4px',
    textTransform: 'uppercase',
  },
  value: { color: colors.ink, fontSize: '15px', fontWeight: 700, margin: 0 },
}

export function EventTicketsEmail({ order, manageLink, qrContentIDs }: Props) {
  return (
    <html lang="en">
      <body style={styles.body}>
        <div style={styles.card}>
          <div style={{ backgroundColor: colors.navy, color: '#ffffff', padding: '28px 34px' }}>
            <div
              style={{ color: colors.gold, fontSize: '12px', fontWeight: 800, letterSpacing: '2px' }}
            >
              TRIVOXO
            </div>
            <h1 style={{ fontSize: '28px', lineHeight: 1.2, margin: '14px 0 8px' }}>
              Your event tickets are ready.
            </h1>
            <p style={{ color: '#dce4ee', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
              Hi {order.buyerName || 'guest'}, your payment is verified. Keep this email and bring
              each QR code to the gate.
            </p>
          </div>

          <div style={{ padding: '30px 34px' }}>
            <div
              style={{
                backgroundColor: colors.cream,
                borderLeft: `4px solid ${colors.orange}`,
                borderRadius: '12px',
                padding: '18px 20px',
              }}
            >
              <p style={{ ...styles.label, color: colors.orange }}>Order reference</p>
              <p
                style={{
                  color: colors.navy,
                  fontFamily: 'monospace',
                  fontSize: '22px',
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                {order.orderReference}
              </p>
            </div>

            <table
              role="presentation"
              style={{ borderCollapse: 'collapse', marginTop: '24px', width: '100%' }}
            >
              <tbody>
                <DetailRow label="Event" value={order.eventTitle} />
                <DetailRow label="Date" value={formatEventStart(order.startsAt)} />
                <DetailRow label="Venue" value={order.venue} />
                <DetailRow label="Amount paid" value={formatGHS(order.totalAmount)} last />
              </tbody>
            </table>

            <div style={{ marginTop: '26px' }}>
              {order.tickets.map((ticket) => (
                <div
                  key={ticket.reference}
                  style={{
                    border: `1px solid ${colors.line}`,
                    borderRadius: '16px',
                    marginBottom: '14px',
                    padding: '20px',
                    textAlign: 'center',
                  }}
                >
                  <img
                    src={`cid:${qrContentIDs[ticket.reference]}`}
                    alt={`QR code for ticket ${ticket.reference}`}
                    width="220"
                    height="220"
                    style={{ display: 'block', height: '220px', margin: '0 auto', width: '220px' }}
                  />
                  <p
                    style={{
                      color: colors.navy,
                      fontFamily: 'monospace',
                      fontSize: '17px',
                      fontWeight: 800,
                      margin: '12px 0 4px',
                    }}
                  >
                    {ticket.reference}
                  </p>
                  <p style={{ ...styles.label, color: colors.orange }}>{ticket.ticketTypeName}</p>
                  {ticket.attendeeName ? <p style={styles.value}>{ticket.attendeeName}</p> : null}
                </div>
              ))}
            </div>

            <a
              href={manageLink}
              style={{
                backgroundColor: colors.orange,
                borderRadius: '999px',
                color: '#ffffff',
                display: 'inline-block',
                fontSize: '14px',
                fontWeight: 700,
                marginTop: '10px',
                padding: '13px 22px',
                textDecoration: 'none',
              }}
            >
              View all tickets
            </a>
            <p style={{ color: colors.muted, fontSize: '12px', lineHeight: 1.6, margin: '18px 0 0' }}>
              Each ticket can be scanned once. Do not share the QR codes or the private ticket link.
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
              Need help? Call or WhatsApp {CONTACT.primaryPhone}, or email {CONTACT.email}.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}

function DetailRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <tr>
      <td
        style={{
          borderBottom: last ? 'none' : `1px solid ${colors.line}`,
          padding: '12px 0',
          verticalAlign: 'top',
          width: '34%',
        }}
      >
        <p style={styles.label}>{label}</p>
      </td>
      <td
        style={{
          borderBottom: last ? 'none' : `1px solid ${colors.line}`,
          padding: '12px 0',
          verticalAlign: 'top',
        }}
      >
        <p style={styles.value}>{value}</p>
      </td>
    </tr>
  )
}

export default EventTicketsEmail
