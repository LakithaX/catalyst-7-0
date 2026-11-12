begin;
-- Preserve the existing administrator; viewers do not count toward the admin limit.
alter table public.admin_memberships drop constraint if exists admin_memberships_role_check;
alter table public.admin_memberships add constraint admin_memberships_role_check
  check (role in ('admin', 'viewer'));
drop index if exists public.one_active_catalyst_admin;
create unique index one_active_catalyst_admin on public.admin_memberships ((is_active))
  where is_active and role = 'admin';

-- Read access is deliberately separate from private.has_role(), which remains
-- admin-only for every existing mutation RPC, including legacy role checks.
create or replace function private.has_role(roles text[]) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.admin_memberships
    where user_id = auth.uid() and is_active and role = 'admin')
$$;
create or replace function private.can_view_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.admin_memberships
    where user_id = auth.uid() and is_active and role in ('admin', 'viewer'))
$$;
revoke all on function private.can_view_admin() from public, anon, authenticated;
grant execute on function private.can_view_admin() to authenticated;

drop policy if exists admin_panel_read on public.registrations;
create policy admin_panel_read on public.registrations for select to authenticated
  using (private.can_view_admin());
drop policy if exists admin_panel_read on public.registration_wellbeing;
create policy admin_panel_read on public.registration_wellbeing for select to authenticated
  using (private.can_view_admin());
drop policy if exists admin_panel_read on public.registration_files;
create policy admin_panel_read on public.registration_files for select to authenticated
  using (private.can_view_admin());
drop policy if exists admin_panel_read on public.products;
create policy admin_panel_read on public.products for select to authenticated
  using (private.can_view_admin());
drop policy if exists admin_panel_read on public.product_variants;
create policy admin_panel_read on public.product_variants for select to authenticated
  using (private.can_view_admin());
drop policy if exists admin_panel_read on public.orders;
create policy admin_panel_read on public.orders for select to authenticated
  using (private.can_view_admin());
drop policy if exists admin_panel_read on public.inventory_movements;
create policy admin_panel_read on public.inventory_movements for select to authenticated
  using (private.can_view_admin());
drop policy if exists admin_panel_read on public.audit_events;
create policy admin_panel_read on public.audit_events for select to authenticated
  using (private.can_view_admin());
drop policy if exists admin_panel_read on public.registration_sheet_sync;
create policy admin_panel_read on public.registration_sheet_sync for select to authenticated
  using (private.can_view_admin());

-- Existing order_items/payments/order_receipts policies inherit order visibility.
-- File access remains limited to the private files linked to known records.
drop policy if exists admin_panel_cv_read on storage.objects;
create policy admin_panel_cv_read on storage.objects for select to authenticated
  using (bucket_id = 'delegate-cvs' and private.can_view_admin()
    and exists(select 1 from public.registration_files f where f.storage_key = name));
drop policy if exists admin_panel_receipt_read on storage.objects;
create policy admin_panel_receipt_read on storage.objects for select to authenticated
  using (bucket_id = 'payment-receipts' and private.can_view_admin()
    and exists(select 1 from public.order_receipts r where r.storage_key = name));

create or replace function public.admin_summary() returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if not private.can_view_admin() then raise exception 'Not authorized'; end if;
 return jsonb_build_object('schema_version',7,'registrations',(select count(*) from public.registrations),
 'checked_in',(select count(*) from public.registrations where checked_in_at is not null),
 'orders',(select count(*) from public.orders),'collected',(select count(*) from public.orders where status='collected'),
 'paid_minor',(select coalesce(sum(amount_minor),0) from public.payments),
 'pending_registrations',(select count(*) from public.registrations where status='pending'),
 'awaiting_collection',(select count(*) from public.orders where status in ('reserved','ready_for_pickup')),
 'registrations_by_status',(select coalesce(jsonb_object_agg(status,n),'{}'::jsonb) from (select status,count(*) n from public.registrations group by status) counts));
end $$;

create or replace function public.admin_sheet_sync_status() returns jsonb
language plpgsql security definer set search_path='' as $$ begin
 if not private.can_view_admin() then raise exception 'Not authorized'; end if;
 return jsonb_build_object('total',(select count(*) from public.registration_sheet_sync),
 'pending',(select count(*) from public.registration_sheet_sync where version>synced_version and last_error is null),
 'failed',(select count(*) from public.registration_sheet_sync where version>synced_version and last_error is not null),
 'last_synced_at',(select max(last_synced_at) from public.registration_sheet_sync));
end $$;

commit;
notify pgrst, 'reload schema';
