begin;
-- Safe upgrade for projects that already ran setup.sql; no existing records are removed.
alter table public.shop_settings add column bank_name text not null default '',
 add column account_name text not null default '', add column account_number text not null default '',
 add column bank_branch text not null default '';
create function public.admin_bank_details(p_bank text,p_name text,p_number text,p_branch text) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not private.has_role(array['admin']) then raise exception 'Not authorized'; end if;
 if length(trim(coalesce(p_bank,'')))=0 or length(trim(coalesce(p_name,'')))=0 or length(trim(coalesce(p_number,'')))=0
 or greatest(length(p_bank),length(p_name),length(p_number),length(p_branch))>200 then raise exception 'Enter valid bank and account details'; end if;
 update public.shop_settings set bank_name=trim(p_bank),account_name=trim(p_name),account_number=trim(p_number),bank_branch=trim(coalesce(p_branch,'')),updated_at=now() where id=true;
 insert into public.audit_events(actor_user_id,entity_type,entity_id,action) values(auth.uid(),'shop','00000000-0000-0000-0000-000000000000','bank_details_updated');
end $$;
create table public.order_receipts (
 id uuid primary key default gen_random_uuid(), order_id uuid not null unique references public.orders(id),
 transfer_reference text not null, storage_key text not null unique, original_name text not null, mime_type text not null,
 size_bytes integer not null check(size_bytes between 1 and 5242880),
 status text not null default 'pending' check(status in ('pending','verified','rejected')),
 review_note text, reviewed_by uuid references auth.users(id), reviewed_at timestamptz,
 created_at timestamptz not null default now()
);
alter table public.order_receipts enable row level security;
revoke all on public.order_receipts from anon,authenticated;
grant select on public.order_receipts to authenticated;
create policy order_receipts_read on public.order_receipts for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('payment-receipts','payment-receipts',false,5242880,array['application/pdf','image/jpeg','image/png','image/webp']);
create policy receipt_upload on storage.objects for insert to authenticated with check(bucket_id='payment-receipts' and (storage.foldername(name))[1]=auth.uid()::text and exists(select 1 from public.registrations where user_id=auth.uid() and status in ('pending','approved')));
create policy receipt_read on storage.objects for select to authenticated using(bucket_id='payment-receipts' and ((storage.foldername(name))[1]=auth.uid()::text or (private.has_role(array['admin']) and exists(select 1 from public.order_receipts where storage_key=name))));
create function public.place_preorder(p_key uuid,p_items jsonb,p_total bigint,p_receipt jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); result jsonb; obj storage.objects; existing record;
begin
 if uid is null then raise exception 'Verify your registration email first'; end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 select o.id,o.reference into existing from public.orders o join public.registrations r on r.id=o.registration_id where o.submission_key=p_key and r.user_id=uid;
 if found then return jsonb_build_object('id',existing.id,'reference',existing.reference); end if;
 if not exists(select 1 from public.shop_settings where id=true and length(trim(bank_name))>0 and length(trim(account_name))>0 and length(trim(account_number))>0) then raise exception 'Bank transfer details are not configured yet. Please check back later.'; end if;
 select * into obj from storage.objects where bucket_id='payment-receipts' and name=p_receipt->>'storage_key' and split_part(name,'/',1)=uid::text;
 if not found or (obj.metadata->>'size')::bigint not between 1 and 5242880 or obj.metadata->>'mimetype' not in ('application/pdf','image/jpeg','image/png','image/webp') then raise exception 'Upload a PDF or image receipt up to 5 MB'; end if;
 if length(trim(coalesce(p_receipt->>'original_name','')))=0 then raise exception 'Receipt filename required'; end if;
 result:=public.place_order(p_key,p_items,p_total);
 insert into public.order_receipts(order_id,transfer_reference,storage_key,original_name,mime_type,size_bytes) values((result->>'id')::uuid,'CAT7-PAY-'||upper(p_key::text),obj.name,left(p_receipt->>'original_name',255),obj.metadata->>'mimetype',(obj.metadata->>'size')::integer);
 return result;
end $$;
-- The authenticated browser must submit through the receipt-aware transaction.
revoke execute on function public.place_order(uuid,jsonb,bigint) from authenticated;
create function public.admin_review_receipt(p_id uuid,p_accept boolean,p_note text default null) returns void
language plpgsql security definer set search_path='' as $$
declare o public.orders; receipt public.order_receipts;
begin
 if not private.has_role(array['admin']) then raise exception 'Not authorized'; end if;
 if p_accept is null then raise exception 'Choose a review result'; end if;
 select * into o from public.orders where id=p_id for update;
 if not found or o.status='cancelled' then raise exception 'Order unavailable'; end if;
 select * into receipt from public.order_receipts where order_id=p_id for update;
 if not found then raise exception 'Receipt not found'; end if;
 if receipt.status='verified' and p_accept then return; end if;
 if o.payment_status='paid' then raise exception 'Payment already verified'; end if;
 if p_accept then perform public.admin_verify_payment(p_id,'bank_transfer',receipt.transfer_reference);
 elsif length(trim(coalesce(p_note,'')))=0 then raise exception 'Provide a reason for rejection'; end if;
 update public.order_receipts set status=case when p_accept then 'verified' else 'rejected' end,review_note=left(p_note,1000),reviewed_by=auth.uid(),reviewed_at=now() where order_id=p_id;
 insert into public.audit_events(actor_user_id,entity_type,entity_id,action) values(auth.uid(),'order',p_id,case when p_accept then 'receipt_verified' else 'receipt_rejected' end);
end $$;
create or replace function public.submit_registration(p_key uuid,p_answers jsonb,p_file jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); rid uuid; ref text; k text; email text;
begin
  if uid is null then raise exception 'Please verify your email first'; end if;
  -- Accept the redesigned form's clean labels and legacy starred values.
  p_answers:=jsonb_set(p_answers,'{allergy}',to_jsonb(case when p_answers->>'allergy' in ('Yes','Yes*') then 'Yes*' else p_answers->>'allergy' end));
  p_answers:=jsonb_set(p_answers,'{safety}',to_jsonb(case when p_answers->>'safety' in ('Yes','Yes*') then 'Yes*' else p_answers->>'safety' end));
  if p_answers->>'faculty'='Other' then p_answers:=jsonb_set(p_answers,'{faculty}','"Other*"'); end if;
  if p_answers->>'circle'='Other relevant function' then p_answers:=jsonb_set(p_answers,'{circle}','"Other relevant function*"'); end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  select id,reference into rid,ref from public.registrations where user_id=uid;
  if found then return jsonb_build_object('id',rid,'reference',ref); end if;
  if jsonb_typeof(p_answers) is distinct from 'object' or jsonb_typeof(p_file) is distinct from 'object' then raise exception 'Invalid submission'; end if;
  foreach k in array array['name','gender','nic','aiesecEmail','email','phone','year','sem','faculty','path','rank','circle','type','seek','drive','diet','allergy','safety','ecName','ecPhone'] loop
    if length(trim(coalesce(p_answers->>k,'')))=0 or length(p_answers->>k)>4000 then raise exception 'Missing or invalid field: %',k; end if;
  end loop;
  foreach k in array array['faculty','circle','allergy','safety'] loop
    if right(p_answers->>k,1)='*' and length(trim(coalesce(p_answers->>(k||'-sp'),'')))=0 then raise exception 'Specify details for %',k; end if;
  end loop;
  if octet_length(p_answers::text)>50000 then raise exception 'Submission too large'; end if;
  if upper(regexp_replace(p_answers->>'nic','\s','','g')) !~ '^(\d{9}[VX]|\d{12})$'
    or regexp_replace(p_answers->>'phone','[\s-]','','g') !~ '^\+?\d{9,13}$'
    or regexp_replace(p_answers->>'ecPhone','[\s-]','','g') !~ '^\+?\d{9,13}$'
    or (p_answers->>'email') !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$'
    or (p_answers->>'aiesecEmail') !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' then raise exception 'Invalid identity or contact details'; end if;
  select lower(u.email) into email from auth.users u where u.id=uid and u.email_confirmed_at is not null;
  if email is null or email not in (lower(trim(p_answers->>'email')),lower(trim(p_answers->>'aiesecEmail'))) then raise exception 'Sign in with one of your registration email addresses'; end if;
  if not exists(select 1 from storage.objects o where o.bucket_id='delegate-cvs' and o.name=p_file->>'storage_key'
    and split_part(o.name,'/',1)=uid::text
    and (o.metadata->>'size')::bigint between 1 and 5242880
    and o.metadata->>'mimetype' in ('application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document')) then raise exception 'Upload a valid CV first'; end if;
  insert into public.registrations(user_id,submission_key,full_name,gender,nic,aiesec_email,personal_email,phone,
    university,university_other,study_year,semester,faculty,faculty_other,programme,rank,function,function_other,warrior_persona,aspiration,motivation,final_note)
  values(uid,p_key,trim(p_answers->>'name'),p_answers->>'gender',upper(regexp_replace(p_answers->>'nic','\s','','g')),
    lower(trim(p_answers->>'aiesecEmail')),lower(trim(p_answers->>'email')),regexp_replace(p_answers->>'phone','[\s-]','','g'),
    'SLIIT',null,p_answers->>'year',p_answers->>'sem',p_answers->>'faculty',p_answers->>'faculty-sp',
    p_answers->>'path',p_answers->>'rank',p_answers->>'circle',p_answers->>'circle-sp',p_answers->>'type',p_answers->>'seek',p_answers->>'drive',p_answers->>'note')
  returning id,reference into rid,ref;
  insert into public.registration_wellbeing values(rid,p_answers->>'diet',p_answers->>'allergy'='Yes*',p_answers->>'allergy-sp',
    p_answers->>'safety'='Yes*',p_answers->>'safety-sp',p_answers->>'ecName',regexp_replace(p_answers->>'ecPhone','[\s-]','','g'));
  insert into public.registration_files(registration_id,storage_key,original_name,mime_type,size_bytes)
  select rid,o.name,left(p_file->>'original_name',255),o.metadata->>'mimetype',(o.metadata->>'size')::integer
  from storage.objects o where o.bucket_id='delegate-cvs' and o.name=p_file->>'storage_key';
  insert into public.audit_events(actor_user_id,entity_type,entity_id,action) values(uid,'registration',rid,'submitted');
  return jsonb_build_object('id',rid,'reference',ref);
end $$;


create or replace function public.admin_summary() returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if not private.has_role(array['admin']) then raise exception 'Not authorized'; end if;
 return jsonb_build_object('schema_version',5,'registrations',(select count(*) from public.registrations),
 'checked_in',(select count(*) from public.registrations where checked_in_at is not null),
 'orders',(select count(*) from public.orders),'collected',(select count(*) from public.orders where status='collected'),
 'paid_minor',(select coalesce(sum(amount_minor),0) from public.payments),
 'pending_registrations',(select count(*) from public.registrations where status='pending'),
 'awaiting_collection',(select count(*) from public.orders where status in ('reserved','ready_for_pickup')),
 'registrations_by_status',(select coalesce(jsonb_object_agg(status,n),'{}'::jsonb) from (select status,count(*) n from public.registrations group by status) counts));
end $$;
revoke all on function public.admin_bank_details(text,text,text,text),public.place_preorder(uuid,jsonb,bigint,jsonb),public.admin_review_receipt(uuid,boolean,text) from public,anon,authenticated;
grant execute on function public.admin_bank_details(text,text,text,text),public.place_preorder(uuid,jsonb,bigint,jsonb),public.admin_review_receipt(uuid,boolean,text) to authenticated;
commit;
