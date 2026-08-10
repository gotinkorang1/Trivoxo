import { sql } from '@payloadcms/db-postgres'
import { createLocalReq, type Payload, type PayloadRequest } from 'payload'
import type { Booking, Payment } from '@/payload-types'
import { createBookingAccessToken, verifyBookingAccessToken } from '@/lib/booking-access'
import {
  isBookingHoldActive,
  markBookingPaymentForReview,
  settleVerifiedBookingPayment,
} from '@/lib/booking-inventory'
import {
  getPaystackMode,
  initializePaystackTransaction,
  PaystackError,
  verifyPaystackTransaction,
  type VerifiedPaystackTransaction,
} from '@/lib/paystack'
import { paymentReference } from '@/lib/reference'

type TransactionDB = { execute: (query: unknown) => Promise<unknown> }

const ACTIVE_PAYMENT_STATUSES: Payment['status'][] = ['initializing', 'initialized', 'pending']
const INITIALIZATION_STALE_MS = 90_000

export class PaymentError extends Error {
  code:
    | 'ACCESS_DENIED'
    | 'ALREADY_PAID'
    | 'CHECKOUT_PENDING'
    | 'HOLD_EXPIRED'
    | 'INVALID_PAYMENT'
    | 'NOT_FOUND'
    | 'PAYSTACK_UNAVAILABLE'

  constructor(code: PaymentError['code'], message: string) {
    super(message)
    this.name = 'PaymentError'
    this.code = code
  }
}

export type CheckoutStartResult = {
  authorizationURL: string
  booking: Booking
  payment: Payment
  reused: boolean
}

export type PaymentReconciliationResult = {
  booking?: Booking
  payment?: Payment
  outcome: 'confirmed' | 'review' | 'pending' | 'failed' | 'not_found'
  reason?: string
}

function relationshipID(value: unknown): number | undefined {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    return typeof id === 'number' ? id : undefined
  }
  return undefined
}

async function transactionDB(req: PayloadRequest): Promise<TransactionDB> {
  const transactionID = await req.transactionID
  const session = transactionID ? req.payload.db.sessions?.[String(transactionID)] : undefined
  if (!session) throw new PaymentError('INVALID_PAYMENT', 'Payment transaction is unavailable.')
  return session.db as TransactionDB
}

async function withPaymentTransaction<T>(
  payload: Payload,
  work: (req: PayloadRequest) => Promise<T>,
): Promise<T> {
  const transactionID = await payload.db.beginTransaction()
  if (!transactionID) {
    throw new PaymentError('INVALID_PAYMENT', 'PostgreSQL transactions are unavailable.')
  }
  const req = await createLocalReq({ req: { transactionID } }, payload)
  try {
    const result = await work(req)
    await payload.db.commitTransaction(transactionID)
    return result
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }
}

async function lockBooking(req: PayloadRequest, bookingID: number): Promise<void> {
  const db = await transactionDB(req)
  await db.execute(sql`SELECT id FROM bookings WHERE id = ${bookingID} FOR UPDATE`)
}

async function lockPayment(req: PayloadRequest, paymentID: number): Promise<void> {
  const db = await transactionDB(req)
  await db.execute(sql`SELECT id FROM payments WHERE id = ${paymentID} FOR UPDATE`)
}

function amountMinorForBooking(booking: Booking): number {
  const amount = Number(booking.totalAmount)
  const minor = Math.round(amount * 100)
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isSafeInteger(minor)) {
    throw new PaymentError('INVALID_PAYMENT', 'This booking does not have a payable total.')
  }
  return minor
}

async function reservePaymentAttempt(
  payload: Payload,
  bookingID: number,
  now: Date,
): Promise<{ booking: Booking; payment: Payment; created: boolean }> {
  return withPaymentTransaction(payload, async (req) => {
    await lockBooking(req, bookingID)
    const booking = await payload.findByID({
      collection: 'bookings',
      id: bookingID,
      depth: 0,
      overrideAccess: true,
      req,
    })

    if (booking.inventoryState === 'confirmed' && booking.paymentState === 'paid') {
      throw new PaymentError('ALREADY_PAID', 'This booking is already paid and confirmed.')
    }
    if (!isBookingHoldActive(booking, now)) {
      throw new PaymentError(
        'HOLD_EXPIRED',
        'The temporary seat hold has expired. Please start a new booking before paying.',
      )
    }

    const amountMinor = amountMinorForBooking(booking)
    const existing = await payload.find({
      collection: 'payments',
      depth: 0,
      limit: 10,
      sort: '-createdAt',
      overrideAccess: true,
      req,
      where: {
        and: [{ booking: { equals: booking.id } }, { status: { in: ACTIVE_PAYMENT_STATUSES } }],
      },
    })

    for (const attempt of existing.docs) {
      if (attempt.amountMinor !== amountMinor || attempt.currency !== 'GHS') {
        await payload.update({
          collection: 'payments',
          id: attempt.id,
          depth: 0,
          overrideAccess: true,
          req,
          data: {
            status: 'failed',
            failureReason: 'Booking total changed before checkout was completed.',
          },
        })
        continue
      }

      if (attempt.checkoutURL && attempt.status !== 'initializing') {
        return { booking, payment: attempt, created: false }
      }
      if (now.getTime() - new Date(attempt.createdAt).getTime() < INITIALIZATION_STALE_MS) {
        throw new PaymentError(
          'CHECKOUT_PENDING',
          'Secure checkout is already being prepared. Please try again in a moment.',
        )
      }
      await payload.update({
        collection: 'payments',
        id: attempt.id,
        depth: 0,
        overrideAccess: true,
        req,
        data: {
          status: 'failed',
          failureReason: 'Checkout initialization timed out before a payment link was returned.',
        },
      })
    }

    const reference = paymentReference(now)
    const payment = await payload.create({
      collection: 'payments',
      depth: 0,
      overrideAccess: true,
      req,
      data: {
        reference,
        booking: booking.id,
        gateway: 'paystack',
        gatewayReference: reference,
        status: 'initializing',
        amountMinor,
        currency: 'GHS',
      },
    })
    return { booking, payment, created: true }
  })
}

function callbackURL(accessToken: string): string {
  const configured = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  let url: URL
  try {
    url = new URL('/api/paystack/callback', configured)
  } catch {
    throw new PaymentError('INVALID_PAYMENT', 'The public server URL is invalid.')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new PaymentError('INVALID_PAYMENT', 'The public server URL must use HTTP or HTTPS.')
  }
  url.searchParams.set('access', accessToken)
  return url.toString()
}

export async function startPaystackCheckout(
  payload: Payload,
  bookingReference: string,
  accessToken: string,
  now = new Date(),
): Promise<CheckoutStartResult> {
  if (!verifyBookingAccessToken(bookingReference, accessToken, now)) {
    throw new PaymentError('ACCESS_DENIED', 'This booking access link is invalid or expired.')
  }

  const found = await payload.find({
    collection: 'bookings',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { reference: { equals: bookingReference.toUpperCase() } },
  })
  const initialBooking = found.docs[0]
  if (!initialBooking) throw new PaymentError('NOT_FOUND', 'Booking not found.')

  const reserved = await reservePaymentAttempt(payload, initialBooking.id, now)
  if (!reserved.created && reserved.payment.checkoutURL) {
    return {
      authorizationURL: reserved.payment.checkoutURL,
      booking: reserved.booking,
      payment: reserved.payment,
      reused: true,
    }
  }

  let initialized
  try {
    initialized = await initializePaystackTransaction({
      email: reserved.booking.booker.email,
      amountMinor: reserved.payment.amountMinor,
      currency: 'GHS',
      reference: reserved.payment.reference,
      callbackURL: callbackURL(accessToken),
      bookingReference: reserved.booking.reference || bookingReference,
    })
  } catch (error) {
    await updateUnsettledPayment(payload, reserved.payment.id, {
      status: 'failed',
      failureReason:
        error instanceof PaystackError ? error.message : 'Checkout initialization failed.',
    })
    throw new PaymentError(
      'PAYSTACK_UNAVAILABLE',
      'Secure checkout could not be started. Please try again.',
    )
  }

  const payment = await updateUnsettledPayment(payload, reserved.payment.id, {
    status: 'initialized',
    checkoutURL: initialized.authorizationURL,
    gatewayReference: initialized.reference,
    failureReason: null,
  })
  if (!payment) {
    throw new PaymentError('INVALID_PAYMENT', 'Payment was already processed.')
  }

  const booking = await payload.update({
    collection: 'bookings',
    id: reserved.booking.id,
    depth: 0,
    overrideAccess: true,
    data: { status: 'pending_payment' },
  })
  return { authorizationURL: initialized.authorizationURL, booking, payment, reused: false }
}

async function updateUnsettledPayment(
  payload: Payload,
  paymentID: number,
  data: Partial<Payment>,
): Promise<Payment | null> {
  return withPaymentTransaction(payload, async (req) => {
    await lockPayment(req, paymentID)
    const current = await payload.findByID({
      collection: 'payments',
      id: paymentID,
      depth: 0,
      overrideAccess: true,
      req,
    })
    if (current.status === 'succeeded' || current.status === 'review') return null
    return payload.update({
      collection: 'payments',
      id: current.id,
      depth: 0,
      overrideAccess: true,
      req,
      data,
    })
  })
}

function verificationSnapshot(verified: VerifiedPaystackTransaction): Record<string, unknown> {
  const metadataBookingReference = bookingReferenceFromMetadata(verified.metadata)
  return {
    transactionId: String(verified.id),
    domain: verified.domain,
    status: verified.status,
    reference: verified.reference,
    amountMinor: verified.amount,
    currency: verified.currency,
    channel: verified.channel ?? null,
    paidAt: verified.paid_at ?? null,
    gatewayResponse: verified.gateway_response ?? null,
    customerEmail: verified.customer?.email ?? null,
    bookingReference: metadataBookingReference ?? null,
  }
}

function bookingReferenceFromMetadata(metadata: unknown): string | undefined {
  let parsed = metadata
  if (typeof metadata === 'string' && metadata.trim()) {
    try {
      parsed = JSON.parse(metadata) as unknown
    } catch {
      return undefined
    }
  }
  if (!parsed || typeof parsed !== 'object' || !('booking_reference' in parsed)) {
    return undefined
  }
  const reference = (parsed as { booking_reference?: unknown }).booking_reference
  return typeof reference === 'string' ? reference : undefined
}

export async function reconcilePaystackPayment(
  payload: Payload,
  reference: string,
  options: {
    verify?: (reference: string) => Promise<VerifiedPaystackTransaction>
  } = {},
): Promise<PaymentReconciliationResult> {
  const found = await payload.find({
    collection: 'payments',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { reference: { equals: reference } },
  })
  const payment = found.docs[0]
  if (!payment) return { outcome: 'not_found' }

  const bookingID = relationshipID(payment.booking)
  if (!bookingID) {
    return { payment, outcome: 'review', reason: 'Payment has no booking relationship.' }
  }
  const booking = await payload.findByID({
    collection: 'bookings',
    id: bookingID,
    depth: 0,
    overrideAccess: true,
  })
  if (payment.status === 'succeeded') return { booking, payment, outcome: 'confirmed' }
  if (payment.status === 'review') {
    return { booking, payment, outcome: 'review', reason: payment.reviewReason ?? undefined }
  }

  let verified: VerifiedPaystackTransaction
  try {
    verified = await (options.verify ?? verifyPaystackTransaction)(reference)
  } catch (error) {
    return {
      booking,
      payment,
      outcome: 'pending',
      reason: error instanceof PaystackError ? error.message : 'Payment verification unavailable.',
    }
  }

  const verifiedAt = new Date().toISOString()
  const snapshot = verificationSnapshot(verified)
  if (verified.status !== 'success') {
    const pendingStatuses = ['pending', 'ongoing', 'processing', 'queued']
    const status: Payment['status'] = pendingStatuses.includes(verified.status)
      ? 'pending'
      : verified.status === 'abandoned'
        ? 'abandoned'
        : 'failed'
    const updated = await updateUnsettledPayment(payload, payment.id, {
      status,
      lastVerifiedAt: verifiedAt,
      failureReason:
        status === 'pending'
          ? null
          : verified.gateway_response || `Paystack status: ${verified.status}`,
      verificationSnapshot: snapshot,
    })
    if (!updated) {
      const current = await payload.findByID({
        collection: 'payments',
        id: payment.id,
        depth: 0,
        overrideAccess: true,
      })
      const currentBooking = await payload.findByID({
        collection: 'bookings',
        id: booking.id,
        depth: 0,
        overrideAccess: true,
      })
      return {
        booking: currentBooking,
        payment: current,
        outcome: current.status === 'succeeded' ? 'confirmed' : 'review',
        reason: current.reviewReason ?? undefined,
      }
    }
    return {
      booking,
      payment: updated,
      outcome: status === 'pending' ? 'pending' : 'failed',
      reason: verified.gateway_response ?? undefined,
    }
  }

  const issues: string[] = []
  if (verified.reference !== payment.reference) issues.push('reference mismatch')
  if (verified.amount !== payment.amountMinor) issues.push('amount mismatch')
  if (verified.currency !== payment.currency) issues.push('currency mismatch')
  if (verified.domain !== getPaystackMode()) issues.push('Paystack mode mismatch')
  const metadataBookingReference = bookingReferenceFromMetadata(verified.metadata)
  if (metadataBookingReference && metadataBookingReference !== booking.reference) {
    issues.push('booking metadata mismatch')
  }
  if (
    verified.customer?.email &&
    verified.customer.email.toLowerCase() !== booking.booker.email.toLowerCase()
  ) {
    issues.push('customer email mismatch')
  }

  const audit = {
    gatewayTransactionId: String(verified.id),
    channel: verified.channel ?? undefined,
    paidAt: verified.paid_at ?? undefined,
    verifiedAt,
    verificationSnapshot: snapshot,
  }
  if (issues.length > 0) {
    const reason = `Verified Paystack payment requires review: ${issues.join(', ')}.`
    const result = await markBookingPaymentForReview(payload, payment.id, reason, audit)
    return { ...result, outcome: 'review' }
  }

  const result = await settleVerifiedBookingPayment(payload, payment.id, audit)
  return {
    booking: result.booking,
    payment: result.payment,
    outcome: result.outcome === 'review' ? 'review' : 'confirmed',
    reason: result.reason,
  }
}

export function freshBookingAccess(reference: string): string {
  return createBookingAccessToken(reference)
}
