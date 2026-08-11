import type { Payload } from 'payload'
import {
  reconcilePaystackPayment,
  type PaymentReconciliationResult,
} from '@/lib/payment-service'
import {
  reconcileEventOrderPayment,
  type EventReconciliationResult,
} from '@/lib/event-payment-service'

/**
 * Route a Paystack reference to the right reconciler. A payment carries exactly
 * one of `booking` or `eventOrder` (enforced on the Payments collection), so the
 * webhook and callback can stay payment-kind agnostic and branch on the result.
 */
export type DispatchedReconciliation =
  | ({ kind: 'booking' } & PaymentReconciliationResult)
  | ({ kind: 'event' } & EventReconciliationResult)
  | { kind: 'none'; outcome: 'not_found' }

export async function reconcilePaymentByReference(
  payload: Payload,
  reference: string,
): Promise<DispatchedReconciliation> {
  const found = await payload.find({
    collection: 'payments',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { reference: { equals: reference } },
  })
  const payment = found.docs[0]
  if (!payment) return { kind: 'none', outcome: 'not_found' }

  if (payment.eventOrder) {
    return { kind: 'event', ...(await reconcileEventOrderPayment(payload, reference)) }
  }
  return { kind: 'booking', ...(await reconcilePaystackPayment(payload, reference)) }
}
