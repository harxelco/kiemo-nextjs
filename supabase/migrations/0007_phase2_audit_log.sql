-- ============================================================
-- KIEMO MENS WEAR — Phase 2 migration: audit log (Part 7)
--
-- A generic, reusable trigger — log_audit() doesn't know or care which
-- table called it (TG_TABLE_NAME/TG_OP handle that), so wiring up a new
-- table later (e.g. Phase 4 attaching it to admin_roles changes too) is
-- one `create trigger` line, not a new function.
--
-- Records both old and new row state as jsonb, so "what did this review
-- look like before someone rejected it" is answerable later.
-- ============================================================

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  table_name text not null,
  record_id text not null,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  changed_by uuid references auth.users(id),
  changed_at timestamptz not null default now(),
  old_data jsonb,
  new_data jsonb
);

create index if not exists audit_log_table_record_idx on public.audit_log (table_name, record_id);
create index if not exists audit_log_changed_at_idx on public.audit_log (changed_at desc);

alter table public.audit_log enable row level security;

drop policy if exists "Admins can read audit log" on public.audit_log;
create policy "Admins can read audit log" on public.audit_log
  for select
  using (public.is_admin(auth.uid()));
-- No insert/update/delete policy for anyone — rows only ever come from
-- the trigger function below, which runs as security definer.

create or replace function public.log_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_log (table_name, record_id, action, changed_by, old_data, new_data)
  values (
    TG_TABLE_NAME,
    coalesce((NEW).id::text, (OLD).id::text),
    TG_OP,
    auth.uid(),
    case when TG_OP != 'INSERT' then to_jsonb(OLD) else null end,
    case when TG_OP != 'DELETE' then to_jsonb(NEW) else null end
  );
  return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists reviews_audit on public.reviews;
create trigger reviews_audit
  after update or delete on public.reviews
  for each row execute function public.log_audit();

drop trigger if exists products_audit on public.products;
create trigger products_audit
  after insert or update or delete on public.products
  for each row execute function public.log_audit();

comment on table public.audit_log is
  'Populated only by the log_audit() trigger — see migration file for which tables are currently wired up.';
