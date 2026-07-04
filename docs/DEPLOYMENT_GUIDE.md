# Deployment Guide — Phases 1 & 2 (Vercel)

## Prerequisites

- [ ] GitHub (or GitLab/Bitbucket) account to hold the repository — Vercel
      deploys from a git repo, not a raw folder upload.
- [ ] Vercel account (free tier is plenty for this stage).
- [ ] Supabase project created, with **all eight** migration files run in
      order — `docs/SUPABASE_PHASE1_SETUP.md` for the first one (orders,
      required for checkout), then `docs/MANUAL_01_SUPABASE.md` section 1
      for the remaining seven (products, reviews, admin auth, etc.,
      required for reviews and `/admin`). You *can* deploy with only some
      or none of this done — checkout/reviews will show a clear "not
      available yet" fallback and `/admin` will redirect to a login page
      that says Supabase isn't configured, rather than breaking — but do
      it first if you can.
- [ ] Your own admin account created (Manual 01, section 4) if you want to
      test `/admin/reviews` after deploying.

## 1. Push to a git repository

```bash
cd kiemo-nextjs
git init
git add .
git commit -m "Phases 1-2: Next.js migration, mobile UX, checkout, Supabase, reviews, admin auth"
git branch -M main
git remote add origin <your-new-empty-repo-url>
git push -u origin main
```

## 2. Import into Vercel

1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository** →
   select the repo you just pushed.
2. Framework Preset: Vercel auto-detects **Next.js** — leave it.
3. Build settings: leave the defaults (`npm run build`, output directory
   auto-detected). Don't override them unless you know why.
4. **Before clicking Deploy**, add environment variables (Project Settings
   → Environment Variables, or the form on this import screen):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` → your eventual production URL (e.g.
     `https://kiemomenswear.co.ke` or the `*.vercel.app` URL if you haven't
     set up a custom domain yet)
5. Click **Deploy**.

## 3. Custom domain (optional, recommended)

Project → Settings → Domains → add your domain, then follow Vercel's DNS
instructions (either an A/ALIAS record if the domain's registrar manages
DNS elsewhere, or nameserver delegation if you want Vercel to manage DNS
directly). Propagation is usually minutes, occasionally up to 48 hours.

Once the domain is live, update `NEXT_PUBLIC_SITE_URL` to match and
redeploy — it feeds the `<meta>` canonical/OpenGraph tags.

## 4. Post-deploy smoke test

Don't skip this — it takes two minutes and catches the two most common
first-deploy mistakes (missing env vars, and a stale cached deploy).

1. Visit `https://your-domain/api/health` → confirm
   `"supabaseConfigured": true` (or `false` with a clear plan to fix it —
   not a 500 error).
2. Load the homepage → confirm the hero carousel, fonts, and product grid
   all render correctly (this catches a botched build before real
   customers see it).
3. Add a product → open cart → Checkout → submit a real test order →
   confirm it appears in Supabase's Table Editor.
4. On a real phone, check: Quick View swipe gesture, Back to Top button,
   and the checkout modal's delivery-area dropdown.
5. Scroll to Testimonials → submit a test review → confirm you see the
   "thanks, pending review" message (not an error).
6. Visit `/admin/login` → sign in with the admin account from Manual 01 →
   confirm your test review shows up in the pending queue → Approve it →
   hard-refresh the homepage → confirm it now appears in the testimonials
   marquee.
7. While logged out, visit `/admin/reviews` directly → confirm it
   redirects you to `/admin/login` rather than showing anything.

## 5. Every future deploy after this one

Vercel auto-deploys on every push to `main` (or your chosen production
branch) — there's no manual "deploy" step for routine updates. Preview
deployments are automatically created for every pull request/branch, which
is worth using once more than one person is editing this codebase (full
workflow for that is Manual 03, Phase 5).

## Rollback

Vercel keeps every previous deployment. If a deploy breaks something:
Project → Deployments → find the last good one → **⋯ → Promote to
Production**. This is instant — no rebuild needed.
