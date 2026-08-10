import { createHmac } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createBookingAccessToken, verifyBookingAccessToken } from '@/lib/booking-access'
import {
  initializePaystackTransaction,
  verifyPaystackTransaction,
  verifyPaystackWebhookSignature,
} from '@/lib/paystack'

const originalSecret = process.env.PAYSTACK_SECRET_KEY
const originalMode = process.env.PAYSTACK_MODE
const originalPayloadSecret = process.env.PAYLOAD_SECRET

describe('Paystack boundary', () => {
  beforeEach(() => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_unit-only-secret'
    process.env.PAYSTACK_MODE = 'test'
    process.env.PAYLOAD_SECRET = 'unit-test-booking-token-secret'
  })

  afterEach(() => {
    process.env.PAYSTACK_SECRET_KEY = originalSecret
    process.env.PAYSTACK_MODE = originalMode
    process.env.PAYLOAD_SECRET = originalPayloadSecret
    vi.restoreAllMocks()
  })

  it('initializes from server-controlled values without exposing the secret in the body', async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>
      expect(init?.headers).toMatchObject({
        Authorization: 'Bearer sk_test_unit-only-secret',
      })
      expect(body).toMatchObject({
        amount: '140000',
        currency: 'GHS',
        reference: 'TVXP-26-TEST',
        callback_url: 'http://localhost:3000/api/paystack/callback?access=signed',
      })
      expect(String(init?.body)).not.toContain('sk_test_unit-only-secret')
      return Response.json({
        status: true,
        message: 'Authorization URL created',
        data: {
          authorization_url: 'https://checkout.paystack.com/test-access',
          access_code: 'test-access',
          reference: 'TVXP-26-TEST',
        },
      })
    }) as typeof fetch

    const result = await initializePaystackTransaction(
      {
        email: 'ama@example.com',
        amountMinor: 140000,
        currency: 'GHS',
        reference: 'TVXP-26-TEST',
        callbackURL: 'http://localhost:3000/api/paystack/callback?access=signed',
        bookingReference: 'TVX-26-TEST1',
      },
      fetcher,
    )

    expect(result).toMatchObject({
      authorizationURL: 'https://checkout.paystack.com/test-access',
      reference: 'TVXP-26-TEST',
    })
  })

  it('verifies a transaction by its encoded reference', async () => {
    const fetcher = vi.fn(async () =>
      Response.json({
        status: true,
        message: 'Verification successful',
        data: {
          id: 4099260516,
          domain: 'test',
          status: 'success',
          reference: 'TVXP-26-VERIFY',
          amount: 140000,
          currency: 'GHS',
        },
      }),
    ) as typeof fetch

    await expect(verifyPaystackTransaction('TVXP-26-VERIFY', fetcher)).resolves.toMatchObject({
      status: 'success',
      amount: 140000,
      currency: 'GHS',
    })
  })

  it('validates the exact raw webhook body with HMAC SHA-512', () => {
    const raw = JSON.stringify({ event: 'charge.success', data: { reference: 'TVXP-26-X' } })
    const signature = createHmac('sha512', 'webhook-secret').update(raw).digest('hex')
    expect(verifyPaystackWebhookSignature(raw, signature, 'webhook-secret')).toBe(true)
    expect(verifyPaystackWebhookSignature(`${raw} `, signature, 'webhook-secret')).toBe(false)
    expect(verifyPaystackWebhookSignature(raw, null, 'webhook-secret')).toBe(false)
  })

  it('binds guest access tokens to one booking and expires them', () => {
    const now = new Date('2026-08-10T12:00:00.000Z')
    const token = createBookingAccessToken('TVX-26-ABCDE', { now, ttlSeconds: 60 })
    expect(verifyBookingAccessToken('TVX-26-ABCDE', token, now)).toBe(true)
    expect(verifyBookingAccessToken('TVX-26-OTHER', token, now)).toBe(false)
    expect(
      verifyBookingAccessToken('TVX-26-ABCDE', token, new Date('2026-08-10T12:01:01.000Z')),
    ).toBe(false)
  })
})
