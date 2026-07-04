# Migration Guide

## Why phased, and what the phases are

The original brief specifies a full platform: Next.js + TypeScript migration,
Supabase (DB/Auth/Storage), M-Pesa Daraja payments, a 7-section admin
dashboard, a reviews pipeline, and four full manuals covering security, SEO,
version management, and deployment. That's a genuine multi-week build for a
team, not something to responsibly hand over as one uninterrupted, unreviewed
pass — particularly the payment and auth pieces, where a mistake costs real
money or leaks real customer data.

So the work is split into phases, each a complete, working checkpoint:

| Phase | Scope | Status |
|---|---|---|
| **1** | Next.js/TS migration (visual parity), mobile UX (Part 2), checkout flow UI + minimal orders table (Part 3) | Delivered |
| **2** | Full Supabase schema (Manual 01): products, sizes/colors/stock, reviews pipeline (Part 4), customers, RLS policies, minimal admin auth + review moderation | **This delivery** |
| 3 | M-Pesa Daraja STK Push (Manual 02) — needs your Till/Paybill credentials wired into Daraja | Next |
| 4 | Admin dashboard (Part 6): Overview, Products, Orders, Reviews, Customers, Analytics, Settings — extends Phase 2's auth + reviews page rather than replacing it | After Phase 3 |
| 5 | SEO (Manual 04), monitoring (Sentry), analytics (GA/Search Console), full CSP + security hardening (Manual 03, Part 11), version-management workflow (Manual 03) | Last |

Each phase's manual will be delivered as that phase starts, written against
the actual schema/infrastructure that exists by then — writing Manual 01's
SQL today, before Phase 2 design decisions are made, would mean rewriting it
anyway.

## What "preserve everything" meant in practice

Per the brief, nothing about the visual identity, product content, or
category structure changed. Concretely:

- `style.css` (2,719 lines) was copied into `app/globals.css` **unedited**,
  then a clearly-marked `PHASE 1 ADDITIONS` block was appended at the very
  end for new features (back-to-top button, price filter, checkout modal,
  quick-view gallery arrows). Two small in-place edits were made to existing
  rules, both documented inline in the CSS itself:
  - `.wish-btn` rules removed (the heart icon is retired — see Part 2.2)
  - `.qv-img-side img` changed from `object-fit: cover` to `contain` (Part 2.2's
    "view the full image uniformly" requirement)
- All 87 products, their Cloudinary image URLs, and their copy are byte-for-byte
  identical — `data/products.ts` is a mechanical TypeScript port of
  `data/products.js`, not a rewrite.
- Fonts are the same three families (Bodoni Moda, Cormorant Garamond, DM
  Sans), now self-hosted via `next/font` instead of a Google Fonts `<link>`
  tag — see Part 2.5 below for why.
- Every section, class name, and DOM id from the legacy markup was kept
  (`#qv-overlay`, `.product-card`, `#cart-drawer`, etc.) so the CSS didn't
  need to be touched at all for 95% of components.

## Legacy → Next.js file mapping

| Legacy file | Became |
|---|---|
| `index.html` (all sections) | `app/page.tsx` + one component per `<section>` in `/components` |
| `style.css` | `app/globals.css` (unedited, + Phase 1 additions appended) |
| `script.js` (~1,100 lines, one big file) | Split into `/hooks` (state that used to be global `var`s: `cart`, `qvCurrentProduct`, etc., now React Context) and per-component effects (the DOM-query-and-mutate functions like `initNav()`, `initHero()`) |
| `data/products.js` | `data/products.ts` (typed, values unchanged) |
| `assets/logo-gold-transparent.png` | `public/assets/logo-gold-transparent.png` |

## The one deliberate behavioral change: ordering

Per Part 3 of the brief, every "Order via WhatsApp" action (product cards,
Quick View, cart) now opens the new Checkout modal instead of building a
`wa.me` deep link. **Generic contact channels were left alone** — the
floating WhatsApp button, the footer social links, and the "Chat on
WhatsApp" contact-section CTA still go to WhatsApp, because those are
genuine "talk to us" channels, not the order mechanism the brief asked to
replace. See `docs/IMPLEMENTATION_GUIDE.md` for the full list of what
changed vs. what's untouched.

## Running the legacy site side-by-side

The original `Kiemo_products_integrated/` folder (from your upload) hasn't
been modified — it's a completely separate, standalone static site. You can
keep it live as a fallback while testing this Next.js version, and there's
no shared state or shared deploy target between them.
