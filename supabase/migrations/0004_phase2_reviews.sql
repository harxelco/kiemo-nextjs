-- ============================================================
-- KIEMO MENS WEAR — Phase 2 migration: reviews (Part 4)
--
-- Implements the exact flow from the brief:
--   Website -> Supabase -> Admin Dashboard -> Approve/Reject -> Publish
--
-- The RLS policies below ARE that flow, enforced at the database level
-- rather than just in application code:
--   - Anyone can INSERT a review, but only ever as status='pending' — the
--     WITH CHECK clause makes it impossible for a client to submit a
--     review that's already 'approved', however the request is crafted.
--   - Anyone can SELECT reviews, but only ones already 'approved' —
--     pending/rejected reviews are invisible to the public, full stop.
--   - Only admins (via is_admin(), from migration 0002) can see pending/
--     rejected reviews or change a review's status.
-- ============================================================

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rating smallint not null check (rating between 1 and 5),
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

create index if not exists reviews_status_idx on public.reviews (status);
create index if not exists reviews_created_at_idx on public.reviews (created_at desc);

alter table public.reviews enable row level security;

drop policy if exists "Public can submit reviews" on public.reviews;
create policy "Public can submit reviews" on public.reviews
  for insert
  with check (status = 'pending');

drop policy if exists "Public can read approved reviews" on public.reviews;
create policy "Public can read approved reviews" on public.reviews
  for select
  using (status = 'approved');

drop policy if exists "Admins can read all reviews" on public.reviews;
create policy "Admins can read all reviews" on public.reviews
  for select
  using (public.is_admin(auth.uid()));

drop policy if exists "Admins can moderate reviews" on public.reviews;
create policy "Admins can moderate reviews" on public.reviews
  for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

comment on table public.reviews is
  'Part 4 review pipeline. status default is pending and enforced by RLS WITH CHECK — a client cannot submit a pre-approved review no matter what it sends.';
