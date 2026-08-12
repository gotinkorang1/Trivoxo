import type { CollectionAfterChangeHook } from 'payload'
import { Resend } from 'resend'
import type { User } from '@/payload-types'
import { AccountUpdatedEmail } from '@/emails/AccountUpdatedEmail'

function rolesKey(roles: User['roles'] | undefined): string {
  return [...(roles ?? [])].sort().join(',')
}

function adminURL(): string | undefined {
  const base = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, '')
  return base ? `${base}/admin` : undefined
}

/**
 * Email a staff member when their account is created or meaningfully changed
 * (name, email or roles). Security-relevant, so it always sends when email is
 * configured — independent of the operational alert-email preference. Runs
 * fire-and-forget and never throws, so it can't block the save.
 */
export const notifyAccountChange: CollectionAfterChangeHook<User> = ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  if (!apiKey || !from || !doc.email) return doc

  let kind: 'created' | 'updated' | undefined
  const changes: string[] = []

  if (operation === 'create') {
    kind = 'created'
  } else if (previousDoc) {
    if (previousDoc.name !== doc.name) changes.push('Your display name was changed.')
    if (previousDoc.email !== doc.email) changes.push('Your sign-in email was changed.')
    if (rolesKey(previousDoc.roles) !== rolesKey(doc.roles)) {
      changes.push(`Your access roles were updated to: ${(doc.roles ?? []).join(', ') || 'none'}.`)
    }
    if (changes.length > 0) kind = 'updated'
  }

  if (!kind) return doc

  const resend = new Resend(apiKey)
  void resend.emails
    .send({
      from,
      to: doc.email,
      subject:
        kind === 'created' ? 'Your Trivoxo admin account is ready' : 'Your Trivoxo admin account was updated',
      react: (
        <AccountUpdatedEmail
          name={doc.name ?? undefined}
          kind={kind}
          changes={changes}
          adminURL={adminURL()}
          supportEmail={process.env.EMAIL_REPLY_TO ?? undefined}
        />
      ),
    })
    .catch((err: unknown) => {
      req.payload.logger.error({ msg: 'Failed to send account-change email', err, user: doc.id })
    })

  return doc
}
