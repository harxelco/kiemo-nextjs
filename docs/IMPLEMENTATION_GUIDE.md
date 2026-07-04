# Implementation Guide — Phase 1

Feature-by-feature record of what was built, mapped to the brief's Part
numbers, for handover and future reference.

## Part 1 — Migration

- Next.js 14→**16.2.10** (App Router, TypeScript). Started the brief's
  suggested "14" but upgraded before delivery: `npm install` flagged the
  originally-planned 14.2.15 with a known CVE, and 16.2.10 is both the
  actual current stable release ("Next.js (latest)" per the brief) and
  still supports React 18, so the upgrade carried no other code changes.
- Folder structure matches the brief exactly: `/app /components /lib /store
  /types /public` — `/store` in the brief maps to `/hooks` here (React
  Context providers), since App Router has no separate "store" convention;
  functionally the same role.
- `next/image` used throughout for the existing Cloudinary photography —
  same URLs, same photos, automatic resizing/format negotiation added.

## Part 2 — Mobile UX

**2.1 Carousel** — the existing 3D-stack carousel logic (`translate3d` +
`rotateY` positioning) was preserved exactly. Added: `backface-visibility:
hidden` (prevents a flicker Safari/iOS shows on 3D-transformed layers), and
a continuous subtle float animation on the *inner image* of the active
slide only — deliberately not on the slide's own transform, since that's
already driven by JS for the stack positioning and would fight it.

**2.2 Quick View → sole hover action** — `.wish-btn` (heart icon) markup
and CSS removed. `.qv-btn` already had `flex: 1` in the existing CSS, so it
fills the space automatically with no layout changes needed. Separately,
`.qv-img-side img` changed from `object-fit: cover` to `contain` so the
full product photo is always visible, uncropped — this was called out
explicitly in the brief ("view the full size image... uniformly").

**2.3 Back To Top** — new component, left side per spec, appears after
480px of scroll, smooth-scrolls to top.

**2.4 Quick View gallery** — desktop: hover arrows over the image. Mobile:
same arrows + swipe (plain touch event deltas, no library). All gallery
images for a product mount simultaneously and crossfade via CSS opacity
rather than swapping `src` on one `<img>` — this is what makes it
genuinely "preloaded": by the time someone taps a thumbnail or swipes,
`next/image` has already fetched and decoded that frame.

**2.5 Loading speed** —
- Fonts moved from a render-blocking Google Fonts `<link>` to self-hosted
  `next/font/google` (automatic subsetting, `font-display: swap`, no
  third-party request).
- All images route through `next/image`: automatic AVIF/WebP negotiation,
  responsive `sizes`, lazy loading below the fold, blur-free layout
  stability (explicit dimensions or `fill` + positioned parent everywhere).
- Nothing about visual quality was reduced — same source files, same
  Cloudinary origin, just negotiated formats/sizes at request time.

**2.6 Our Story mobile image** — on mobile the image box switches from the
desktop 3:4 portrait crop to a 4:3 rectangle at full width with
`var(--radius-soft)` (18px, an existing design token) instead of the 4px
radius used elsewhere, plus more breathing room in the surrounding stack.

**2.7 Price filter** — new min/max inputs in the Shop section, combined
with the existing category + search filters (all three narrow the same
product set). Ships alongside a "no results" state that also fires for
price/category combinations that zero out, not just search — the existing
"no results" box was search-only before, but with a third filter dimension
added, silently showing an empty grid would be a worse experience than
messaging it.

## Part 3 — Commerce changes

Every "Order via WhatsApp" action (product card, Quick View, cart) now
opens the new **Checkout modal** instead of building a `wa.me` link:

- Collects Full Name, Phone Number, Pickup Method (Pickup at Shop /
  Delivery).
- If Delivery: a Nairobi-area dropdown (hard-restricted to Nairobi, both in
  the UI and re-validated server-side in the API route — a client can't
  bypass the restriction by editing the request).
- Shows a running order summary (items, quantities, subtotal) before and
  after submission.
- Submits to `POST /api/orders`, which validates everything again
  server-side (never trusts client input for the final record), computes
  the subtotal itself from item prices rather than trusting a client-sent
  total, and inserts into Supabase using the **service role key — server
  only, never sent to the browser**.
- If Supabase isn't configured yet (fresh deploy, before you've completed
  `docs/SUPABASE_PHASE1_SETUP.md`), the API returns a clear error with a
  WhatsApp fallback link — it does **not** pretend the order saved. Losing
  a real customer order silently would be worse than an honest "checkout
  isn't fully live yet, message us instead."

**What was deliberately left alone:** the floating WhatsApp button, footer
social links, and Contact section's "Chat on WhatsApp" — these are general
contact channels, not the order mechanism, so Part 3's "replace ordering"
instruction doesn't apply to them. The pre-existing "Pay via M-Pesa" demo
button/modal in the cart is also completely untouched — same demo it always
was; Part 8 (Phase 3) is where that becomes real.

## Parts 4–11 — Not in this delivery

Reviews→Supabase pipeline (Part 4), full product model (Part 5), admin
dashboard (Part 6), and the four manuals (Parts 7–10) are Phase 2+ per the
phasing plan in `MIGRATION_GUIDE.md`. The review form on the Testimonials
section still works exactly as it did on the legacy site — client-side only,
same as before — since wiring it to Supabase without the moderation queue
and admin approval flow (Part 4's actual point) would be half a feature.

Security (Part 11) baseline hardening that costs nothing to do now is
already in `next.config.mjs` (`X-Frame-Options`, `X-Content-Type-Options`,
`Referrer-Policy`) and in the orders API route (input validation,
sanitization, rate limiting, server-side revalidation of price/subtotal). A
full CSP is deliberately deferred — see the comment in `next.config.mjs` for
why shipping one now would be premature.

## Part 4 — Reviews (Phase 2)

Full pipeline, enforced at the database level via RLS, not just app code:

- **Submit**: the review form (Testimonials section) posts to
  `POST /api/reviews`, which validates/sanitizes/rate-limits, then inserts
  using the **anon key** (not service role) — the row can only ever land as
  `status = 'pending'` because the database's own RLS `WITH CHECK` clause
  enforces it (`supabase/migrations/0004_phase2_reviews.sql`), not because
  the route handler remembered to set it correctly.
- **Moderate**: `/admin/reviews` (Supabase Auth-gated, see below) lists
  pending reviews and lets an admin Approve/Reject. The update goes through
  `PATCH /api/admin/reviews/[id]`, executed as the *signed-in admin's own
  session* — if that account isn't in `admin_roles`, the RLS policy makes
  the update silently affect zero rows, which the route treats as a 403.
- **Publish**: approved reviews are fetched server-side
  (`lib/get-approved-reviews.ts`) on every homepage load and merged into
  the existing testimonials marquee alongside the curated set that was
  already on the legacy site — real reviews lead, curated ones fill out the
  rest. Nothing about the curated testimonials was removed; they're real
  historical customer sentiment, not placeholder copy.

**Minimal admin auth, not the full Part 6 dashboard**: `/admin/login` +
`/admin/reviews` is a working, narrowly-scoped moderation screen — Supabase
Auth (email/password), middleware-gated (`proxy.ts`), RLS-enforced.
It is deliberately *not* the 7-section Overview/Products/Orders/Reviews/
Customers/Analytics/Settings dashboard from Part 6 — that's still Phase 4.
Building it now was necessary because Part 4's flow explicitly ends in
"Admin Dashboard -> Approve/Reject -> Publish," and a review pipeline with
no way to ever approve anything isn't actually a working feature. Phase 4
will very likely restructure `/admin` into a proper multi-section layout
that this reuses the auth foundation for, rather than throwing it away.

## Part 5 — Product model (Phase 2)

The `products` table (`supabase/migrations/0003_phase2_products.sql`) now
exists in Supabase, seeded with all 87 products exactly as they appear in
`data/products.ts` — sizes/colors/stock stay optional/empty, per the
brief's "keep these optional for now, don't force values."

**The live storefront still reads from `data/products.ts`, not this
table, in Phase 2.** That's deliberate sequencing, not an oversight:
switching the storefront's data source is a real behavior change (moving
from a build-time static array to a runtime database query touches
caching, revalidation, and error-handling in ways worth doing carefully),
and there's no user-facing benefit to doing it before Phase 4's dashboard
actually needs to write to that table. Shipping the schema now means
Phase 4 starts with real seeded data instead of an empty table.

## Part 7 — Supabase Manual (Phase 2)

Delivered as `docs/MANUAL_01_SUPABASE.md` — full schema reference, the
RLS strategy (and why it's two different patterns for orders vs.
reviews), indexing rationale, storage, backups, and audit logging.
