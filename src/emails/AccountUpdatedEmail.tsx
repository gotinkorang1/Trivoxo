import type { CSSProperties } from 'react'

export type AccountUpdatedEmailProps = {
  name?: string
  /** 'created' for a brand-new account, 'updated' for a change. */
  kind: 'created' | 'updated'
  /** Human-readable list of what changed (updates only). */
  changes?: string[]
  adminURL?: string
  supportEmail?: string
}

const colors = { navy: '#0c1d35', orange: '#f15a29', ink: '#172033', muted: '#637083', line: '#e8e2da' }

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
  title: { fontSize: '18px', fontWeight: 700, margin: '0 0 12px' },
  text: { color: colors.muted, fontSize: '14px', lineHeight: '22px', margin: '0 0 16px' },
  list: { color: colors.ink, fontSize: '14px', lineHeight: '22px', margin: '0 0 20px', paddingLeft: '18px' },
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

/** Sent to a staff member when their admin account is created or changed. */
export function AccountUpdatedEmail({
  name,
  kind,
  changes,
  adminURL,
  supportEmail,
}: AccountUpdatedEmailProps) {
  const created = kind === 'created'
  return (
    <html>
      <body style={styles.body}>
        <div style={styles.card}>
          <div style={styles.header}>
            <p style={styles.eyebrow}>Trivoxo Admin</p>
          </div>
          <div style={styles.content}>
            <p style={styles.title}>
              {created ? 'Your admin account is ready' : 'Your admin account was updated'}
            </p>
            <p style={styles.text}>
              {name ? `Hi ${name}, ` : ''}
              {created
                ? 'A Trivoxo staff account has been created for you. You can sign in to the admin to get started.'
                : 'The following change was made to your Trivoxo staff account:'}
            </p>
            {!created && changes && changes.length > 0 ? (
              <ul style={styles.list}>
                {changes.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            ) : null}
            {adminURL ? (
              <a href={adminURL} style={styles.button}>
                Go to the admin
              </a>
            ) : null}
          </div>
          <div style={styles.footer}>
            If you did not expect this{supportEmail ? `, contact ${supportEmail}` : ', contact your Super Admin'}.
            For your security, never share your password.
          </div>
        </div>
      </body>
    </html>
  )
}

export default AccountUpdatedEmail
