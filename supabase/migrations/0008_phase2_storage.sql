-- ============================================================
-- KIEMO MENS WEAR — Phase 2 migration: storage bucket (Part 7)
--
-- Nothing in the app uses this yet — all 87 products still point at
-- Cloudinary URLs, unchanged, per "do not alter actual product photos."
-- This bucket exists so Phase 4's admin dashboard (uploading NEW product
-- photos when adding NEW products) has somewhere to write to on day one,
-- instead of that being a Phase 4 infrastructure task too.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images" on storage.objects
  for select
  using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images" on storage.objects
  for insert
  with check (bucket_id = 'product-images' and public.is_admin(auth.uid()));

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images" on storage.objects
  for update
  using (bucket_id = 'product-images' and public.is_admin(auth.uid()));

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images" on storage.objects
  for delete
  using (bucket_id = 'product-images' and public.is_admin(auth.uid()));
