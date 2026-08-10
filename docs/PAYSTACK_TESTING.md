# Paystack test checkout

Trivoxo uses Paystack hosted checkout. The browser never receives the secret key and never
decides the amount. The server initializes GHS transactions in pesewas, then independently
verifies the reference, status, amount, currency, mode, and customer email before confirming
booking inventory.

## Environment

Keep real values only in the ignored `.env` file:

```text
PAYSTACK_MODE=test
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

The current redirect integration does not need the public key in browser code. It is retained
for a possible future Paystack Popup integration.

## Dashboard URLs

The application sends a callback URL for each initialized transaction, so the dashboard Test
Callback URL may be left blank. For staging or production it may also be set to:

```text
https://YOUR-PUBLIC-HOST/api/paystack/callback
```

Set the Test Webhook URL to a public HTTPS address:

```text
https://YOUR-PUBLIC-HOST/api/paystack/webhook
```

`https://localhost:3000` is invalid because the local Next.js server uses HTTP and Paystack
cannot reach a computer-local address. For local webhook testing, expose port 3000 with a
temporary HTTPS tunnel and use the tunnel hostname. Browser callbacks can still return to the
per-transaction `http://localhost:3000` URL during an interactive local test.

## Start locally (PowerShell)

Run each command separately. This works on Windows PowerShell versions that do not support
`&&`:

```powershell
docker compose up -d
npm run dev
```

Then create a booking, open its signed confirmation link, and choose **Pay securely with MoMo
or card**.

## Official Paystack test details

Successful card:

```text
Number: 4084 0840 8408 4081
Expiry: any future date
CVV: 408
```

Ghana Mobile Money test:

```text
Number: 055 123 498 7
Network: MTN
PIN/OTP: not required for this test case
```

These values are sandbox data only. Never enter real card or Mobile Money credentials in Test
Mode.

Official references:

- [Accept payments](https://paystack.com/docs/payments/accept-payments/)
- [Transaction API](https://paystack.com/docs/api/transaction/)
- [Webhook verification](https://paystack.com/docs/payments/webhooks/)
- [Test payment details](https://paystack.com/docs/payments/test-payments/)

## Expected state changes

```text
HELD / PENDING_PAYMENT
        ↓
Paystack checkout
        ↓
callback and/or charge.success webhook
        ↓
server-side Verify Transaction request
        ↓
exact status + amount + currency + mode + customer validation
        ↓
PAID + CONFIRMED INVENTORY
        |
confirmation notification committed to the database outbox
        |
idempotent email + private PDF voucher + calendar link
```

Callback and webhook delivery are idempotent. Repeated delivery cannot consume seats twice.
If a successful payment arrives after its hold expired and those seats have been reallocated,
the booking becomes `payment_review`; no second payment should be requested. Finance must offer
an alternative departure or process the appropriate refund.

## Before live mode

1. Deploy a staging host with HTTPS and configure its webhook URL in Paystack Test Mode.
2. Test card success, Mobile Money success, abandonment, failed payment, duplicate webhook,
   amount mismatch, and payment after hold expiry.
3. Confirm Finance can see Payments and review items in Payload Admin.
4. Rotate any test secret that was shared through chat or screenshots.
5. Add live keys only to the production environment and set `PAYSTACK_MODE=live`.
6. Run the deployment checklist and a low-value controlled live payment before launch.

See `docs/BOOKING_FULFILMENT.md` for Resend, voucher, calendar, and retry-job setup.
