# Kiemo Mens Wear — Next.js Storefront

Production Next.js (App Router, TypeScript) migration of the Kiemo Mens Wear
site. This delivery covers **Phases 1 & 2** of a phased rebuild — see
[`docs/MIGRATION_GUIDE.md`](docs/MIGRATION_GUIDE.md) for the full phase
plan, and [`docs/IMPLEMENTATION_GUIDE.md`](docs/IMPLEMENTATION_GUIDE.md) for
a feature-by-feature breakdown of what changed and why.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in Supabase values — see docs/SUPABASE_PHASE1_SETUP.md
npm run dev
```

Open http://localhost:3000. The site works and looks correct with **no**
environment variables set — the things that need Supabase configured are
checkout, submitting/reading reviews, and `/admin`.

## Folder structure

```
/app                  Next.js App Router — pages, layout, API routes
  /api/orders          POST endpoint the checkout modal submits to
  /api/reviews          POST endpoint the review form submits to
  /api/admin/reviews/[id]  PATCH endpoint for approve/reject (admin-only)
  /api/health           Simple health/readiness check
  /admin                Login + review moderation (Supabase Auth-gated)
  globals.css          All site styling (ported 1:1 from the legacy site,
                        with "PHASE 1 ADDITIONS" and "PHASE 2 ADDITIONS"
                        sections clearly marked at the bottom)
/components            React components, one per UI section/feature
  /admin                Admin-only components (review list, sign-out)
/hooks                 React Context providers (cart, quick view, checkout,
                        M-Pesa demo modal, shop category bridge)
/lib                   Formatting helpers, site config constants, Supabase
                        client factories (service-role, anon, browser auth,
                        server auth)
/data                  Product catalog (typed, ported from data/products.js)
                        and hero carousel image list
/types                 Shared TypeScript types (Product, Order, Review, CartItem)
/supabase/migrations   SQL migrations, numbered — run in order
/public/assets         Logo and other static assets
/docs                  All Part 12 deliverables — read these before deploying
proxy.ts          Gates /admin/* routes behind Supabase Auth
```

## Scripts

| Command           | What it does                                  |
|--------------------|------------------------------------------------|
| `npm run dev`       | Local dev server                               |
| `npm run build`     | Production build (also type-checks)            |
| `npm run start`     | Run the production build locally               |
| `npm run typecheck` | TypeScript check only, no build output         |
| `npm run lint`      | ESLint                                          |

## Setting up Supabase

Two docs, read in order:

1. [`docs/SUPABASE_PHASE1_SETUP.md`](docs/SUPABASE_PHASE1_SETUP.md) — the
   minimum to get checkout saving orders (one migration file).
2. [`docs/MANUAL_01_SUPABASE.md`](docs/MANUAL_01_SUPABASE.md) — the full
   schema (products, reviews, customers, admin roles, audit log, storage),
   run once you're ready for reviews + `/admin` to work (six more migration
   files, all in `supabase/migrations/`, numbered in the order to run them).

## What's NOT in this delivery yet

Real M-Pesa payment (the cart's "Pay via M-Pesa" button is the same demo
it always was), the full 7-section admin dashboard (Phase 2 ships a
minimal reviews-only `/admin`, not the full thing), customer accounts, and
SEO/monitoring wiring (GA/Search Console/Sentry). See
`docs/MIGRATION_GUIDE.md` for the complete phase plan.
