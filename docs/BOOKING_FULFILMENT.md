# Booking confirmation, email, voucher, and calendar

Paid bookings use a database outbox so Paystack settlement is never rolled back by an email
provider outage. The booking and one deterministic `booking_confirmed` notification are committed
together. Delivery then runs after the HTTP response and is retried by an authenticated cron job.

```text
Paystack verified
       |
       v
Booking paid + inventory confirmed + notification queued (one transaction)
       |
       v
Immediate post-response delivery
       |
       +---- success ----> sent + Resend message ID
       |
       +---- failure ----> exponential retry ----> action needed after 8 attempts
```

The notification key is stable (`booking-confirmed/<booking-id>/v1`). Trivoxo stores an immutable
confirmation snapshot and fixed signed-link expiry with the outbox row, so every retry has the same
recipient, content, and URLs. Trivoxo also supplies the key to Resend. Resend deduplicates requests
with the same key for 24 hours, protecting against callback/webhook races and a worker crash after
provider acceptance.

## Required environment variables

Set these separately for staging and production:

```text
NEXT_PUBLIC_SERVER_URL=https://staging.example.com
RESEND_API_KEY=re_...
EMAIL_FROM="Trivoxo <bookings@YOUR-VERIFIED-DOMAIN>"
EMAIL_REPLY_TO=info@trivoxoghana.com
CRON_SECRET=at-least-16-random-characters
```

Do not put any of these values in source control. `NEXT_PUBLIC_SERVER_URL` controls the absolute
manage-trip, voucher, and calendar links in customer email, so it must match the deployed host.

## Resend setup

1. Add and verify Trivoxo's sending domain in Resend.
2. Publish the DNS records exactly as Resend supplies them.
3. Create a sending-only API key for each environment.
4. Set `EMAIL_FROM` to an address on the verified domain.
5. Keep staging and production keys separate.

Until the sending domain is verified, use Resend's test sender only for developer-address testing.
The notification remains retryable if delivery is not configured or the provider is unavailable.

## Staging Paystack setup

The Paystack Test Webhook URL must be public HTTPS:

```text
https://YOUR-STAGING-HOST/api/paystack/webhook
```

The callback is supplied per transaction from `NEXT_PUBLIC_SERVER_URL`:

```text
https://YOUR-STAGING-HOST/api/paystack/callback
```

Never use `https://localhost:3000` in Paystack. Paystack cannot reach a local machine, and the
local development server uses HTTP unless an HTTPS tunnel is added.

## Retry job

Vercel calls this authenticated route using `CRON_SECRET`:

```text
GET /api/cron/process-notifications
Authorization: Bearer <CRON_SECRET>
```

The committed `vercel.json` uses one daily run so it deploys on Vercel Hobby as a staging safety
net. Immediate delivery still runs after every successful callback/webhook. For production, use
Vercel Pro and change the notification schedule to every five minutes:

```json
"schedule": "*/5 * * * *"
```

Operations can inspect **Admin -> Operations -> Notifications**. `Retry scheduled` needs no manual
action. `Action needed` means all eight attempts failed and staff should check configuration or
the provider before re-queuing it.

## Private trip documents

The customer receives signed, booking-specific links:

```text
/booking/<reference>?access=<signed-token>
/api/bookings/<reference>/voucher?access=<signed-token>
/api/bookings/<reference>/calendar?access=<signed-token>
```

The token contains no customer data. It is bound to one public booking reference and expires 30
days after departure (bounded to 400 days). Voucher and calendar routes return `404` for an invalid
token and `409` until the booking is both paid and inventory-confirmed. Responses are private,
uncached downloads with a no-referrer policy.

## Staging acceptance test

1. Make a Test Mode booking with a real email address controlled by the tester.
2. Complete Paystack hosted checkout.
3. Confirm the booking becomes `paid`, inventory becomes `confirmed`, and the payment becomes
   `succeeded`.
4. Confirm exactly one notification exists and becomes `sent` with a provider message ID.
5. Open **Manage my trip** from the email.
6. Download the PDF and verify the reference, experience, date, travellers, amount, and pickup.
7. Download the calendar item and import it into Google Calendar or Outlook.
8. Replay the same Paystack webhook and confirm no second email or seat consumption occurs.
9. Temporarily use an invalid Resend key, confirm a retry is scheduled, restore the key, and invoke
   the cron endpoint with the authorization header.

Before production, rotate the Paystack test secret that appeared in the earlier screenshot/chat.

Official references:

- [Resend idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys)
- [React Email with Resend](https://react.email/docs/integrations/resend)
- [Vercel cron security](https://vercel.com/docs/cron-jobs/manage-cron-jobs)
- [React-pdf server renderer](https://react-pdf.org/)
