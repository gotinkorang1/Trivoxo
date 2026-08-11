import { sql } from '@payloadcms/db-postgres'
import { createLocalReq, type Payload, type PayloadRequest } from 'payload'
import type { EventOrder, EventTicket, Payment } from '@/payload-types'
import { createBookingAccessToken, verifyBookingAccessToken } from '@/lib/booking-access'
import {
  isEventOrderHoldActive,
  markEventOrderPaymentForReview,
  settleVerifiedEventOrderPayment,
} from '@/lib/event-inventory'
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

export class EventPaymentError extends Error {
  code:
    | 'ACCESS_DENIED'
    | 'ALREADY_PAID'
    | 'CHECKOUT_PENDING'
    | 'HOLD_EXPIRED'
    | 'INVALID_PAYMENT'
    | 'NOT_FOUND'
    | 'PAYSTACK_UNAVAILABLE'

  constructor(code: EventPaymentError['code'], message: string) {
    super(message)
    this.name = 'EventPaymentError'
    this.code = code
  }
}

export type EventCheckoutStartResult = {
  authorizationURL: string
  order: EventOrder
  payment: Payment
  reused: boolean
}

export type EventReconciliationResult = {
  order?: EventOrder
  payment?: Payment
  tickets?: EventTicket[]
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
  if (!session) throw new EventPaymentError('INVALID_PAYMENT', 'Payment transaction is unavailable.')
  return session.db as TransactionDB
}

async function withPaymentTransaction<T>(
  payload: Payload,
  work: (req: PayloadRequest) => Promise<T>,
): Promise<T> {
  const transactionID = await payload.db.beginTransaction()
  if (!transactionID) {
    throw new EventPaymentError('INVALID_PAYMENT', 'PostgreSQL transactions are unavailable.')
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

async function lockOrder(req: PayloadRequest, orderID: number): Promise<void> {
  const db = await transactionDB(req)
  await db.execute(sql`SELECT id FROM event_orders WHERE id = ${orderID} FOR UPDATE`)
}

async function lockPayment(req: PayloadRequest, paymentID: number): Promise<void> {
  const db = await transactionDB(req)
  await db.execute(sql`SELECT id FROM payments WHERE id = ${paymentID} FOR UPDATE`)
}

function amountMinorForOrder(order: EventOrder): number {
  const amount = Number(order.totalAmount)
  const minor = Math.round(amount * 100)
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isSafeInteger(minor)) {
    throw new EventPaymentError('INVALID_PAYMENT', 'This order does not have a payable total.')
  }
  return minor
}

async function reservePaymentAttempt(
  payload: Payload,
  orderID: number,
  now: Date,
): Promise<{ order: EventOrder; payment: Payment; created: boolean }> {
  return withPaymentTransaction(payload, async (req) => {
    await lockOrder(req, orderID)
    const order = await payload.findByID({
      collection: 'event-orders',
      id: orderID,
      depth: 0,
      overrideAccess: true,
      req,
    })

    if (order.inventoryState === 'confirmed' && order.paymentState === 'paid') {
      throw new EventPaymentError('ALREADY_PAID', 'This order is already paid.')
    }
    if (!isEventOrderHoldActive(order, now)) {
      throw new EventPaymentError(
        'HOLD_EXPIRED',
        'Your ticket hold has expired. Please start a new order before paying.',
      )
    }

    const amountMinor = amountMinorForOrder(order)
    const existing = await payload.find({
      collection: 'payments',
      depth: 0,
      limit: 10,
      sort: '-createdAt',
      overrideAccess: true,
      req,
      where: {
        and: [{ eventOrder: { equals: order.id } }, { status: { in: ACTIVE_PAYMENT_STATUSES } }],
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
          data: { status: 'failed', failureReason: 'Order total changed before checkout completed.' },
        })
        continue
      }
      if (attempt.checkoutURL && attempt.status !== 'initializing') {
        return { order, payment: attempt, created: false }
      }
      if (now.getTime() - new Date(attempt.createdAt).getTime() < INITIALIZATION_STALE_MS) {
        throw new EventPaymentError(
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
        data: { status: 'failed', failureReason: 'Checkout initialization timed out.' },
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
        eventOrder: order.id,
        gateway: 'paystack',
        gatewayReference: reference,
        status: 'initializing',
        amountMinor,
        currency: 'GHS',
      },
    })
    return { order, payment, created: true }
  })
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

function callbackURL(accessToken: string): string {
  const configured = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const url = new URL('/api/paystack/callback', configured)
  url.searchParams.set('access', accessToken)
  return url.toString()
}

export async function startEventCheckout(
  payload: Payload,
  orderReference: string,
  accessToken: string,
  now = new Date(),
): Promise<EventCheckoutStartResult> {
  if (!verifyBookingAccessToken(orderReference, accessToken, now)) {
    throw new EventPaymentError('ACCESS_DENIED', 'This order access link is invalid or expired.')
  }

  const found = await payload.find({
    collection: 'event-orders',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { reference: { equals: orderReference.toUpperCase() } },
  })
  const initialOrder = found.docs[0]
  if (!initialOrder) throw new EventPaymentError('NOT_FOUND', 'Order not found.')

  const reserved = await reservePaymentAttempt(payload, initialOrder.id, now)
  if (!reserved.created && reserved.payment.checkoutURL) {
    return {
      authorizationURL: reserved.payment.checkoutURL,
      order: reserved.order,
      payment: reserved.payment,
      reused: true,
    }
  }

  let initialized
  try {
    initialized = await initializePaystackTransaction({
      email: reserved.order.buyer.email,
      amountMinor: reserved.payment.amountMinor,
      currency: 'GHS',
      reference: reserved.payment.reference,
      callbackURL: callbackURL(accessToken),
      metadata: { order_reference: reserved.order.reference || orderReference },
    })
  } catch (error) {
    await updateUnsettledPayment(payload, reserved.payment.id, {
      status: 'failed',
      failureReason:
        error instanceof PaystackError ? error.message : 'Checkout initialization failed.',
    })
    throw new EventPaymentError(
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
  if (!payment) throw new EventPaymentError('INVALID_PAYMENT', 'Payment was already processed.')

  const order = await payload.update({
    collection: 'event-orders',
    id: reserved.order.id,
    depth: 0,
    overrideAccess: true,
    data: { status: 'pending_payment' },
  })
  return { authorizationURL: initialized.authorizationURL, order, payment, reused: false }
}

function orderReferenceFromMetadata(metadata: unknown): string | undefined {
  let parsed = metadata
  if (typeof metadata === 'string' && metadata.trim()) {
    try {
      parsed = JSON.parse(metadata) as unknown
    } catch {
      return undefined
    }
  }
  if (!parsed || typeof parsed !== 'object' || !('order_reference' in parsed)) return undefined
  const reference = (parsed as { order_reference?: unknown }).order_reference
  return typeof reference === 'string' ? reference : undefined
}

function verificationSnapshot(verified: VerifiedPaystackTransaction): Record<string, unknown> {
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
    orderReference: orderReferenceFromMetadata(verified.metadata) ?? null,
  }
}

export async function reconcileEventOrderPayment(
  payload: Payload,
  reference: string,
  options: { verify?: (reference: string) => Promise<VerifiedPaystackTransaction> } = {},
): Promise<EventReconciliationResult> {
  const found = await payload.find({
    collection: 'payments',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { reference: { equals: reference } },
  })
  const payment = found.docs[0]
  if (!payment) return { outcome: 'not_found' }

  const orderID = relationshipID(payment.eventOrder)
  if (!orderID) return { payment, outcome: 'review', reason: 'Payment has no event order.' }
  const order = await payload.findByID({
    collection: 'event-orders',
    id: orderID,
    depth: 0,
    overrideAccess: true,
  })
  if (payment.status === 'succeeded') return { order, payment, outcome: 'confirmed' }
  if (payment.status === 'review') {
    return { order, payment, outcome: 'review', reason: payment.reviewReason ?? undefined }
  }

  let verified: VerifiedPaystackTransaction
  try {
    verified = await (options.verify ?? verifyPaystackTransaction)(reference)
  } catch (error) {
    return {
      order,
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
    await updateUnsettledPayment(payload, payment.id, {
      status,
      lastVerifiedAt: verifiedAt,
      failureReason:
        status === 'pending' ? null : verified.gateway_response || `Paystack status: ${verified.status}`,
      verificationSnapshot: snapshot,
    })
    return {
      order,
      payment,
      outcome: status === 'pending' ? 'pending' : 'failed',
      reason: verified.gateway_response ?? undefined,
    }
  }

  const issues: string[] = []
  if (verified.reference !== payment.reference) issues.push('reference mismatch')
  if (verified.amount !== payment.amountMinor) issues.push('amount mismatch')
  if (verified.currency !== payment.currency) issues.push('currency mismatch')
  if (verified.domain !== getPaystackMode()) issues.push('Paystack mode mismatch')
  const metadataReference = orderReferenceFromMetadata(verified.metadata)
  if (metadataReference && metadataReference !== order.reference) issues.push('order metadata mismatch')
  if (
    verified.customer?.email &&
    verified.customer.email.toLowerCase() !== order.buyer.email.toLowerCase()
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
    const result = await markEventOrderPaymentForReview(payload, payment.id, reason, audit)
    return { order: result.order, payment: result.payment, tickets: result.tickets, outcome: 'review', reason }
  }

  const result = await settleVerifiedEventOrderPayment(payload, payment.id, audit)
  return {
    order: result.order,
    payment: result.payment,
    tickets: result.tickets,
    outcome: result.outcome === 'review' ? 'review' : 'confirmed',
    reason: result.reason,
  }
}

export function freshEventOrderAccess(reference: string): string {
  return createBookingAccessToken(reference)
}
