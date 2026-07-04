-- ============================================================
-- KIEMO MENS WEAR — Phase 3 migration: orders.payment_method
--
-- Adds a payment_method column so every order records how the
-- customer chose to pay/confirm: 'mpesa' (STK push, Daraja — wired
-- next) or 'whatsapp' (order saved, then customer redirected to
-- WhatsApp to confirm availability with the shop directly).
--
-- Safe to run on a table that already has rows: defaults existing
-- rows to 'whatsapp' since every order taken before this migration
-- was placed before M-Pesa existed at all (i.e. was effectively a
-- WhatsApp-style manual-confirmation order).
--
-- Run this in: Supabase Dashboard → SQL Editor → New query → paste → Run.
-- ============================================================

alter table public.orders
  add column if not exists payment_method text
    not null default 'whatsapp'
    check (payment_method in ('mpesa', 'whatsapp'));

comment on column public.orders.payment_method is
  'How the customer chose to pay/confirm: mpesa (STK push) or whatsapp (manual confirmation via WhatsApp).';
