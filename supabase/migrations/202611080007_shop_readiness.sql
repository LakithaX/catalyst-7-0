begin;
-- Keep the shop hidden until the administrator enters approved payment instructions.
-- Preserve existing accounts, orders and payment records.
update public.shop_settings set coming_soon=true,updated_at=now()
where length(trim(bank_name))=0 or length(trim(account_name))=0 or length(trim(account_number))=0;
create or replace function public.admin_shop_settings(p_coming_soon boolean) returns void
language plpgsql security definer set search_path='' as $$
declare settings public.shop_settings;
begin
 if not private.has_role(array['admin']) then raise exception 'Not authorized'; end if;
 if p_coming_soon is null then raise exception 'Choose a shop status'; end if;
 select * into settings from public.shop_settings where id=true for update;
 if not p_coming_soon and (length(trim(settings.bank_name))=0 or length(trim(settings.account_name))=0 or length(trim(settings.account_number))=0) then raise exception 'Add the bank name, account holder and account number before opening the shop'; end if;
 update public.shop_settings set coming_soon=p_coming_soon,updated_at=now() where id=true;
 insert into public.audit_events(actor_user_id,entity_type,entity_id,action) values(auth.uid(),'shop','00000000-0000-0000-0000-000000000000',case when p_coming_soon then 'paused' else 'opened' end);
end $$;
-- Disable the unpaid-only route if migration 006 was applied.
do $$ begin
 if to_regprocedure('public.submit_preorder(uuid,jsonb,bigint)') is not null then
  execute 'revoke execute on function public.submit_preorder(uuid,jsonb,bigint) from public,anon,authenticated';
 end if;
end $$;
create or replace function public.admin_summary() returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if not private.has_role(array['admin']) then raise exception 'Not authorized'; end if;
 return jsonb_build_object('schema_version',7,'registrations',(select count(*) from public.registrations),
 'checked_in',(select count(*) from public.registrations where checked_in_at is not null),
 'orders',(select count(*) from public.orders),'collected',(select count(*) from public.orders where status='collected'),
 'paid_minor',(select coalesce(sum(amount_minor),0) from public.payments),
 'pending_registrations',(select count(*) from public.registrations where status='pending'),
 'awaiting_collection',(select count(*) from public.orders where status in ('reserved','ready_for_pickup')),
 'registrations_by_status',(select coalesce(jsonb_object_agg(status,n),'{}'::jsonb) from (select status,count(*) n from public.registrations group by status) counts));
end $$;
commit;
