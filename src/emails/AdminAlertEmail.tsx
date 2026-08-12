import type { CSSProperties } from 'react'

export type AdminAlertEmailProps = {
  recipientName?: string
  categoryLabel: string
  title: string
  message?: string
  /** Absolute URL that opens the item in the admin. */
  actionURL?: string
}

const colors = {
  navy: '#0c1d35',
  orange: '#f15a29',
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
    borderRadius: '18px',
    margin: '0 auto',
    maxWidth: '560px',
    overflow: 'hidden',
  },
  header: { backgroundColor: colors.navy, color: '#ffffff', padding: '20px 28px' },
  eyebrow: {
    color: '#f9b233',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    margin: 0,
  },
  content: { padding: '24px 28px' },
  title: { fontSize: '18px', fontWeight: 700, margin: '0 0 8px' },
  message: { color: colors.muted, fontSize: '14px', lineHeight: '22px', margin: '0 0 20px' },
  button: {
    backgroundColor: colors.orange,
    borderRadius: '10px',
    color: '#ffffff',
    display: 'inline-block',
    fontSize: '14px',
    fontWeight: 700,
    padding: '11px 20px',
    textDecoration: 'none',
  },
  footer: {
    borderTop: `1px solid ${colors.line}`,
    color: colors.muted,
    fontSize: '12px',
    lineHeight: '18px',
    padding: '16px 28px',
  },
}

/** Internal staff alert — sent to the relevant team when something needs attention. */
export function AdminAlertEmail({
  recipientName,
  categoryLabel,
  title,
  message,
  actionURL,
}: AdminAlertEmailProps) {
  return (
    <html>
      <body style={styles.body}>
        <div style={styles.card}>
          <div style={styles.header}>
            <p style={styles.eyebrow}>Trivoxo · {categoryLabel}</p>
          </div>
          <div style={styles.content}>
            {recipientName ? (
              <p style={{ ...styles.message, marginBottom: '12px' }}>Hi {recipientName},</p>
            ) : null}
            <p style={styles.title}>{title}</p>
            {message ? <p style={styles.message}>{message}</p> : null}
            {actionURL ? (
              <a href={actionURL} style={styles.button}>
                Open in admin
              </a>
            ) : null}
          </div>
          <div style={styles.footer}>
            You receive this because your Trivoxo staff role covers {categoryLabel.toLowerCase()}s.
            Manage alerts from your profile in the admin.
          </div>
        </div>
      </body>
    </html>
  )
}

export default AdminAlertEmail
