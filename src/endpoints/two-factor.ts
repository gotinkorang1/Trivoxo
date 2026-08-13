import type { Endpoint, PayloadRequest } from 'payload'
import { addDataAndFileToRequest } from 'payload'
import { generatePayloadCookie } from 'payload/shared'
import QRCode from 'qrcode'
import {
  consumeRecoveryCode,
  decryptSecret,
  encryptSecret,
  generateRecoveryCodes,
  generateTotpSecret,
  openChallenge,
  sealChallenge,
  totpKeyUri,
  verifyTotp,
} from '../lib/two-factor'

const USERS = 'users'

type UserRecord = {
  id: string | number
  email: string
  twoFactorEnabled?: boolean | null
  twoFactorSecret?: string | null
  twoFactorPendingSecret?: string | null
  twoFactorRecoveryCodes?: string[] | null
}

function json(data: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  })
}

/** Load a user including the hidden 2FA fields (server-only). */
async function loadUser(req: PayloadRequest, id: string | number): Promise<UserRecord> {
  return (await req.payload.findByID({
    collection: USERS,
    id,
    depth: 0,
    overrideAccess: true,
    showHiddenFields: true,
  })) as unknown as UserRecord
}

/** Build a response that also sets the Payload session cookie. */
function sessionResponse(req: PayloadRequest, token: string, body: unknown): Response {
  const cookie = generatePayloadCookie({
    collectionAuthConfig: req.payload.collections[USERS].config.auth,
    cookiePrefix: req.payload.config.cookiePrefix,
    token,
  })
  return json(body, 200, { 'Set-Cookie': cookie })
}

/** Verify a submitted code against TOTP or (consuming) a recovery code. */
async function verifyCode(req: PayloadRequest, user: UserRecord, code: string): Promise<boolean> {
  const secret = user.twoFactorSecret ? decryptSecret(user.twoFactorSecret) : null
  if (secret && verifyTotp(code, secret)) return true
  if (Array.isArray(user.twoFactorRecoveryCodes)) {
    const remaining = consumeRecoveryCode(code, user.twoFactorRecoveryCodes)
    if (remaining) {
      await req.payload.update({
        collection: USERS,
        id: user.id,
        data: { twoFactorRecoveryCodes: remaining },
        overrideAccess: true,
      })
      return true
    }
  }
  return false
}

// ── POST /two-factor/login  { email, password }  → issues session or 2FA step ─
const login: Endpoint = {
  path: '/two-factor/login',
  method: 'post',
  handler: async (req) => {
    await addDataAndFileToRequest(req)
    const { email, password } = (req.data ?? {}) as { email?: string; password?: string }
    if (!email || !password) return json({ error: 'Email and password are required.' }, 400)

    const result = await req.payload
      .login({
        collection: USERS,
        data: { email, password },
        context: { twoFactorFlow: true },
      })
      .catch(() => null)
    if (!result?.token || !result.user) return json({ error: 'Invalid email or password.' }, 401)

    const user = await loadUser(req, result.user.id)
    if (!user.twoFactorEnabled) {
      // Not enrolled yet — issue the session; the admin gate compels enrolment.
      return sessionResponse(req, result.token, { status: 'ok', mustEnroll: true })
    }
    // Enrolled — withhold the cookie until the code verifies.
    const challenge = sealChallenge({ token: result.token, uid: String(user.id) })
    return json({ status: '2fa', challenge })
  },
}

// ── POST /two-factor/verify  { challenge, code }  → issues session ────────────
const verify: Endpoint = {
  path: '/two-factor/verify',
  method: 'post',
  handler: async (req) => {
    await addDataAndFileToRequest(req)
    const { challenge, code } = (req.data ?? {}) as { challenge?: string; code?: string }
    if (!challenge || !code) return json({ error: 'Missing code.' }, 400)

    const opened = openChallenge<{ token: string; uid: string }>(challenge)
    if (!opened) return json({ error: 'Your sign-in session expired. Start again.' }, 401)

    const user = await loadUser(req, opened.uid)
    if (!user.twoFactorEnabled) return json({ error: 'Two-factor is not enabled.' }, 400)

    if (!(await verifyCode(req, user, code))) {
      return json({ status: '2fa', error: 'That code didn’t match. Try again.' }, 401)
    }
    return sessionResponse(req, opened.token, { status: 'ok' })
  },
}

// ── POST /two-factor/enroll/start  (authenticated) → QR + secret ──────────────
const enrollStart: Endpoint = {
  path: '/two-factor/enroll/start',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return json({ error: 'Unauthorized' }, 401)
    const secret = generateTotpSecret()
    await req.payload.update({
      collection: USERS,
      id: req.user.id,
      data: { twoFactorPendingSecret: encryptSecret(secret) },
      overrideAccess: true,
    })
    const uri = totpKeyUri(req.user.email as string, secret)
    const qr = await QRCode.toDataURL(uri)
    return json({ qr, secret, uri })
  },
}

// ── POST /two-factor/enroll/verify  { code }  → enables 2FA, returns codes ─────
const enrollVerify: Endpoint = {
  path: '/two-factor/enroll/verify',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return json({ error: 'Unauthorized' }, 401)
    await addDataAndFileToRequest(req)
    const { code } = (req.data ?? {}) as { code?: string }
    const user = await loadUser(req, req.user.id)
    if (!user.twoFactorPendingSecret) return json({ error: 'Start setup first.' }, 400)
    const secret = decryptSecret(user.twoFactorPendingSecret)
    if (!code || !verifyTotp(code, secret)) {
      return json({ error: 'That code didn’t match. Check the time on your phone and try again.' }, 400)
    }
    const { plain, hashed } = generateRecoveryCodes()
    await req.payload.update({
      collection: USERS,
      id: req.user.id,
      overrideAccess: true,
      data: {
        twoFactorSecret: encryptSecret(secret),
        twoFactorEnabled: true,
        twoFactorPendingSecret: null,
        twoFactorRecoveryCodes: hashed,
      },
    })
    return json({ status: 'ok', recoveryCodes: plain })
  },
}

// ── POST /two-factor/disable  { code }  (authenticated) ───────────────────────
const disable: Endpoint = {
  path: '/two-factor/disable',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return json({ error: 'Unauthorized' }, 401)
    await addDataAndFileToRequest(req)
    const { code } = (req.data ?? {}) as { code?: string }
    const user = await loadUser(req, req.user.id)
    if (!user.twoFactorEnabled) return json({ status: 'ok' })
    if (!code || !(await verifyCode(req, user, code))) {
      return json({ error: 'Enter a valid code to turn off two-factor.' }, 400)
    }
    await req.payload.update({
      collection: USERS,
      id: req.user.id,
      overrideAccess: true,
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorPendingSecret: null,
        twoFactorRecoveryCodes: null,
      },
    })
    return json({ status: 'ok' })
  },
}

export const twoFactorEndpoints: Endpoint[] = [
  login,
  verify,
  enrollStart,
  enrollVerify,
  disable,
]
