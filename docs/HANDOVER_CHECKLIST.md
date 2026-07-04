# Handover Checklist (Phases 1 + 2)

## What's done and verified

- [x] Next.js 16 + TypeScript App Router migration — builds clean
      (`npm run build` succeeds, `tsc --noEmit` passes, `eslint` passes
      with zero errors).
- [x] Visual identity preserved — same CSS, same fonts (self-hosted), same
      87 products, same photography, same category structure.
- [x] Mobile UX (Part 2): carousel polish, Quick View as sole hover action,
      Back to Top, gallery arrows + swipe + preloading, image loading
      optimization, Our Story mobile treatment, price filter.
- [x] Commerce (Part 3): Checkout modal replacing WhatsApp ordering, Nairobi
      delivery restriction, order summary, server-side validation.
- [x] Full Supabase schema (Part 5, Manual 01): `products` (seeded with
      all 87), `reviews`, `customers` (view), `admin_roles`, `audit_log`,
      storage bucket — all with RLS.
- [x] Reviews pipeline end-to-end (Part 4): submit -> pending -> admin
      approve/reject -> published on the homepage.
- [x] Minimal admin auth (`/admin/login`, `/admin/reviews`) — Supabase
      Auth, middleware-gated, RLS-enforced.

## What YOU need to do before this is live for real customers

### From Phase 1 (if not already done)
- [ ] Create the Supabase project — `docs/SUPABASE_PHASE1_SETUP.md`.
- [ ] Set environment variables in Vercel.
- [ ] Push to a git repo and deploy — `docs/DEPLOYMENT_GUIDE.md`.
- [ ] Run the post-deploy smoke test, including one real test order.
- [ ] Decide on a custom domain, set `NEXT_PUBLIC_SITE_URL`.

### New for Phase 2
- [ ] **Run all seven Phase 2 migrations**, in order — see
      `docs/MANUAL_01_SUPABASE.md` section 1. `0003_phase2_products.sql`
      is large (87 product rows) — it's one file, just paste the whole
      thing into the SQL Editor.
- [ ] **Create your admin account** — Manual 01, section 4. Two manual
      steps (create the Supabase Auth user, then one `insert` giving them
      the admin role). Do this for yourself before testing `/admin`.
- [ ] **Test the full review loop end-to-end**: submit a review on the
      live site -> log into `/admin/reviews` -> approve it -> confirm it
      appears in the homepage testimonials marquee within one page load
      (server-rendered, so a hard refresh, not just client navigation).
- [ ] **Bookmark `/admin/reviews`** for whoever will be moderating —
      there's no notification system yet (Phase 4/5 territory), so
      someone needs to check it periodically or new reviews just sit
      pending indefinitely.

## What's explicitly NOT ready yet (don't advertise it)

- Real M-Pesa payment — the "Pay via M-Pesa" button in the cart is still
  the same demo it always was. No money moves. Phase 3.
- The storefront's product catalog is still the static file, not the new
  Supabase `products` table — editing a product means editing
  `data/products.ts` and redeploying, exactly like Phase 1. The table
  exists and is seeded, but nothing reads from it yet. Phase 4.
- No admin dashboard beyond reviews — no way to see orders, manage
  products, or view analytics through a UI yet (Supabase's own Table
  Editor works for orders/products in the meantime). Phase 4.
- No SEO/analytics/monitoring wiring yet (GA, Search Console, Sentry).
  Phase 5.

## Questions worth deciding before Phase 3 starts

- Do you have your Safaricom Daraja API credentials yet (Till/Paybill
  number, Consumer Key/Secret)? Phase 3 can't start meaningfully without
  them — at minimum, sandbox credentials to build and test against.
- Sandbox first, or willing to test against production credentials
  directly? (Sandbox is strongly recommended for the initial build.)
- Who should receive the "new order" and "new payment" notifications once
  they exist — a shared email, a WhatsApp number, both?
