begin;
-- Keep the receipt-aware implementation private; expose a verified-only entry.
alter function public.place_preorder(uuid,jsonb,bigint,jsonb) set schema private;
revoke all on function private.place_preorder(uuid,jsonb,bigint,jsonb) from public,anon,authenticated;
create function public.place_preorder(p_key uuid,p_items jsonb,p_total bigint,p_receipt jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false)
 or not exists(select 1 from auth.users u join public.registrations r on r.user_id=u.id
   where u.id=auth.uid() and u.email_confirmed_at is not null
   and lower(trim(u.email))=lower(trim(r.personal_email)) and r.status in ('pending','approved'))
 then raise exception 'Verify your personal registration email before ordering'; end if;
 return private.place_preorder(p_key,p_items,p_total,p_receipt);
end $$;
revoke all on function public.place_preorder(uuid,jsonb,bigint,jsonb) from public,anon;
grant execute on function public.place_preorder(uuid,jsonb,bigint,jsonb) to authenticated;

-- Prefer the account's own registration and refuse ambiguous email matches.
create or replace function public.link_registration_to_verified_email() returns boolean
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); mail text; anon_uid uuid; rid uuid; matches integer;
begin
 if uid is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Verify your personal email first'; end if;
 select lower(trim(email)) into mail from auth.users where id=uid and email_confirmed_at is not null;
 if mail is null then raise exception 'Verify your personal email first'; end if;
 perform pg_advisory_xact_lock(hashtextextended(mail,0));
 if exists(select 1 from public.registrations where user_id=uid and lower(trim(personal_email))=mail and status in ('pending','approved')) then return true; end if;
 select count(*) into matches from public.registrations where lower(trim(personal_email))=mail and status in ('pending','approved');
 if matches=0 then raise exception 'No active registration was found for this email address'; end if;
 if matches>1 then raise exception 'Multiple registrations use this email. Contact the Catalyst team to link the correct registration'; end if;
 select id,user_id into rid,anon_uid from public.registrations where lower(trim(personal_email))=mail and status in ('pending','approved') for update;
 if not exists(select 1 from auth.users where id=anon_uid and is_anonymous) then raise exception 'This registration is already linked to another account'; end if;
 if exists(select 1 from public.registrations where user_id=uid and id<>rid) then raise exception 'This account already has a different registration'; end if;
 update public.registrations set user_id=uid where id=rid;
 return true;
end $$;

create table public.order_emails (
 order_id uuid not null references public.orders(id),
 kind text not null check(kind in ('received','confirmed')),
 recipient text not null, full_name text not null, reference text not null,
 total_minor bigint not null, items jsonb not null, pickup_location text not null,
 status text not null default 'pending' check(status in ('pending','sending','sent','failed','uncertain','skipped')),
 attempts integer not null default 0, claim_token uuid,
 created_at timestamptz not null default now(), attempted_at timestamptz, sent_at timestamptz, message_id text,
 primary key(order_id,kind)
);
alter table public.order_emails enable row level security;
revoke all on public.order_emails from anon,authenticated;
grant select on public.order_emails to authenticated;
create policy order_emails_read on public.order_emails for select to authenticated using(private.can_view_admin());
create function private.queue_order_email() returns trigger
language plpgsql security definer set search_path='' as $$
declare oid uuid; email_kind text;
begin
 if tg_table_name='order_receipts' then oid:=new.order_id;email_kind:='received';
 else
  if new.payment_status<>'paid' or old.payment_status='paid' then return new; end if;
  oid:=new.id;email_kind:='confirmed';
  -- Never send an outdated awaiting-verification notice after approval.
  update public.order_emails set status='skipped' where order_id=oid and kind='received' and status in ('pending','failed');
 end if;
 insert into public.order_emails(order_id,kind,recipient,full_name,reference,total_minor,items,pickup_location)
 select o.id,email_kind,r.personal_email,r.full_name,o.reference,o.total_minor,
  (select coalesce(jsonb_agg(jsonb_build_object('name',i.product_name,'variant',i.variant_label,'size',i.size,'quantity',i.quantity,'unit_price_minor',i.unit_price_minor) order by i.sku),'[]'::jsonb) from public.order_items i where i.order_id=o.id),o.pickup_location
 from public.orders o join public.registrations r on r.id=o.registration_id where o.id=oid
 on conflict(order_id,kind) do nothing;
 return new;
end $$;
revoke all on function private.queue_order_email() from public,anon,authenticated;
create trigger order_received_email after insert on public.order_receipts for each row execute function private.queue_order_email();
create trigger order_confirmed_email after update of payment_status on public.orders for each row execute function private.queue_order_email();
create function public.claim_order_email(p_id uuid,p_kind text) returns setof public.order_emails
language plpgsql security definer set search_path='' as $$ begin
 perform 1 from public.orders where id=p_id and status<>'cancelled' and ((p_kind='received' and payment_status='unpaid') or (p_kind='confirmed' and payment_status='paid')) for update;
 if not found then return; end if;
 return query update public.order_emails set status='sending',claim_token=gen_random_uuid(),attempts=attempts+1,attempted_at=now()
 where order_id=p_id and kind=p_kind and status in ('pending','failed') returning *;
end $$;
create function public.finish_order_email(p_id uuid,p_kind text,p_token uuid,p_status text,p_message_id text default null) returns boolean
language plpgsql security definer set search_path='' as $$ declare changed integer;begin
 if p_status is null or p_status not in ('sent','failed','uncertain') then raise exception 'Invalid email result'; end if;
 update public.order_emails set status=p_status,sent_at=case when p_status='sent' then now() end,message_id=p_message_id
 where order_id=p_id and kind=p_kind and claim_token=p_token and status='sending';
 get diagnostics changed=row_count;return changed=1;
end $$;
revoke all on function public.claim_order_email(uuid,text),public.finish_order_email(uuid,text,uuid,text,text) from public,anon,authenticated;
grant execute on function public.claim_order_email(uuid,text),public.finish_order_email(uuid,text,uuid,text,text) to service_role;
commit;
notify pgrst,'reload schema';
