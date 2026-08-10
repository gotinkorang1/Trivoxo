# Booking inventory architecture

## Invariants

1. A booking can consume seats only from one real `departure`.
2. Active held seats plus confirmed seats can never exceed departure capacity.
3. A hold stops consuming capacity at `holdExpiresAt`, even if cleanup has not
   yet changed the booking's display status to `expired`.
4. Website, phone, WhatsApp and staff bookings use the same invariant.
5. The final capacity decision is made in PostgreSQL, never in browser state.

## Hold transaction

```text
Validate experience/date/party
        ↓
Begin PostgreSQL transaction
        ↓
Advisory-lock experience + date
        ↓
Find/create dated departure
        ↓
Lock departure row (FOR UPDATE)
        ↓
Sum confirmed bookings + unexpired holds
        ↓
Capacity available? ── no ──→ rollback + sold-out response
        ↓ yes
Create HELD booking with holdExpiresAt
        ↓
Commit
```

The advisory lock prevents two requests from creating duplicate date-only
departures. The departure row lock serializes all claims against an existing
departure. The booking record and seat claim commit together.

## Why remaining seats are derived

The departure does not store a mutable `remainingSeats` counter. Availability is
derived from active bookings:

```text
remaining = capacity
          - confirmed seats
          - held seats where holdExpiresAt > now
```

This trades a small indexed query for stronger correctness. Expiry is exact and
cannot leave a stale counter behind if a scheduled task is delayed. At Trivoxo's
expected group sizes (normally no more than 15 travellers per departure), this
query is inexpensive.

## Expiry and cleanup

- Logical expiry is immediate: every availability read and claim ignores a hold
  after `holdExpiresAt`.
- `/api/cron/expire-booking-holds` changes stale booking records to `expired` /
  `released` for admin clarity.
- The cron endpoint requires `Authorization: Bearer $CRON_SECRET`.
- The committed Vercel schedule runs daily so it is valid on Hobby and paid
  plans. A paid deployment can safely increase it to every 5 minutes without
  changing inventory correctness.

## Staff operations

- Staff create and close real departures in **Admin → Operations → Departures**.
- Capacity is set per departure and may differ by vehicle or operating day.
- A booking with `held`, `pending_payment`, `paid` or `confirmed` status requires
  a departure. Collection hooks apply the same capacity check to manual entries.
- Draft, cancelled, expired and refunded bookings do not consume inventory.
- Auto-created departures are date-only placeholders until staff confirms the
  official time.

## Tests

`tests/int/booking-inventory.int.spec.ts` covers:

- two simultaneous claims against insufficient shared capacity;
- automatic timestamp expiry and seat reuse;
- stale-hold status reconciliation;
- rejection of active manual bookings without a departure.

## Next evolution

The Paystack webhook must lock the same departure before converting `held`
inventory to `confirmed`. If the hold has already expired, it must re-check
capacity and either reclaim seats safely or send the booking to operations for
review. That webhook must remain signature-verified and idempotent.
