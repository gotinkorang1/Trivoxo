# Open decisions — needed from Trivoxo

These business rules must be confirmed before the booking/pricing logic is
finalised. The **system already supports them** — this is missing data, not
missing architecture. Grouped by urgency. (§ refers to the redesign plan.)

## Booking-engine rules

Operational **defaults are now set** in `src/lib/policies.ts` and reflected in the
seed, the booking quote and the legal pages. The remaining "Missing" rows are
per-experience data (real costs, durations, timings) only Trivoxo can supply.

| #   | Decision                                        | Status                                                          | Where it lands                                         |
| --- | ----------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------ |
| 1   | Group-discount tiers                            | ✅ **Set** — 10% (3–4), 15% (5–8), 20% (9–14), 15+ custom quote | `experiences.priceTiers`, `policies.ts`                |
| 2   | Local / resident prices (per package)           | Missing (needs entry-fee data)                                  | `experiences.visitorPricing` (disabled until provided) |
| 3   | International prices confirmed for all packages | Needs confirmation                                              | `experiences.priceFrom`                                |
| 4   | Child prices & age bands                        | ✅ **Set** — infant 0–2 free, child 3–11 @ 60%, adult 12+       | `policies.ts` / booking quote                          |
| 5   | Tour durations (several packages)               | Missing                                                         | `experiences.duration` (placeholders now)              |
| 6   | Departure times & pickup zones                  | Missing                                                         | `experiences.itinerary` / `pickupInfo`                 |
| 7   | Max capacity per departure                      | ✅ **Set** — default 2–15 (tune per vehicle)                    | `experiences.maxGuests`                                |
| 8   | Cancellation, refund, no-show & rescheduling    | ✅ **Set** — see legal pages                                    | `policies.ts` + legal pages                            |
| 9   | Private-tour pricing (exact rate)               | Missing (concept set: private option for solo)                  | `experiences.privatePrice`                             |
| 10  | Event ticket refund rules                       | ✅ **Set** — non-refundable, transferable ≥72h                  | `policies.ts` + legal pages                            |
| 11  | Checkout seat-hold duration                     | ✅ **Set** — 20 minutes; expiry is timestamp-based              | `BOOKING_HOLD` / booking inventory                     |

## Content / brand

| #   | Decision                                                                                                                   | Status                                                                                                                                                        |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 12  | **Capital Pulse "Osu" question** — is Osu part of the tour, or should the reference be removed from the description? (§26) | Needs clarification                                                                                                                                           |
| 13  | ~~Canonical slogan~~ — **RESOLVED: "Experience. Explore. Express."** (official site copy). Applied.                        | ✅ Confirmed                                                                                                                                                  |
| 14  | Brand palette and official logo variants (§7)                                                                              | ✅ **Set** — orange `#f15a29`, gold `#f9b233`; coloured, black and white wordmarks are used adaptively from `public/logo/`.                                   |
| 15  | December / seasonal & public-holiday pricing                                                                               | ✅ **Set** — day tours flat; 15% peak premium on premium experiences & events for Dec 15 – Jan 5 + major holidays (decision made; engine enforcement pending) |
| 16  | Guide languages                                                                                                            | ✅ **Set** — English default; Twi/Ga/Ewe on request; other languages with 7 days’ notice                                                                      |
| 17  | Ghanaian legal review of Privacy Policy and Terms of Use                                                                   | Required before production launch — operational drafts are now complete                                                                                       | `src/lib/data/legal.ts` |

## Contact details (§98)

**RESOLVED** from the official site copy:

- Primary phone / WhatsApp: **0593962111** (`+233 59 396 2111`) — applied in
  `src/lib/constants.ts` and the `site-settings` global defaults.
- Email: **info@trivoxoghana.com**
- Address: **Plantsville Residence, Poultry Farm Ave, Accra**
- Instagram: **@trivoxo_gh**
- Booking/enquiry emails also in use: kingdom@ / gideon@niiplantsghana.com.

Company note: **Trivoxo Limited Company is a subsidiary of Nii Plants Group.**

## Confirmed (already reflected in the build)

- Capital Pulse itinerary corrected: Makola → Jamestown → Black Star Square →
  Kwame Nkrumah Memorial Park → National Museum → Arts Centre (§25)
- Capital Pulse **lunch is excluded**; attraction entry fees **included** (§25)
- Standard base pricing assumes **2+ travellers**; 3+ eligible for reduced rates (§32)
- Dodi Island runs **weekends + public holidays only** (§36)

### Business rules — agreed defaults (in `src/lib/policies.ts`)

- **Group discounts:** 10% (3–4), 15% (5–8), 20% (9–14), 15+ by custom quote.
- **Children:** infants 0–2 free; children 3–11 pay 60% of the adult rate.
- **Deposits:** day tours paid in full; multi-day/premium/corporate take a 50%
  deposit, balance due 7 days before. Paystack fee absorbed (no surcharge).
- **Booking notice:** 24h day tours (48h where permits apply), 7 days multi-day.
  Capacity default 2–15. Checkout seats are held for 20 minutes.
- **Cancellation** — day tours: free ≥48h, 50% 24–48h, none <24h/no-show;
  multi-day: free ≥7d, 50% 3–7d, none <3d/no-show; events non-refundable but
  transferable ≥72h; refunds to original method within 5–10 business days.
- **Rescheduling:** one free change if ≥48h (day) / ≥7d (multi-day) before.

These are operational defaults to tune against real cost data; the exact
resident rates, durations, pickup zones and private-tour price still depend on
Trivoxo's figures (rows 2, 3, 5, 6, 9 above).
