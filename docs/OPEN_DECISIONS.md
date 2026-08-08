# Open decisions — needed from Trivoxo

These business rules must be confirmed before the booking/pricing logic is
finalised. The **system already supports them** — this is missing data, not
missing architecture. Grouped by urgency. (§ refers to the redesign plan.)

## Blocking the booking engine

| # | Decision | Status | Where it lands |
|---|----------|--------|----------------|
| 1 | Exact group-discount tiers (3–4, 5–8, 9–14, 15+) | **Missing** | `experiences.priceTiers` |
| 2 | Local / resident prices (per package) | Missing | `experiences.visitorPricing` (disabled until provided) |
| 3 | International prices confirmed for all packages | Needs confirmation | `experiences.priceFrom` |
| 4 | Child prices & age bands | Missing | booking guests / pricing |
| 5 | Tour durations (several packages) | Missing | `experiences.duration` (placeholders now) |
| 6 | Departure times & pickup zones | Missing | `experiences.itinerary` / `pickupInfo` |
| 7 | Max capacity per departure | Missing | `experiences.maxGuests` |
| 8 | Cancellation, refund, no-show & rescheduling policy | Missing | policy fields + legal pages |
| 9 | Private-tour pricing | Missing | `experiences.privatePrice` |
| 10 | Event ticket refund rules | Missing | events module |

## Content / brand

| # | Decision | Status |
|---|----------|--------|
| 11 | **Capital Pulse "Osu" question** — is Osu part of the tour, or should the reference be removed from the description? (§26) | Needs clarification |
| 12 | Canonical slogan — brochure "Explore. Adventure. Connect." vs site "Experience. Explore. Express." (§6). Scaffold uses the brochure version. | Needs sign-off |
| 13 | Final brand HEX values from the approved vector logo (§7). Scaffold uses provisional tokens in `globals.css`. | Needs assets |
| 14 | December / seasonal & public-holiday pricing | Needs decision |
| 15 | Guide languages | Needs decision |

## Contact details (§98)

One canonical primary phone / WhatsApp number must be chosen:

- Site currently lists **0593962111**
- Brochure lists **+233 531 014 111** and **+233 244 833 280**
- Email is consistent: **info@trivoxoghana.com**
- Address provided: **Plantsville Residence, Poultry Farm Ave, Accra, Ghana**

Scaffold placeholder uses `+233 531 014 111` as primary (in `src/lib/constants.ts`
and the `site-settings` global). **Confirm before launch.**

## Confirmed (already reflected in the build)

- Capital Pulse itinerary corrected: Makola → Jamestown → Black Star Square →
  Kwame Nkrumah Memorial Park → National Museum → Arts Centre (§25)
- Capital Pulse **lunch is excluded**; attraction entry fees **included** (§25)
- Standard base pricing assumes **2+ travellers**; 3+ eligible for reduced rates (§32)
- Dodi Island runs **weekends + public holidays only** (§36)
