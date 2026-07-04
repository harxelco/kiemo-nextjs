-- ============================================================
-- KIEMO MENS WEAR — Phase 2 migration: admin roles
--
-- Creates the admin-role table and a security-definer helper function
-- that every later RLS policy in this phase uses to check "is the
-- current user an admin". This has to exist before reviews.sql,
-- audit_log.sql etc., since their policies call public.is_admin(uid).
--
-- IMPORTANT — this table has NO public policies at all, by design.
-- There is deliberately no self-service "become an admin" flow. To make
-- your own account an admin after this migration runs:
--
--   1. Supabase Dashboard → Authentication → Users → create a user
--      with your email (or use "Invite").
--   2. SQL Editor → run:
--        insert into public.admin_roles (user_id, role)
--        values ('<paste the user's UUID from step 1>', 'admin');
--
-- Phase 4's admin dashboard Settings section is where this becomes a UI
-- instead of a manual SQL step.
-- ============================================================

create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);

alter table public.admin_roles enable row level security;
-- No insert/select/update/delete policies for anon or authenticated —
-- this table is managed via the SQL Editor (service role) only, until
-- Phase 4 adds an admin-only Settings UI for it.

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_roles where user_id = uid
  );
$$;

comment on function public.is_admin is
  'security definer so RLS policies on other tables can check admin status without needing their own read access to admin_roles (which has no public policies).';
