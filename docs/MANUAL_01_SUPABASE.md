# Manual 01 — Supabase (Phase 2)

Full reference for the schema, security model, and operational practices
introduced in Phase 2. If you only need to get checkout working, you
wanted `docs/SUPABASE_PHASE1_SETUP.md` instead — this manual assumes
that's already done and builds on top of it.

## 1. Running the Phase 2 migrations

Seven files, in order, each idempotent (safe to re-run):

| # | File | What it does |
|---|---|---|
| 1 | `0002_phase2_admin_roles.sql` | `admin_roles` table + `is_admin()` helper function |
| 2 | `0003_phase2_products.sql` | `products` table, indexes, seeds all 87 products |
| 3 | `0004_phase2_reviews.sql` | `reviews` table + the full Part 4 RLS pipeline |
| 4 | `0005_phase2_customers_view.sql` | `customers` view (derived from `orders`) |
| 5 | `0006_phase2_orders_admin_policy.sql` | Lets admins read/update `orders` |
| 6 | `0007_phase2_audit_log.sql` | `audit_log` table + trigger on `products`/`reviews` |
| 7 | `0008_phase2_storage.sql` | `product-images` storage bucket + policies |

Run each in the Supabase SQL Editor, in this numeric order — several
depend on objects created by an earlier file (`is_admin()` in particular
is used by four of the later ones).

## 2. Schema overview

```
auth.users (Supabase-managed)
  └─ admin_roles (user_id → role)
       used by is_admin(uid) — every other table's admin policies call this

products                    reviews                      orders (Phase 1)
  id (pk, matches            id (pk, uuid)                 id (pk, uuid)
  legacy product ids)         name, rating, message         full_name, phone
  sku, slug, name             status: pending|              pickup_method,
  category, subcategory        approved|rejected             delivery_area
  price, old_price            created_at,                   items (jsonb)
  is_new, is_offer,            reviewed_at, reviewed_by      subtotal, status
  featured, stock
  sizes[], colors[],                                       customers (VIEW)
  unavailable[]                                              — aggregates
  img, images[]                                              orders by phone
  description

audit_log
  table_name, record_id, action, changed_by, changed_at, old_data, new_data
  — populated automatically by a trigger on products + reviews
```

## 3. The RLS strategy, and why it's split two ways

Two different patterns are used deliberately, for two different kinds of
writes:

**Service-role bypass** (orders, Phase 1) — the API route uses the
service role key and RLS is irrelevant to it; the table has zero public
policies. Right for writes where *all* validation should live in
application code you control (rate limiting, phone regex, Nairobi-area
allowlist), because none of that logic can be expressed as a simple SQL
`CHECK`.

**RLS-enforced anon writes** (reviews) — the API route uses the plain anon
key, and the database's own policy (`WITH CHECK (status = 'pending')`) is
what actually stops a submitted review from arriving pre-approved. Right
here because the one thing that *matters* for security (never insert as
anything but pending) is simple enough to be a one-line SQL constraint —
enforcing it at the database layer means it holds even if a future code
change introduces a bug in the route handler.

Everything admin-only (`products` writes, `reviews` moderation, `orders`
reads) goes through `is_admin(auth.uid())`, checked against `admin_roles`.
There is no "authenticated users are admins" shortcut anywhere — a
Supabase Auth account with no `admin_roles` row can log in but every
RLS-gated query returns zero rows.

## 4. Adding an admin

No self-service signup, by design:

```sql
-- 1. Create the user first: Dashboard -> Authentication -> Users -> Add User
-- 2. Then, in the SQL Editor:
insert into public.admin_roles (user_id, role)
values ('<user-uuid-from-step-1>', 'admin');
```

Phase 4 turns this into a Settings-page UI. Until then it's two manual
steps per admin — fine at the "founder + maybe one staff member" scale
this is currently built for.

## 5. Indexes

| Table | Index | Why |
|---|---|---|
| `products` | `category` | Shop grid category filter |
| `products` | `featured`, `is_new`, `is_offer` (partial, `WHERE = true`) | Homepage sections — partial indexes because most rows are `false`, so a full-column index would mostly be dead weight |
| `reviews` | `status` | Admin pending-queue query, public approved-only query |
| `reviews` | `created_at desc` | Both the above are sorted newest-first |
| `orders` | `created_at desc`, `status` | Already added in Phase 1 for the same reasons |
| `audit_log` | `(table_name, record_id)`, `changed_at desc` | "What happened to record X" and "what happened recently" are the two real queries against this table |

## 6. Storage

`product-images` bucket, public read, admin-only write (migration
0008). Nothing uses it yet — it exists so Phase 4's "add a new product"
flow has somewhere to upload to without that being new infrastructure at
that point. If you want to test it before Phase 4, the Supabase dashboard
lets you upload directly: Storage -> product-images -> Upload.

## 7. Backups

Supabase's own daily backups apply automatically once you're on a paid
plan (Pro tier and above) — nothing in this codebase needs to trigger or
manage that. On the free tier there are no automatic backups; if you're
still on it once real orders/reviews exist, either upgrade or set a
recurring reminder to export data manually (Table Editor -> any table ->
Export as CSV, or `pg_dump` via the connection string in Project Settings
-> Database).

## 8. Audit logging — what's covered and what isn't

The trigger (migration 0007) is attached to:
- `products`: every INSERT/UPDATE/DELETE (all writes are admin-only, so
  every write is worth recording)
- `reviews`: UPDATE/DELETE only (the initial public submission isn't an
  admin action — it's already timestamped via `created_at` — so it's not
  duplicated into the audit log)

Not yet covered: `orders` (no admin write path exists until Phase 4's
dashboard adds one — nothing to audit yet) and `admin_roles` itself
(worth adding once there's more than one admin and "who granted this
account access" becomes a real question — flagged for Phase 4).

Query pattern for "what happened to review X":

```sql
select * from audit_log
where table_name = 'reviews' and record_id = '<review-uuid>'
order by changed_at desc;
```

## 9. What's still NOT in Supabase

- Real M-Pesa transaction records (Phase 3 — Manual 02 will add a
  `payments` table alongside the Daraja webhook)
- Anything the admin dashboard needs beyond reviews moderation (Phase 4)
- Full-text search on products (not needed yet — the current catalog size
  and the storefront's client-side filter in `ShopSection.tsx` handle it
  fine; worth revisiting only if the catalog grows by an order of
  magnitude)
