# Supabase Setup — Phase 1 (minimal)

This is **not** the full Supabase manual (that's Manual 01, Phase 2 — full
schema, RLS policies for every table, indexes, storage, backups, audit
logging). This is the minimum needed so the checkout flow built in Phase 1
actually saves orders somewhere.

## 1. Create the project

1. Go to [supabase.com](https://supabase.com) → New Project.
2. Pick a region close to Kenya — **eu-west-1 (Ireland)** or **eu-west-2
   (London)** if offered, otherwise the closest EU region has better
   latency to Nairobi than US regions.
3. Save the generated database password somewhere safe (a password manager,
   not a chat log) — you won't need it directly for this phase, but you
   will for Phase 2.

## 2. Run the Phase 1 migration

1. In the Supabase dashboard: **SQL Editor → New query**.
2. Paste the entire contents of
   [`supabase/migrations/0001_phase1_orders.sql`](../supabase/migrations/0001_phase1_orders.sql)
   and click **Run**.
3. Confirm it worked: **Table Editor** should now show an `orders` table
   with columns `id, order_ref, created_at, full_name, phone,
   pickup_method, delivery_area, items, subtotal, status`.

## 3. Get your API keys

**Project Settings → API**:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** (click "Reveal") → `SUPABASE_SERVICE_ROLE_KEY`

## 4. Set environment variables

**Local dev** — create `.env.local` in the project root (never commit this
file — it's already in `.gitignore`):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Vercel** — Project → Settings → Environment Variables → add the same
three, for both **Production** and **Preview** environments. Redeploy after
adding them (env var changes don't apply to already-running deployments).

## 5. Verify it's working

1. `npm run dev` (or check your Vercel deployment).
2. Visit `/api/health` — you should see `"supabaseConfigured": true`. If
   it says `false`, double-check the three env vars are actually set and
   you redeployed/restarted after adding them.
3. Add a product to cart → Checkout → fill the form → Place Order.
4. In Supabase **Table Editor → orders**, you should see the new row.

## Why the service role key and not the anon key

The checkout API route (`app/api/orders/route.ts`) uses the **service
role** key, which bypasses Row Level Security entirely, and does so only
from server-side code that never ships to the browser. This deliberately
avoids needing an "allow anonymous inserts" RLS policy on `orders` — which
would mean anyone with your anon key (which is, by design, public — it
ships in every page load) could write arbitrary rows directly to your
database, bypassing all the validation in the API route. Keeping `orders`
with **zero** public policies and writing through a server route you
control is the safer default, and it's what the migration SQL sets up.

## What's NOT covered here

- Reading orders back out (for a future dashboard) — Phase 2/4.
- The `products`, `reviews`, `customers` tables — Phase 2 (Manual 01).
- Auth / admin roles — Phase 2/4.
- Backups, audit logging, storage buckets — Manual 01.
