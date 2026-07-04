-- ============================================================
-- KIEMO MENS WEAR — Phase 2 migration: orders admin-read policy
--
-- Phase 1's orders table shipped with zero policies at all (the checkout
-- API route writes via the service role key, which bypasses RLS, so no
-- policy was needed yet). Now that admin_roles + is_admin() exist, add a
-- read policy so an authenticated admin can actually see order history —
-- this is also what the customers view (previous migration) depends on to
-- return real rows instead of nothing.
--
-- Still no public/anon read or write access to orders at all — customer
-- order data stays server-only + admin-only.
-- ============================================================

drop policy if exists "Admins can read orders" on public.orders;
create policy "Admins can read orders" on public.orders
  for select
  using (public.is_admin(auth.uid()));

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders" on public.orders
  for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
