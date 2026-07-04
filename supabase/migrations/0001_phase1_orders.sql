-- ============================================================
-- KIEMO MENS WEAR — Phase 1 migration: orders table only
--
-- This is intentionally minimal. The full schema (products, sizes,
-- colors, stock, reviews, customers, admin roles, indexes tuned for
-- the dashboard) is covered end-to-end in Manual 01 (Phase 2). This
-- migration exists so the Part 3 checkout flow has somewhere to write
-- to as soon as you create your Supabase project — nothing more.
--
-- Run this in: Supabase Dashboard → SQL Editor → New query → paste → Run.
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_ref text not null unique,
  created_at timestamptz not null default now(),
  full_name text not null,
  phone text not null,
  pickup_method text not null check (pickup_method in ('pickup', 'delivery')),
  delivery_area text,
  items jsonb not null,
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  status text not null default 'new'
    check (status in ('new', 'confirmed', 'fulfilled', 'cancelled'))
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

-- Row Level Security: enabled with NO policies for anon/authenticated.
-- The checkout API route (app/api/orders/route.ts) writes using the
-- service_role key, which bypasses RLS entirely — so no INSERT policy
-- for the public is needed, and none is granted. This means the orders
-- table is completely inaccessible from the browser, by design, until
-- Manual 01 adds authenticated admin-read policies for the dashboard.
alter table public.orders enable row level security;

comment on table public.orders is
  'Phase 1 checkout orders. See Manual 01 for the full Phase 2 schema (products, reviews, customers, admin roles).';
