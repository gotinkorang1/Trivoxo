# Trivoxo V2

**Ghana travel, tour, adventure, events & experience commerce platform.**

A modern travel-commerce system for tours, outdoor adventures, events, corporate
travel, custom trips and travel services — backed by a **zero-code operational
CMS** so Trivoxo staff can run the business (create tours, change prices, publish
events, manage bookings) without a developer.

This repository is the **scaffold / Phase-1 foundation**: the app runs, the admin
is fully modelled, the marketing homepage is built, and the catalogue is
seed-ready. See [Roadmap](#roadmap) for what is intentionally still ahead.

---

## Tech stack

| Area            | Choice                                             |
| --------------- | -------------------------------------------------- |
| Framework       | Next.js 16 (App Router, Turbopack)                 |
| Language        | TypeScript                                         |
| Admin / CMS     | Payload CMS 3 (same Next.js app, `/admin`)         |
| Database        | PostgreSQL (Supabase in prod, Docker locally)      |
| Styling         | Tailwind CSS 4 (design tokens in `globals.css`)    |
| UI foundation   | shadcn-style primitives + Radix + lucide-react     |
| Animation       | Motion                                             |
| Rich text       | Lexical (`@payloadcms/richtext-lexical`)           |
| Images          | sharp locally · Cloudinary intended for production |

Planned integrations (env placeholders already in `.env.example`): Paystack
(payments), Resend (email), Cloudflare Turnstile (bot protection), PostHog / GA4
(analytics), Sentry (monitoring), Mapbox/Google Maps.

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

# 4. Seed the catalogue (creates the first admin + the 13 brochure tours)
npm run seed

# 5. Run the app
npm run dev
```

Then:

- Marketing site → <http://localhost:3000>
- Admin panel → <http://localhost:3000/admin>
  (first login: `admin@trivoxogh.com` / `changeme123` — change immediately;
  override with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` before seeding)

> The **homepage renders without a database** (it reads a static catalogue module),
> so `npm run dev` and `npm run build` work before Postgres is wired up. The admin,
> API and seed require a reachable `DATABASE_URI`.

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
| `npm run typecheck`          | `tsc --noEmit`                                     |
| `npm run lint`               | ESLint                                             |
| `npm run test:int`           | Vitest integration tests                           |
| `npm run test:e2e`           | Playwright e2e tests                               |

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
    api/newsletter/      # Newsletter subscribe route
  access/roles.ts        # RBAC helpers (§80)
  collections/           # Payload collections (the data model)
  globals/SiteSettings.ts# No-code contact / brand settings
  components/            # UI primitives, header/footer, experience card
  fields/                # Reusable field builders (slug, seo)
  lib/                   # constants, formatting, catalogue data, helpers
  seed/                  # Seed script
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
`experiences`, `reviews`, `bookings`, `customers`, `coupons`, `events`, `posts`
(Ghana Guide), `pages`, `newsletter-subscribers`, `corporate-enquiries`,
`custom-trip-requests`. Global: `site-settings`.

`experiences` is the core product and supports tiered group pricing, seasonal/
resident pricing scaffolding, availability rules (incl. weekend-only like Dodi
Island), capacity limits, drag-to-reorder itineraries, inclusions/exclusions, and
per-activity metadata — all editable without code.

---

## Roadmap

**Done**

- Combined Next.js + Payload app on Postgres — typechecks, builds, lints
- Full admin data model + RBAC + drafts/versioning; seed for categories, 6
  destinations, the 13 brochure tours (Capital Pulse corrected), 3 events,
  4 guide posts and content-page stubs
- **Public site (content-complete):** home; experiences (browse + filters +
  detail + booking request); destinations; events; corporate, custom-trip &
  travel-services enquiry forms; Ghana Guide; about; contact; safety; FAQs;
  legal pages; My Trips guest lookup
- Booking request flow creates real bookings in Payload (capture only)
- **Live data:** the public site reads from Payload (local API, ISR
  `revalidate = 60`), not the static modules — admin edits appear without a
  rebuild. The `src/lib/data/*` catalogue modules remain the seed's source.
- **SEO:** JSON-LD (Organization + Experience/Event/Article), sitemap.xml,
  robots.txt
- **Admin:** custom dashboard summary widget (today's departures, bookings,
  pending enquiries, published experiences)

**Next (not yet built)**

- **Payments:** Paystack checkout + verified idempotent webhook, and the
  transactional booking hold (§38, §46) — needs Paystack keys; flagged for
  deliberate human review
- **Event ticketing:** orders model, purchase, QR tickets + check-in (§65–66)
- Confirmation emails / vouchers (Resend)
- Cloudinary storage adapter + real photography; redirects from the old site

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
changes against production.
