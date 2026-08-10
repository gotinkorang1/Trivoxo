import { createHmac, timingSafeEqual } from 'node:crypto'

const PAYSTACK_API = 'https://api.paystack.co'
const REQUEST_TIMEOUT_MS = 15_000

type Fetcher = typeof fetch

type PaystackEnvelope<T> = {
  status: boolean
  message: string
  data?: T
}

export type PaystackMode = 'test' | 'live'

export type InitializePaystackInput = {
  email: string
  amountMinor: number
  currency: 'GHS'
  reference: string
  callbackURL: string
  bookingReference: string
}

export type InitializedPaystackTransaction = {
  authorizationURL: string
  accessCode: string
  reference: string
}

export type VerifiedPaystackTransaction = {
  id: number | string
  domain: string
  status: string
  reference: string
  amount: number
  currency: string
  paid_at?: string | null
  channel?: string | null
  gateway_response?: string | null
  metadata?: unknown
  customer?: { email?: string | null } | null
}

export class PaystackError extends Error {
  statusCode?: number

  constructor(message: string, statusCode?: number) {
    super(message)
    this.name = 'PaystackError'
    this.statusCode = statusCode
  }
}

function paystackSecret(): string {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) throw new PaystackError('Paystack is not configured.')

  const mode = getPaystackMode()
  if (mode === 'test' && !key.startsWith('sk_test_')) {
    throw new PaystackError('Paystack test mode requires a test secret key.')
  }
  if (mode === 'live' && !key.startsWith('sk_live_')) {
    throw new PaystackError('Paystack live mode requires a live secret key.')
  }
  return key
}

export function getPaystackMode(): PaystackMode {
  return process.env.PAYSTACK_MODE === 'live' ? 'live' : 'test'
}

async function requestPaystack<T>(
  path: string,
  init: RequestInit,
  fetcher: Fetcher = fetch,
): Promise<T> {
  let response: Response
  try {
    response = await fetcher(`${PAYSTACK_API}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${paystackSecret()}`,
        'Content-Type': 'application/json',
        ...init.headers,
      },
      cache: 'no-store',
      signal: init.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (error) {
    if (error instanceof PaystackError) throw error
    throw new PaystackError(
      error instanceof Error && error.name === 'TimeoutError'
        ? 'Paystack took too long to respond.'
        : 'Paystack could not be reached.',
    )
  }

  let body: PaystackEnvelope<T>
  try {
    body = (await response.json()) as PaystackEnvelope<T>
  } catch {
    throw new PaystackError('Paystack returned an unreadable response.', response.status)
  }

  if (!response.ok || !body.status || !body.data) {
    throw new PaystackError(body.message || 'Paystack rejected the request.', response.status)
  }
  return body.data
}

export async function initializePaystackTransaction(
  input: InitializePaystackInput,
  fetcher: Fetcher = fetch,
): Promise<InitializedPaystackTransaction> {
  if (!Number.isSafeInteger(input.amountMinor) || input.amountMinor < 1) {
    throw new PaystackError('A valid payment amount is required.')
  }

  const data = await requestPaystack<{
    authorization_url: string
    access_code: string
    reference: string
  }>(
    '/transaction/initialize',
    {
      method: 'POST',
      body: JSON.stringify({
        email: input.email,
        amount: String(input.amountMinor),
        currency: input.currency,
        reference: input.reference,
        callback_url: input.callbackURL,
        channels: ['card', 'mobile_money', 'bank_transfer'],
        metadata: JSON.stringify({ booking_reference: input.bookingReference }),
      }),
    },
    fetcher,
  )

  if (data.reference !== input.reference) {
    throw new PaystackError('Paystack returned an unexpected transaction reference.')
  }
  return {
    authorizationURL: data.authorization_url,
    accessCode: data.access_code,
    reference: data.reference,
  }
}

export function verifyPaystackTransaction(
  reference: string,
  fetcher: Fetcher = fetch,
): Promise<VerifiedPaystackTransaction> {
  return requestPaystack<VerifiedPaystackTransaction>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
    { method: 'GET' },
    fetcher,
  )
}

/** Validate the exact raw request body before parsing a webhook event. */
export function verifyPaystackWebhookSignature(
  rawBody: string,
  receivedSignature: string | null,
  secret = paystackSecret(),
): boolean {
  if (!receivedSignature || !/^[a-f0-9]{128}$/i.test(receivedSignature)) return false
  const expected = Buffer.from(createHmac('sha512', secret).update(rawBody).digest('hex'), 'utf8')
  const received = Buffer.from(receivedSignature, 'utf8')
  return expected.length === received.length && timingSafeEqual(expected, received)
}
