-- ============================================================
-- KIEMO MENS WEAR — Phase 2 migration: customers view
--
-- A VIEW rather than a table, deliberately — customer info already lives
-- on every order (Phase 1's orders table), so a separate customers table
-- would just be a second copy that can drift out of sync. Aggregating on
-- read avoids that entirely, at negligible cost for this order volume.
--
-- security_invoker = true is the important bit: without it, a view runs
-- with the PRIVILEGES OF ITS OWNER (effectively bypassing the orders
-- table's RLS for anyone who queries this view). With it, the view
-- enforces RLS as the querying user — meaning this view is exactly as
-- locked-down as orders is (i.e. completely, until Phase 4 grants admins
-- read access to orders).
-- ============================================================

create or replace view public.customers
with (security_invoker = true) as
select
  phone,
  max(full_name) as full_name,
  count(*) as order_count,
  sum(subtotal) as total_spent,
  min(created_at) as first_order_at,
  max(created_at) as last_order_at
from public.orders
group by phone;

comment on view public.customers is
  'Derived from orders, not a separate table. See migration file header for why.';
