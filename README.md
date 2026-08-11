# Trivoxo V2

**Ghana travel, tour, adventure, events & experience commerce platform.**

A modern travel-commerce system for tours, outdoor adventures, events, corporate
travel, custom trips and travel services — backed by a **zero-code operational
CMS** so Trivoxo staff can run the business (create tours, change prices, publish
events, manage bookings) without a developer.

This repository is the **Phase-1 foundation**: the app runs, the admin is fully
modelled, the public experience platform is built, and departure inventory is
protected transactionally. See [Roadmap](#roadmap) for what is still ahead.

---

## Tech stack

| Area          | Choice                                           |
| ------------- | ------------------------------------------------ |
| Framework     | Next.js 16 (App Router, Turbopack)               |
| Language      | TypeScript                                       |
| Admin / CMS   | Payload CMS 3 (same Next.js app, `/admin`)       |
| Database      | PostgreSQL (Supabase in prod, Docker locally)    |
| Styling       | Tailwind CSS 4 (design tokens in `globals.css`)  |
| UI foundation | shadcn-style primitives + Radix + lucide-react   |
| Animation     | Motion                                           |
| Rich text     | Lexical (`@payloadcms/richtext-lexical`)         |
| Images        | sharp processing + persistent Cloudinary storage |
| Rate limiting | Upstash Redis (distributed across Vercel)        |

Production integrations include Cloudflare Turnstile, Upstash rate limiting,
Cloudinary, Resend and Sentry. PostHog and GA4 are consent-gated and activate only
when their public project identifiers are configured. See `.env.example` for the
environment and secret checklist.

---

## Prerequisites

- **Node.js ≥ 20.9** (developed on 22.x)
- **npm** (repo is npm-based; no pnpm/yarn required)
- **PostgreSQL** — the quickest path is Docker (`docker compose up -d`)

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# then edit .env — at minimum set PAYLOAD_SECRET (a local .env may already exist)

# 3. Start Postgres (Docker). Matches the default DATABASE_URI in .env.example.
docker compose up -d

# 4. Apply the committed database schema
npm run payload -- migrate

# 5. Seed the catalogue (13 tours and initial dated departures)
npm run seed

# 6. Run the app
npm run dev
```

Then:

- Marketing site → <http://localhost:3000>
- Admin panel → <http://localhost:3000/admin>
  (create the first Super Admin at `/admin/create-first-user`, or set both
  `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` before the first seed)

> Public catalogue pages, the admin, APIs and seed require a reachable
> `DATABASE_URI`. Database auto-push is disabled; use committed migrations so
> development, preview and production always share the same schema.

---

## Scripts

| Script                       | Purpose                                            |
| ---------------------------- | -------------------------------------------------- |
| `npm run dev`                | Start the dev server (Next + Payload admin)        |
| `npm run build`              | Production build (`next build`)                    |
| `npm run start`              | Serve the production build                         |
| `npm run seed`               | Load categories, destinations & the 13 tours       |
| `npm run generate:types`     | Regenerate `src/payload-types.ts` from the config  |
| `npm run generate:importmap` | Regenerate the admin import map (after UI changes) |
| `npm run payload -- migrate` | Apply committed PostgreSQL migrations              |
| `npm run typecheck`          | `tsc --noEmit`                                     |
| `npm run lint`               | ESLint                                             |
| `npm run test:int`           | Vitest integration tests                           |
| `npm run test:e2e`           | Playwright e2e tests                               |

---

## Cloudinary media storage

Payload enables persistent Cloudinary storage when all three server-only
credentials are present: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and
`CLOUDINARY_API_SECRET`. Set `CLOUDINARY_FOLDER` per environment, for example
`trivoxo/development`, `trivoxo/preview` and `trivoxo/production`.

Admin uploads keep their originals and receive automatic-format and
automatic-quality delivery URLs. Deleting a Media document also deletes its
Cloudinary asset. Without the credentials, local file storage remains active.
Files committed under `public/` are not moved or changed by this integration.

Apply `npm run payload -- migrate` before enabling the Cloudinary credentials
against an existing database.

---

## Distributed rate limiting

Public booking, event-order, checkout, enquiry, trip-lookup, newsletter,
availability and private-download entry points are protected with endpoint-specific
sliding-window limits in Upstash Redis. Vercel Marketplace supplies
`KV_REST_API_URL` and `KV_REST_API_TOKEN` to Production and Preview.

Only a salted hash of the client address is used as the Redis identifier. Raw IP
addresses and customer emails are not stored in rate-limit keys. If Redis is not
configured locally, or it has a temporary outage, requests fail open and the server
logs the configuration/runtime problem so booking availability is preserved.

---

## Project structure

```
src/
  app/
    (frontend)/          # Public marketing site
      layout.tsx         #   fonts + Header/Footer shell
      page.tsx           #   homepage (12 sections)
      globals.css        #   Tailwind v4 + Trivoxo design tokens
    (payload)/           # Payload admin + REST/GraphQL API (generated)
    api/                 # Availability, hold cleanup, newsletter routes
  access/roles.ts        # RBAC helpers (§80)
  collections/           # Payload collections (the data model)
  globals/SiteSettings.ts# No-code contact / brand settings
  components/            # UI primitives, header/footer, experience card
  fields/                # Reusable field builders (slug, seo)
  lib/                   # constants, formatting, catalogue data, helpers
  migrations/            # Production PostgreSQL migrations
  seed/                  # Catalogue + initial departure seed
docs/                    # Brochure, redesign plan (PDFs), OPEN_DECISIONS.md
```

---

## Admin & roles

One back office at `/admin` serves both **content** and **operations**. Access is
role-gated (`src/access/roles.ts`):

- **Super Admin** — everything
- **Operations Manager** — tours, bookings, customers, availability
- **Content Editor** — pages, guide, destinations, tours, media
- **Event Manager** — events, tickets, check-in
- **Finance** — payments, refunds, reports
- **Check-in Staff** — guest list / scanner only

Admin collections are grouped in the sidebar (Catalogue, Operations, Events,
Content, Enquiries, System) to keep it approachable for non-technical staff.

---

## Data model

Collections: `users`, `media`, `destinations`, `experience-categories`,
`experiences`, `reviews`, `departures`, `bookings`, `customers`, `coupons`, `events`, `posts`
(Ghana Guide), `pages`, `newsletter-subscribers`, `corporate-enquiries`,
`custom-trip-requests`. Global: `site-settings`.

`experiences` is the core product and supports tiered group pricing, seasonal/
resident pricing scaffolding, availability rules (incl. weekend-only like Dodi
Island), capacity limits, drag-to-reorder itineraries, inclusions/exclusions, and
per-activity metadata — all editable without code.

`departures` stores the real date/time, open/closed state and capacity. Active
booking holds and confirmed bookings consume that capacity under a PostgreSQL
row lock; remaining seats are derived rather than stored as a drift-prone counter.

---

## Roadmap

**Done**

- Combined Next.js + Payload app on Postgres — typechecks, builds, lints
- Full admin data model + RBAC + drafts/versioning; seed for categories, 6
  destinations, the 13 brochure tours (Capital Pulse corrected), 2 events,
  4 guide posts and content-page stubs
- **Public site (content-complete):** home; experiences (browse + filters +
  detail + booking request); destinations; events; corporate, custom-trip &
  travel-services enquiry forms; Ghana Guide; about; contact; safety; FAQs;
  legal pages; My Trips guest lookup
- **Booking inventory:** real departures, live capacity checks, transactional
  seat holds, 20-minute timestamp expiry, stale-hold reconciliation and
  double-booking protection across website and staff-created bookings
- **Live data:** the public site reads from Payload (local API, ISR
  `revalidate = 60`), not the static modules — admin edits appear without a
  rebuild. The `src/lib/data/*` catalogue modules remain the seed's source.
- **SEO:** JSON-LD (Organization + Experience/Event/Article), sitemap.xml,
  robots.txt
- **Admin:** custom analytics dashboard (today's departures, bookings,
  revenue, pending enquiries, source breakdown, reporting periods) + a
  check-in scanner view
- **Payments:** Paystack checkout + verified idempotent webhook and callback,
  converting the hold to confirmed inventory, with a Finance-review path for
  mismatches (§45–46). Runs in test mode until live keys are set.
- **Event ticketing (§64–66):** event orders + attendee details, Paystack
  ticket checkout, transactional per-ticket-type stock, **signed QR tickets**,
  and an admin **check-in scanner** with one-time (duplicate-scan-proof) admit
- **Transactional email & documents:** Resend confirmations (gated on
  `RESEND_API_KEY`), PDF voucher and calendar (ICS) downloads
- **Photography & reviews:** real Ghana photos across destinations, experiences,
  events, guide and services + the leadership team; verified reviews on the
  homepage and experience pages (with star ratings)
- **Abuse protection:** distributed Upstash Redis limits for public reads and
  mutations, with privacy-safe identifiers and retry guidance

**Next (needs credentials or business inputs — see [.env.example](.env.example) and [docs/OPEN_DECISIONS.md](docs/OPEN_DECISIONS.md))**

- **Go-live config:** Paystack **live** keys (and rotate the exposed test
  secret), Resend sending-domain verification, Cloudinary credentials and an
  upload/delete smoke test, Cloudflare Turnstile, Supabase
  prod/staging DB, Cloudflare DNS/WAF + production secrets, Sentry / PostHog / GA4
- **Payment ops:** assisted/automatic Paystack refunds + partial-refund records
  and a Finance refund UI; full staging webhook test matrix; a controlled
  low-value live payment
- **Pricing:** connect coupons to checkout; enforce seasonal / public-holiday
  pricing; activate resident & private pricing; deposit + balance workflows
- **Customer lifecycle:** verified-review invitation emails; departure reminders
  and itinerary-update emails; optional customer accounts / magic links;
  abandoned-booking reminders
- **Content & launch:** final photography swaps; Ghanaian legal review of
  policies; export old WordPress URLs + 301 redirects; content/spelling audit;
  real-device accessibility + performance audit
- **Business inputs:** resident prices, confirmed international prices, exact
  durations & departure times, pickup zones, private-tour prices, the Capital
  Pulse "Osu" decision

See the redesign plan in `docs/` for the full Phase 1–3 breakdown.

---

## Open business decisions

Several business rules must be confirmed by Trivoxo before booking logic is
finalised (group-discount tiers, resident pricing, cancellation/refund policy,
canonical phone number, the Capital Pulse "Osu" question, and more). These are
tracked in **[docs/OPEN_DECISIONS.md](docs/OPEN_DECISIONS.md)**.

---

## Deployment (intended)

Cloudflare (DNS/WAF) → Vercel (Next.js + Payload admin) → Supabase Postgres, with
Cloudinary (media), Paystack (payments) and Resend (email). Use separate
Development / Staging / Production environments; never run payment or schema
changes against production. Production uses committed Payload migrations. Set
`CRON_SECRET` so Vercel can authenticate stale-hold reconciliation; expired
holds stop consuming capacity immediately from their timestamp, independent of
that housekeeping schedule.
