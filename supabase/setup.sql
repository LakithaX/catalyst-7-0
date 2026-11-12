-- INITIAL INSTALL ONLY. Existing projects: apply only unapplied migrations.

begin;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.admin_memberships (
  user_id uuid primary key references auth.users(id),
  role text not null check (role in ('owner','registration_manager','merch_manager','viewer')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create function private.has_role(roles text[]) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_memberships where user_id = auth.uid() and is_active and role = any(roles))
$$;
revoke all on function private.has_role(text[]) from public, anon, authenticated;
grant execute on function private.has_role(text[]) to authenticated;

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id),
  reference text not null unique default ('CAT7-DEL-' || upper(replace(gen_random_uuid()::text,'-',''))),
  submission_key uuid not null unique,
  full_name text not null, gender text not null, nic text not null,
  aiesec_email text not null, personal_email text not null, phone text not null,
  university text not null, university_other text, study_year text not null, semester text not null,
  faculty text not null, faculty_other text, programme text not null, rank text not null,
  function text not null, function_other text, warrior_persona text not null,
  aspiration text not null, motivation text not null, final_note text,
  cv_partner_consent boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  checked_in_at timestamptz, checked_in_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.registration_wellbeing (
  registration_id uuid primary key references public.registrations(id) on delete cascade,
  food_preference text not null, has_allergies boolean not null, allergy_details text,
  has_safety_needs boolean not null, safety_details text,
  emergency_contact_name text not null, emergency_contact_phone text not null
);
create table public.registration_files (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null unique references public.registrations(id) on delete cascade,
  storage_key text not null unique, original_name text not null, mime_type text not null,
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 5242880),
  created_at timestamptz not null default now()
);
create table public.products (
  id text primary key, name text not null, variant_label text not null, category text not null,
  description text not null, image_url text not null, is_active boolean not null default true
);
create table public.product_variants (
  id uuid primary key default gen_random_uuid(), product_id text not null references public.products(id),
  sku text not null unique, size text not null default '', color text not null default '',
  price_minor integer not null check (price_minor >= 0), currency text not null default 'LKR' check (currency = 'LKR'),
  stock_on_hand integer not null default 0 check (stock_on_hand >= 0),
  stock_reserved integer not null default 0 check (stock_reserved >= 0 and stock_reserved <= stock_on_hand),
  unique (product_id,size,color)
);
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('CAT7-ORDER-' || upper(replace(gen_random_uuid()::text,'-',''))),
  submission_key uuid not null unique, registration_id uuid not null references public.registrations(id),
  status text not null default 'reserved' check (status in ('reserved','ready_for_pickup','collected','cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid')),
  currency text not null default 'LKR' check (currency = 'LKR'),
  total_minor bigint not null default 0 check (total_minor >= 0),
  pickup_location text not null default 'Catalyst merchandise desk', cancellation_reason text,
  collected_at timestamptz, collected_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.order_items (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id),
  product_variant_id uuid not null references public.product_variants(id),
  quantity integer not null check (quantity between 1 and 100),
  product_name text not null, variant_label text not null, size text not null, sku text not null,
  unit_price_minor integer not null check (unit_price_minor >= 0), unique(order_id,product_variant_id)
);
create table public.payments (
  id uuid primary key default gen_random_uuid(), order_id uuid not null unique references public.orders(id),
  amount_minor bigint not null check (amount_minor > 0), currency text not null default 'LKR' check (currency='LKR'),
  method text not null check (method in ('cash','bank_transfer')), external_reference text,
  verified_by uuid not null references auth.users(id), verified_at timestamptz not null default now()
);
create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(), product_variant_id uuid not null references public.product_variants(id),
  order_id uuid references public.orders(id), type text not null check(type in ('adjustment','reserve','release','collect')),
  quantity integer not null check(quantity <> 0), reason text, actor uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create table public.audit_events (
  id bigint generated always as identity primary key, actor_user_id uuid not null references auth.users(id),
  entity_type text not null, entity_id uuid not null, action text not null,
  created_at timestamptz not null default now()
);
create index registrations_status_date on public.registrations(status,created_at desc);
create index registrations_email on public.registrations(personal_email);
create index orders_registration on public.orders(registration_id);
create index orders_status_date on public.orders(status,created_at desc);
create index movements_variant on public.inventory_movements(product_variant_id,created_at desc);
create index order_items_variant on public.order_items(product_variant_id);
create index audit_date on public.audit_events(created_at desc);

-- All data access is denied until explicitly granted below. Mutations go through RPCs.
do $$ declare t text; begin
  foreach t in array array['admin_memberships','registrations','registration_wellbeing','registration_files','products','product_variants','orders','order_items','payments','inventory_movements','audit_events'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from anon, authenticated',t);
    execute format('grant select on public.%I to authenticated',t);
  end loop;
end $$;
grant select on public.products,public.product_variants to anon;
create policy memberships_read on public.admin_memberships for select to authenticated using (user_id=auth.uid() or private.has_role(array['owner']));
create policy registrations_read on public.registrations for select to authenticated using (user_id=auth.uid() or private.has_role(array['owner','registration_manager']));
create policy wellbeing_read on public.registration_wellbeing for select to authenticated using (private.has_role(array['owner','registration_manager']) or exists(select 1 from public.registrations r where r.id=registration_id and r.user_id=auth.uid()));
create policy files_read on public.registration_files for select to authenticated using (private.has_role(array['owner','registration_manager']) or exists(select 1 from public.registrations r where r.id=registration_id and r.user_id=auth.uid()));
create policy products_read on public.products for select to anon,authenticated using(is_active);
create policy products_admin on public.products for select to authenticated using(private.has_role(array['owner','merch_manager']));
create policy variants_read on public.product_variants for select to anon,authenticated using(exists(select 1 from public.products p where p.id=product_id and p.is_active));
create policy variants_admin on public.product_variants for select to authenticated using(private.has_role(array['owner','merch_manager']));
create policy orders_read on public.orders for select to authenticated using(private.has_role(array['owner','merch_manager']) or exists(select 1 from public.registrations r where r.id=registration_id and r.user_id=auth.uid()));
create policy items_read on public.order_items for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id));
create policy payments_read on public.payments for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id));
create policy movements_read on public.inventory_movements for select to authenticated using(private.has_role(array['owner','merch_manager']));
create policy audit_read on public.audit_events for select to authenticated using(private.has_role(array['owner']));

-- Authenticated users can upload a CV under their own UUID. No overwrites or deletes.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('delegate-cvs','delegate-cvs',false,5242880,array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
create policy cv_upload on storage.objects for insert to authenticated with check (
  bucket_id='delegate-cvs' and (storage.foldername(name))[1]=auth.uid()::text
  and not exists(select 1 from public.registrations where user_id=auth.uid())
);
create policy cv_download on storage.objects for select to authenticated using (
  bucket_id='delegate-cvs' and ((storage.foldername(name))[1]=auth.uid()::text
  or (private.has_role(array['owner','registration_manager']) and exists(select 1 from public.registration_files f where f.storage_key=name)))
);

create function public.submit_registration(p_key uuid,p_answers jsonb,p_file jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); rid uuid; ref text; k text; email text;
begin
  if uid is null then raise exception 'Please verify your email first'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  select id,reference into rid,ref from public.registrations where user_id=uid;
  if found then return jsonb_build_object('id',rid,'reference',ref); end if;
  if jsonb_typeof(p_answers) is distinct from 'object' or jsonb_typeof(p_file) is distinct from 'object' then raise exception 'Invalid submission'; end if;
  foreach k in array array['name','gender','nic','aiesecEmail','email','phone','clan','year','sem','faculty','path','rank','circle','type','seek','drive','diet','allergy','safety','ecName','ecPhone'] loop
    if length(trim(coalesce(p_answers->>k,'')))=0 or length(p_answers->>k)>4000 then raise exception 'Missing or invalid field: %',k; end if;
  end loop;
  foreach k in array array['clan','faculty','circle','allergy','safety'] loop
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
    p_answers->>'clan',p_answers->>'clan-sp',p_answers->>'year',p_answers->>'sem',p_answers->>'faculty',p_answers->>'faculty-sp',
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

create function public.place_order(p_key uuid,p_items jsonb,p_total bigint) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); rid uuid; oid uuid; ref text; item record; v record; total bigint:=0; n integer;
begin
  if uid is null then raise exception 'Please sign in first'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  select id into rid from public.registrations where user_id=uid and status in ('pending','approved');
  if rid is null then raise exception 'An active delegate registration is required'; end if;
  select id,reference into oid,ref from public.orders where submission_key=p_key and registration_id=rid;
  if found then return jsonb_build_object('id',oid,'reference',ref); end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) not between 1 and 30 then raise exception 'Choose between 1 and 30 items'; end if;
  if exists(select 1 from jsonb_array_elements(p_items) x where jsonb_typeof(x->'quantity') is distinct from 'number' or (x->>'quantity') !~ '^\d+$' or length(x->>'quantity')>3) then raise exception 'Invalid quantity'; end if;
  insert into public.orders(submission_key,registration_id) values(p_key,rid) returning id,reference into oid,ref;
  -- Sort locks by variant ID to avoid deadlocks between competing carts.
  for item in select (x->>'variant_id')::uuid variant_id,sum((x->>'quantity')::integer)::integer qty
    from jsonb_array_elements(p_items) x group by (x->>'variant_id')::uuid order by 1 loop
    n:=item.qty;
    if n not between 1 and 100 then raise exception 'Invalid quantity'; end if;
    select pv.*,p.name,p.variant_label,p.is_active into v from public.product_variants pv join public.products p on p.id=pv.product_id
      where pv.id=item.variant_id for update of pv,p;
    if not found or not v.is_active then raise exception 'Product unavailable'; end if;
    if v.stock_on_hand-v.stock_reserved<n then raise exception 'Insufficient stock for % (%)',v.name,v.size; end if;
    update public.product_variants set stock_reserved=stock_reserved+n where id=v.id;
    insert into public.order_items(order_id,product_variant_id,quantity,product_name,variant_label,size,sku,unit_price_minor)
      values(oid,v.id,n,v.name,v.variant_label,v.size,v.sku,v.price_minor);
    insert into public.inventory_movements(product_variant_id,order_id,type,quantity,actor) values(v.id,oid,'reserve',n,uid);
    total:=total+v.price_minor::bigint*n;
  end loop;
  if total<=0 then raise exception 'Order total must be greater than zero'; end if;
  if p_total is null or total<>p_total then raise exception 'Prices changed. Close and reopen checkout to review the new total'; end if;
  update public.orders set total_minor=total where id=oid;
  insert into public.audit_events(actor_user_id,entity_type,entity_id,action) values(uid,'order',oid,'reserved');
  return jsonb_build_object('id',oid,'reference',ref);
end $$;

create function public.admin_registration(p_id uuid,p_status text,p_check_in boolean default false) returns void
language plpgsql security definer set search_path='' as $$
declare r public.registrations;
begin
  if not private.has_role(array['owner','registration_manager']) then raise exception 'Not authorized'; end if;
  select * into r from public.registrations where id=p_id for update;
  if not found then raise exception 'Registration not found'; end if;
  if p_status is null or p_status not in ('pending','approved','rejected','cancelled') then raise exception 'Invalid status'; end if;
  if p_check_in and p_status<>'approved' then raise exception 'Approve the registration before check-in'; end if;
  if r.checked_in_at is not null and p_status<>'approved' then raise exception 'Checked-in delegates must remain approved'; end if;
  update public.registrations set status=p_status,
    checked_in_at=case when p_check_in then coalesce(checked_in_at,now()) else checked_in_at end,
    checked_in_by=case when p_check_in then coalesce(checked_in_by,auth.uid()) else checked_in_by end,updated_at=now() where id=p_id;
  insert into public.audit_events(actor_user_id,entity_type,entity_id,action) values(auth.uid(),'registration',p_id,case when p_check_in then 'checked_in' else p_status end);
end $$;

create function public.admin_order(p_id uuid,p_status text,p_reason text default null) returns void
language plpgsql security definer set search_path='' as $$
declare o public.orders; i record;
begin
  if not private.has_role(array['owner','merch_manager']) then raise exception 'Not authorized'; end if;
  select * into o from public.orders where id=p_id for update;
  if not found then raise exception 'Order not found'; end if;
  if o.status=p_status then return; end if;
  if p_status is null or not ((o.status='reserved' and p_status in ('ready_for_pickup','cancelled')) or (o.status='ready_for_pickup' and p_status in ('collected','cancelled'))) then raise exception 'Invalid order transition'; end if;
  if p_status='collected' and o.payment_status<>'paid' then raise exception 'Verify payment before collection'; end if;
  if p_status='cancelled' and o.payment_status='paid' then raise exception 'Paid orders require an owner-managed refund before cancellation'; end if;
  if p_status in ('collected','cancelled') then
    for i in select * from public.order_items where order_id=p_id order by product_variant_id loop
      update public.product_variants set stock_reserved=stock_reserved-i.quantity,
        stock_on_hand=stock_on_hand-case when p_status='collected' then i.quantity else 0 end where id=i.product_variant_id;
      insert into public.inventory_movements(product_variant_id,order_id,type,quantity,actor,reason)
        values(i.product_variant_id,p_id,case when p_status='collected' then 'collect' else 'release' end,i.quantity,auth.uid(),left(p_reason,1000));
    end loop;
  end if;
  update public.orders set status=p_status,updated_at=now(),cancellation_reason=case when p_status='cancelled' then left(p_reason,1000) else null end,
    collected_at=case when p_status='collected' then now() end,collected_by=case when p_status='collected' then auth.uid() end where id=p_id;
  insert into public.audit_events(actor_user_id,entity_type,entity_id,action) values(auth.uid(),'order',p_id,p_status);
end $$;

create function public.admin_verify_payment(p_id uuid,p_method text,p_reference text default null) returns void
language plpgsql security definer set search_path='' as $$
declare o public.orders;
begin
  if not private.has_role(array['owner','merch_manager']) then raise exception 'Not authorized'; end if;
  select * into o from public.orders where id=p_id for update;
  if not found or o.status='cancelled' then raise exception 'Order unavailable'; end if;
  if o.payment_status='paid' then return; end if;
  if p_method is null or p_method not in ('cash','bank_transfer') then raise exception 'Invalid payment method'; end if;
  if p_method='bank_transfer' and length(trim(coalesce(p_reference,'')))=0 then raise exception 'Transfer reference required'; end if;
  insert into public.payments(order_id,amount_minor,method,external_reference,verified_by) values(p_id,o.total_minor,p_method,left(p_reference,255),auth.uid());
  update public.orders set payment_status='paid',updated_at=now() where id=p_id;
  insert into public.audit_events(actor_user_id,entity_type,entity_id,action) values(auth.uid(),'order',p_id,'payment_verified');
end $$;

create function public.admin_variant(p_id uuid,p_price integer,p_stock integer,p_reason text) returns void
language plpgsql security definer set search_path='' as $$
declare v public.product_variants;
begin
  if not private.has_role(array['owner','merch_manager']) then raise exception 'Not authorized'; end if;
  select * into v from public.product_variants where id=p_id for update;
  if not found then raise exception 'Variant not found'; end if;
  if p_price is null or p_price<0 or p_stock is null or p_stock<v.stock_reserved or length(trim(coalesce(p_reason,'')))=0 then raise exception 'Provide a valid price, stock at least equal to reservations, and a reason'; end if;
  update public.product_variants set price_minor=p_price,stock_on_hand=p_stock where id=p_id;
  if p_stock<>v.stock_on_hand then
    insert into public.inventory_movements(product_variant_id,type,quantity,reason,actor) values(p_id,'adjustment',p_stock-v.stock_on_hand,left(p_reason,1000),auth.uid());
  end if;
  insert into public.audit_events(actor_user_id,entity_type,entity_id,action) values(auth.uid(),'variant',p_id,'price_stock_updated');
end $$;

create function public.admin_summary() returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
  if not private.has_role(array['owner','registration_manager','merch_manager','viewer']) then raise exception 'Not authorized'; end if;
  return jsonb_build_object('registrations',(select count(*) from public.registrations),
    'checked_in',(select count(*) from public.registrations where checked_in_at is not null),
    'orders',(select count(*) from public.orders),'collected',(select count(*) from public.orders where status='collected'),
    'paid_minor',(select coalesce(sum(amount_minor),0) from public.payments));
end $$;

-- Explicit ACLs: Supabase defaults otherwise expose new functions to PUBLIC.
revoke all on function public.submit_registration(uuid,jsonb,jsonb),public.place_order(uuid,jsonb,bigint),public.admin_registration(uuid,text,boolean),public.admin_order(uuid,text,text),public.admin_verify_payment(uuid,text,text),public.admin_variant(uuid,integer,integer,text),public.admin_summary() from public,anon,authenticated;
grant execute on function public.submit_registration(uuid,jsonb,jsonb),public.place_order(uuid,jsonb,bigint),public.admin_registration(uuid,text,boolean),public.admin_order(uuid,text,text),public.admin_verify_payment(uuid,text,text),public.admin_variant(uuid,integer,integer,text),public.admin_summary() to authenticated;
commit;

-- Partnership announcement content is editable from the admin control room.
create table public.partnership_settings (
  id boolean primary key default true check (id),
  content jsonb not null default jsonb_build_object(
    'title', 'PARTNERSHIP ANNOUNCEMENT',
    'intro', 'The organisations walking with us towards Catalyst 7.0.',
    'presenting', jsonb_build_object(
      'name', 'TO BE ANNOUNCED',
      'blurb', 'Our presenting partner stands beside Catalyst 7.0 from the first day to the last. Their name will be revealed soon.',
      'logo', '',
      'url', ''
    ),
    'partners', '[]'::jsonb,
    'cta_label', 'Become a partner',
    'cta_url', '#contact'
  ),
  updated_at timestamptz not null default now()
);
insert into public.partnership_settings(id) values (true);
alter table public.partnership_settings enable row level security;
revoke all on public.partnership_settings from anon, authenticated;
grant select on public.partnership_settings to anon, authenticated;
create policy partnership_settings_read on public.partnership_settings
  for select to anon, authenticated using (id = true);
create function public.admin_save_partnerships(p_content jsonb) returns void
language plpgsql security definer set search_path='' as $$
declare partner_record jsonb; logo_url text; partner_url text; featured jsonb;
begin
  if not private.has_role(array['admin']) then raise exception 'Not authorized'; end if;
  if jsonb_typeof(p_content) is distinct from 'object' then raise exception 'Invalid partnership content'; end if;
  if length(trim(coalesce(p_content->>'title','')))=0 or length(p_content->>'title')>100
    or length(trim(coalesce(p_content->>'intro','')))=0 or length(p_content->>'intro')>500
    or length(trim(coalesce(p_content->>'cta_label','')))=0 or length(p_content->>'cta_label')>80
    or length(trim(coalesce(p_content->>'cta_url','')))=0 or length(p_content->>'cta_url')>500
    then raise exception 'Enter a section title, description, button label and button link'; end if;
  featured:=p_content->'presenting';
  if jsonb_typeof(featured) is distinct from 'object'
    or length(trim(coalesce(featured->>'name','')))=0 or length(featured->>'name')>120
    or length(trim(coalesce(featured->>'blurb','')))=0 or length(featured->>'blurb')>800
    or length(coalesce(featured->>'logo',''))>500 or length(coalesce(featured->>'url',''))>500
    then raise exception 'Enter a valid featured partner name and announcement'; end if;
  logo_url:=coalesce(featured->>'logo','');
  partner_url:=coalesce(featured->>'url','');
  if logo_url<>'' and logo_url !~ '^(https://|/assets/)' then raise exception 'Partner logos must use HTTPS or a local /assets/ path'; end if;
  if partner_url<>'' and partner_url !~ '^https://' then raise exception 'Partner website links must use HTTPS'; end if;
  if coalesce(p_content->>'cta_url','') !~ '^(https://|/|#contact$)' then raise exception 'The partnership button link must use HTTPS, a local path, or #contact'; end if;
  if jsonb_typeof(p_content->'partners') is distinct from 'array' then raise exception 'Partner cards must be an array'; end if;
  if jsonb_array_length(p_content->'partners')>12 then raise exception 'Add no more than 12 partner cards'; end if;
  for partner_record in select value from jsonb_array_elements(p_content->'partners') as entries(value) loop
    if jsonb_typeof(partner_record) is distinct from 'object'
      or length(trim(coalesce(partner_record->>'name','')))=0 or length(partner_record->>'name')>120
      or length(coalesce(partner_record->>'logo',''))>500 or length(coalesce(partner_record->>'url',''))>500
      then raise exception 'Each partner card needs a name and valid image/link fields'; end if;
    logo_url:=coalesce(partner_record->>'logo','');
    partner_url:=coalesce(partner_record->>'url','');
    if logo_url<>'' and logo_url !~ '^(https://|/assets/)' then raise exception 'Partner logos must use HTTPS or a local /assets/ path'; end if;
    if partner_url<>'' and partner_url !~ '^https://' then raise exception 'Partner website links must use HTTPS'; end if;
  end loop;
  insert into public.partnership_settings(id,content,updated_at) values(true,p_content,now());
  insert into public.audit_events(actor_user_id,entity_type,entity_id,action)
    values(auth.uid(),'partnership',gen_random_uuid(),'announcement_updated');
end $$;
revoke all on function public.admin_save_partnerships(jsonb) from public, anon, authenticated;
grant execute on function public.admin_save_partnerships(jsonb) to authenticated;


begin;
-- Stop rather than silently remove existing staff access. Resolve memberships before retrying.
do $$ begin
  if (select count(*) from public.admin_memberships where is_active) > 1 then
    raise exception 'Multiple active administrators exist. Choose the single administrator before applying this migration.';
  end if;
end $$;
alter table public.admin_memberships drop constraint admin_memberships_role_check;
update public.admin_memberships set role='admin';
alter table public.admin_memberships add constraint admin_memberships_role_check check(role='admin');
-- A partial unique index enforces one active administrator across every account.
create unique index one_active_catalyst_admin on public.admin_memberships ((is_active)) where is_active;
-- Preserve existing RPCs and policies; the sole administrator has all administrative permissions.
create or replace function private.has_role(roles text[]) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.admin_memberships where user_id=auth.uid() and is_active and role='admin')
$$;
commit;


begin;
-- University is fixed for new registrations; preserve any existing records.
alter table public.registrations alter column university set default 'SLIIT';

create or replace function public.submit_registration(p_key uuid,p_answers jsonb,p_file jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); rid uuid; ref text; k text; email text;
begin
  if uid is null then raise exception 'Please verify your email first'; end if;
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

commit;


begin;
create table public.shop_settings (
 id boolean primary key default true check(id),
 coming_soon boolean not null default false,
 updated_at timestamptz not null default now()
);
insert into public.shop_settings(id) values(true);
alter table public.shop_settings enable row level security;
revoke all on public.shop_settings from anon,authenticated;
grant select on public.shop_settings to anon,authenticated;
create policy shop_settings_read on public.shop_settings for select to anon,authenticated using(true);
create function public.admin_shop_settings(p_coming_soon boolean) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not private.has_role(array['admin']) then raise exception 'Not authorized'; end if;
 if p_coming_soon is null then raise exception 'Choose a shop status'; end if;
 update public.shop_settings set coming_soon=p_coming_soon,updated_at=now() where id=true;
 insert into public.audit_events(actor_user_id,entity_type,entity_id,action) values(auth.uid(),'shop', '00000000-0000-0000-0000-000000000000',case when p_coming_soon then 'paused' else 'opened' end);
end $$;
create function public.admin_save_product(p_product jsonb,p_variants jsonb default null) returns text
language plpgsql security definer set search_path='' as $$
declare pid text; v jsonb; sz text; price integer; stock integer; vid uuid;
begin
 if not private.has_role(array['admin']) then raise exception 'Not authorized'; end if;
 pid:=trim(p_product->>'id');
 if pid is null or pid !~ '^[a-z0-9][a-z0-9-]{0,79}$' then raise exception 'Use a valid product ID'; end if;
 if length(trim(coalesce(p_product->>'name','')))=0 or length(p_product->>'name')>150
 or length(trim(coalesce(p_product->>'variant_label','')))=0
 or length(trim(coalesce(p_product->>'description','')))=0
 or coalesce(p_product->>'category','') not in ('APPAREL','ACCESSORIES','COLLECTIBLES','SPECIAL SERIES')
 or coalesce(p_product->>'image_url','') !~ '^(https://|/assets/)' then raise exception 'Provide a name, label, category, description and HTTPS or local image path'; end if;
 if exists(select 1 from public.products where id=pid) then
  if p_variants is not null then raise exception 'Product ID already exists. Edit the existing product instead'; end if;
  update public.products set name=trim(p_product->>'name'),variant_label=trim(p_product->>'variant_label'),category=p_product->>'category',description=p_product->>'description',image_url=p_product->>'image_url',is_active=coalesce((p_product->>'is_active')::boolean,false) where id=pid;
 else
  if jsonb_typeof(p_variants) is distinct from 'array' or jsonb_array_length(p_variants) not between 1 and 30 then raise exception 'Add 1 to 30 size variants'; end if;
  insert into public.products(id,name,variant_label,category,description,image_url,is_active) values(pid,trim(p_product->>'name'),trim(p_product->>'variant_label'),p_product->>'category',p_product->>'description',p_product->>'image_url',coalesce((p_product->>'is_active')::boolean,false));
  for v in select * from jsonb_array_elements(p_variants) loop
   sz:=trim(coalesce(v->>'size','')); price:=(v->>'price_minor')::integer; stock:=(v->>'stock_on_hand')::integer;
   if length(sz)>30 or price is null or price<=0 or stock is null or stock<0 then raise exception 'Provide a positive price and nonnegative stock'; end if;
   insert into public.product_variants(product_id,sku,size,price_minor,stock_on_hand) values(pid,pid||'-'||case when sz='' then 'default' else sz end,sz,price,stock) returning id into vid;
   if stock>0 then insert into public.inventory_movements(product_variant_id,type,quantity,reason,actor) values(vid,'adjustment',stock,'Initial product stock',auth.uid()); end if;
  end loop;
 end if;
 insert into public.audit_events(actor_user_id,entity_type,entity_id,action) values(auth.uid(),'catalog',gen_random_uuid(),'product_saved:'||pid);
 return pid;
end $$;
create function private.check_shop_open() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if (select coming_soon from public.shop_settings where id=true for share) then raise exception 'Merchandise is temporarily coming soon. Please check back later.'; end if;
 return new;
end $$;
create trigger orders_shop_open before insert on public.orders for each row execute function private.check_shop_open();
revoke all on function private.check_shop_open() from public,anon,authenticated;
revoke all on function public.admin_shop_settings(boolean),public.admin_save_product(jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.admin_shop_settings(boolean),public.admin_save_product(jsonb,jsonb) to authenticated;
commit;


begin;
-- Pre-orders are not limited by warehouse stock. Keep historical stock fields for compatibility.
-- The existing shop pause trigger still rejects new orders while Coming soon is enabled.
drop policy products_read on public.products;
create policy products_read on public.products for select to anon,authenticated using(is_active and not exists(select 1 from public.shop_settings where coming_soon));
drop policy variants_read on public.product_variants;
create policy variants_read on public.product_variants for select to anon,authenticated using(not exists(select 1 from public.shop_settings where coming_soon) and exists(select 1 from public.products p where p.id=product_id and p.is_active));
create or replace function public.place_order(p_key uuid,p_items jsonb,p_total bigint) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); rid uuid; oid uuid; ref text; item record; v record; total bigint:=0; n integer;
begin
  if uid is null then raise exception 'Please sign in first'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  select id into rid from public.registrations where user_id=uid and status in ('pending','approved');
  if rid is null then raise exception 'An active delegate registration is required'; end if;
  select id,reference into oid,ref from public.orders where submission_key=p_key and registration_id=rid;
  if found then return jsonb_build_object('id',oid,'reference',ref); end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) not between 1 and 30 then raise exception 'Choose between 1 and 30 items'; end if;
  if exists(select 1 from jsonb_array_elements(p_items) x where jsonb_typeof(x->'quantity') is distinct from 'number' or (x->>'quantity') !~ '^\d+$' or length(x->>'quantity')>3) then raise exception 'Invalid quantity'; end if;
  insert into public.orders(submission_key,registration_id) values(p_key,rid) returning id,reference into oid,ref;
  -- Sort locks by variant ID to avoid deadlocks between competing carts.
  for item in select (x->>'variant_id')::uuid variant_id,sum((x->>'quantity')::integer)::integer qty
    from jsonb_array_elements(p_items) x group by (x->>'variant_id')::uuid order by 1 loop
    n:=item.qty;
    if n not between 1 and 100 then raise exception 'Invalid quantity'; end if;
    select pv.*,p.name,p.variant_label,p.is_active into v from public.product_variants pv join public.products p on p.id=pv.product_id
      where pv.id=item.variant_id for update of pv,p;
    if not found or not v.is_active then raise exception 'Product unavailable'; end if;
    insert into public.order_items(order_id,product_variant_id,quantity,product_name,variant_label,size,sku,unit_price_minor)
      values(oid,v.id,n,v.name,v.variant_label,v.size,v.sku,v.price_minor);
    total:=total+v.price_minor::bigint*n;
  end loop;
  if total<=0 then raise exception 'Order total must be greater than zero'; end if;
  if p_total is null or total<>p_total then raise exception 'Prices changed. Close and reopen checkout to review the new total'; end if;
  update public.orders set total_minor=total where id=oid;
  insert into public.audit_events(actor_user_id,entity_type,entity_id,action) values(uid,'order',oid,'preordered');
  return jsonb_build_object('id',oid,'reference',ref);
end $$;

create or replace function public.admin_order(p_id uuid,p_status text,p_reason text default null) returns void
language plpgsql security definer set search_path='' as $$
declare o public.orders; i record;
begin
  if not private.has_role(array['owner','merch_manager']) then raise exception 'Not authorized'; end if;
  select * into o from public.orders where id=p_id for update;
  if not found then raise exception 'Order not found'; end if;
  if o.status=p_status then return; end if;
  if p_status is null or not ((o.status='reserved' and p_status in ('ready_for_pickup','cancelled')) or (o.status='ready_for_pickup' and p_status in ('collected','cancelled'))) then raise exception 'Invalid order transition'; end if;
  if p_status='collected' and o.payment_status<>'paid' then raise exception 'Verify payment before collection'; end if;
  if p_status='cancelled' and o.payment_status='paid' then raise exception 'Paid orders require an owner-managed refund before cancellation'; end if;
  update public.orders set status=p_status,updated_at=now(),cancellation_reason=case when p_status='cancelled' then left(p_reason,1000) else null end,
    collected_at=case when p_status='collected' then now() end,collected_by=case when p_status='collected' then auth.uid() end where id=p_id;
  insert into public.audit_events(actor_user_id,entity_type,entity_id,action) values(auth.uid(),'order',p_id,p_status);
end $$;

create or replace function public.admin_save_product(p_product jsonb,p_variants jsonb default null) returns text
language plpgsql security definer set search_path='' as $$
declare pid text; v jsonb; sz text; price integer; stock integer; vid uuid;
begin
 if not private.has_role(array['admin']) then raise exception 'Not authorized'; end if;
 pid:=trim(p_product->>'id');
 if pid is null or pid !~ '^[a-z0-9][a-z0-9-]{0,79}$' then raise exception 'Use a valid product ID'; end if;
 if length(trim(coalesce(p_product->>'name','')))=0 or length(p_product->>'name')>150
 or length(trim(coalesce(p_product->>'variant_label','')))=0
 or length(trim(coalesce(p_product->>'description','')))=0
 or coalesce(p_product->>'category','') not in ('APPAREL','ACCESSORIES','COLLECTIBLES','SPECIAL SERIES')
 or coalesce(p_product->>'image_url','') !~ '^(https://|/assets/)' then raise exception 'Provide a name, label, category, description and HTTPS or local image path'; end if;
 if exists(select 1 from public.products where id=pid) then
  if p_variants is not null then raise exception 'Product ID already exists. Edit the existing product instead'; end if;
  update public.products set name=trim(p_product->>'name'),variant_label=trim(p_product->>'variant_label'),category=p_product->>'category',description=p_product->>'description',image_url=p_product->>'image_url',is_active=coalesce((p_product->>'is_active')::boolean,false) where id=pid;
 else
  if jsonb_typeof(p_variants) is distinct from 'array' or jsonb_array_length(p_variants) not between 1 and 30 then raise exception 'Add 1 to 30 size variants'; end if;
  insert into public.products(id,name,variant_label,category,description,image_url,is_active) values(pid,trim(p_product->>'name'),trim(p_product->>'variant_label'),p_product->>'category',p_product->>'description',p_product->>'image_url',coalesce((p_product->>'is_active')::boolean,false));
  for v in select * from jsonb_array_elements(p_variants) loop
   sz:=trim(coalesce(v->>'size','')); price:=(v->>'price_minor')::integer; stock:=0;
   if length(sz)>30 or price is null or price<=0 then raise exception 'Provide a positive pre-order price'; end if;
   insert into public.product_variants(product_id,sku,size,price_minor,stock_on_hand) values(pid,pid||'-'||case when sz='' then 'default' else sz end,sz,price,stock) returning id into vid;

  end loop;
 end if;
 insert into public.audit_events(actor_user_id,entity_type,entity_id,action) values(auth.uid(),'catalog',gen_random_uuid(),'product_saved:'||pid);
 return pid;
end $$;

create function public.admin_variant_price(p_id uuid,p_price integer) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not private.has_role(array['admin']) then raise exception 'Not authorized'; end if;
 if p_price is null or p_price<=0 then raise exception 'Provide a positive price'; end if;
 update public.product_variants set price_minor=p_price where id=p_id;
 if not found then raise exception 'Variant not found'; end if;
 insert into public.audit_events(actor_user_id,entity_type,entity_id,action) values(auth.uid(),'variant',p_id,'preorder_price_updated');
end $$;
revoke all on function public.admin_variant_price(uuid,integer) from public,anon,authenticated;
grant execute on function public.admin_variant_price(uuid,integer) to authenticated;
revoke execute on function public.admin_variant(uuid,integer,integer,text) from authenticated;
commit;


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
declare uid uuid:=auth.uid(); rid uuid; ref text; k text; email text; has_file boolean:=false;
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
  if jsonb_typeof(p_answers) is distinct from 'object' or (p_file is not null and jsonb_typeof(p_file) is distinct from 'object') then raise exception 'Invalid submission'; end if;
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

  -- Optional CV validation: only validate if a file is uploaded
  if p_file is not null and (p_file->>'storage_key') is not null and length(trim(p_file->>'storage_key'))>0 then
    if not exists(select 1 from storage.objects o where o.bucket_id='delegate-cvs' and o.name=p_file->>'storage_key'
      and split_part(o.name,'/',1)=uid::text
      and (o.metadata->>'size')::bigint between 1 and 5242880
      and o.metadata->>'mimetype' in ('application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document')) then raise exception 'Upload a valid CV file'; end if;
    has_file:=true;
  end if;

  insert into public.registrations(user_id,submission_key,full_name,gender,nic,aiesec_email,personal_email,phone,
    university,university_other,study_year,semester,faculty,faculty_other,programme,rank,function,function_other,warrior_persona,aspiration,motivation,final_note,cv_partner_consent)
  values(uid,p_key,trim(p_answers->>'name'),p_answers->>'gender',upper(regexp_replace(p_answers->>'nic','\s','','g')),
    lower(trim(p_answers->>'aiesecEmail')),lower(trim(p_answers->>'email')),regexp_replace(p_answers->>'phone','[\s-]','','g'),
    'SLIIT',null,p_answers->>'year',p_answers->>'sem',p_answers->>'faculty',p_answers->>'faculty-sp',
    p_answers->>'path',p_answers->>'rank',p_answers->>'circle',p_answers->>'circle-sp',p_answers->>'type',p_answers->>'seek',p_answers->>'drive',p_answers->>'note',
    coalesce(p_answers->>'cvConsent' in ('true','Yes','1'),false))
  returning id,reference into rid,ref;

  insert into public.registration_wellbeing values(rid,p_answers->>'diet',p_answers->>'allergy'='Yes*',p_answers->>'allergy-sp',
    p_answers->>'safety'='Yes*',p_answers->>'safety-sp',p_answers->>'ecName',regexp_replace(p_answers->>'ecPhone','[\s-]','','g'));

  if has_file then
    insert into public.registration_files(registration_id,storage_key,original_name,mime_type,size_bytes)
    select rid,o.name,left(p_file->>'original_name',255),o.metadata->>'mimetype',(o.metadata->>'size')::integer
    from storage.objects o where o.bucket_id='delegate-cvs' and o.name=p_file->>'storage_key';
  end if;

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


begin;
-- Accept unpaid pre-orders without requiring bank details or a receipt.
-- The underlying transaction still checks identity, registration, prices and shop status.
create function public.submit_preorder(p_key uuid,p_items jsonb,p_total bigint) returns jsonb
language sql security definer set search_path='' as $$
 select public.place_order(p_key,p_items,p_total)
$$;
revoke all on function public.submit_preorder(uuid,jsonb,bigint) from public,anon,authenticated;
grant execute on function public.submit_preorder(uuid,jsonb,bigint) to authenticated;
commit;


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

-- Registration without an email verification step.
begin;
-- The public browser cannot call these functions. Only the registration server
-- creates an unverified Auth identity and submits validated registration data.
create function public.registration_identity(p_email text) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('user_id',u.id,'registered',exists(select 1 from public.registrations r where r.user_id=u.id),
 'is_admin',exists(select 1 from public.admin_memberships m where m.user_id=u.id))
 from auth.users u where lower(u.email)=lower(trim(p_email)) limit 1
$$;
revoke all on function public.registration_identity(text) from public,anon,authenticated;
grant execute on function public.registration_identity(text) to service_role;
grant select on public.registrations to service_role;

create or replace function public.submit_unverified_registration(p_user_id uuid,p_key uuid,p_answers jsonb,p_file jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=p_user_id; rid uuid; ref text; k text; email text; has_file boolean:=false;
begin
  if uid is null then raise exception 'Registration identity required'; end if;
  if exists(select 1 from public.admin_memberships where user_id=uid) then raise exception 'Use a delegate email address'; end if;
  -- Accept the form's clean labels and legacy starred values.
  p_answers:=jsonb_set(p_answers,'{allergy}',to_jsonb(case when p_answers->>'allergy' in ('Yes','Yes*') then 'Yes*' else p_answers->>'allergy' end));
  p_answers:=jsonb_set(p_answers,'{safety}',to_jsonb(case when p_answers->>'safety' in ('Yes','Yes*') then 'Yes*' else p_answers->>'safety' end));
  if p_answers->>'faculty'='Other' then p_answers:=jsonb_set(p_answers,'{faculty}','"Other*"'); end if;
  if p_answers->>'circle'='Other relevant function' then p_answers:=jsonb_set(p_answers,'{circle}','"Other relevant function*"'); end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  select id,reference into rid,ref from public.registrations where user_id=uid;
  if found then
    if not exists(select 1 from public.registrations where id=rid and submission_key=p_key) then raise exception 'A registration already exists for this email. Use it to verify at checkout.'; end if;
    return jsonb_build_object('id',rid,'reference',ref);
  end if;
  if jsonb_typeof(p_answers) is distinct from 'object' or (p_file is not null and jsonb_typeof(p_file) is distinct from 'object') then raise exception 'Invalid submission'; end if;
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
  select lower(u.email) into email from auth.users u where u.id=uid;
  if email is null or email<>lower(trim(p_answers->>'email')) then raise exception 'Registration email does not match the identity'; end if;

  -- Optional CV validation: only validate if a file is uploaded
  if p_file is not null and (p_file->>'storage_key') is not null and length(trim(p_file->>'storage_key'))>0 then
    if not exists(select 1 from storage.objects o where o.bucket_id='delegate-cvs' and o.name=p_file->>'storage_key'
      and split_part(o.name,'/',1)=uid::text and split_part(o.name,'/',2)=p_key::text
      and (o.metadata->>'size')::bigint between 1 and 5242880
      and o.metadata->>'mimetype' in ('application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document')) then raise exception 'Upload a valid CV file'; end if;
    has_file:=true;
  end if;

  insert into public.registrations(user_id,submission_key,full_name,gender,nic,aiesec_email,personal_email,phone,
    university,university_other,study_year,semester,faculty,faculty_other,programme,rank,function,function_other,warrior_persona,aspiration,motivation,final_note,cv_partner_consent)
  values(uid,p_key,trim(p_answers->>'name'),p_answers->>'gender',upper(regexp_replace(p_answers->>'nic','\s','','g')),
    lower(trim(p_answers->>'aiesecEmail')),lower(trim(p_answers->>'email')),regexp_replace(p_answers->>'phone','[\s-]','','g'),
    'SLIIT',null,p_answers->>'year',p_answers->>'sem',p_answers->>'faculty',p_answers->>'faculty-sp',
    p_answers->>'path',p_answers->>'rank',p_answers->>'circle',p_answers->>'circle-sp',p_answers->>'type',p_answers->>'seek',p_answers->>'drive',p_answers->>'note',
    coalesce(p_answers->>'cvConsent' in ('true','Yes','1'),false))
  returning id,reference into rid,ref;

  insert into public.registration_wellbeing values(rid,p_answers->>'diet',p_answers->>'allergy'='Yes*',p_answers->>'allergy-sp',
    p_answers->>'safety'='Yes*',p_answers->>'safety-sp',p_answers->>'ecName',regexp_replace(p_answers->>'ecPhone','[\s-]','','g'));

  if has_file then
    insert into public.registration_files(registration_id,storage_key,original_name,mime_type,size_bytes)
    select rid,o.name,left(p_file->>'original_name',255),o.metadata->>'mimetype',(o.metadata->>'size')::integer
    from storage.objects o where o.bucket_id='delegate-cvs' and o.name=p_file->>'storage_key';
  end if;

  insert into public.audit_events(actor_user_id,entity_type,entity_id,action) values(uid,'registration',rid,'submitted');
  return jsonb_build_object('id',rid,'reference',ref);
end $$;


revoke all on function public.submit_unverified_registration(uuid,uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.submit_unverified_registration(uuid,uuid,jsonb,jsonb) to service_role;

-- Limit new anonymous registration attempts without retaining raw IP addresses.
create table private.registration_attempts (
 source_hash text not null, window_start timestamptz not null, attempts integer not null,
 primary key(source_hash,window_start)
);
alter table private.registration_attempts enable row level security;
revoke all on private.registration_attempts from public,anon,authenticated;
create function public.consume_registration_attempt(p_source_hash text) returns boolean
language plpgsql security definer set search_path='' as $$
declare n integer;
begin
 delete from private.registration_attempts where window_start<now()-interval '1 day';
 insert into private.registration_attempts values(p_source_hash,date_trunc('hour',now()),1)
 on conflict(source_hash,window_start) do update set attempts=private.registration_attempts.attempts+1 returning attempts into n;
 return n<=10;
end $$;
revoke all on function public.consume_registration_attempt(text) from public,anon,authenticated;
grant execute on function public.consume_registration_attempt(text) to service_role;

commit;

-- Anonymous registration with email linking at checkout.
begin;
create or replace function public.submit_registration_for_anonymous(p_user_id uuid,p_key uuid,p_answers jsonb,p_file jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=p_user_id; rid uuid; ref text; k text; email text; has_file boolean:=false;
begin
  if uid is null then raise exception 'Registration identity required'; end if;
  if exists(select 1 from public.admin_memberships where user_id=uid) then raise exception 'Use a delegate email address'; end if;
  -- Accept the form's clean labels and legacy starred values.
  p_answers:=jsonb_set(p_answers,'{allergy}',to_jsonb(case when p_answers->>'allergy' in ('Yes','Yes*') then 'Yes*' else p_answers->>'allergy' end));
  p_answers:=jsonb_set(p_answers,'{safety}',to_jsonb(case when p_answers->>'safety' in ('Yes','Yes*') then 'Yes*' else p_answers->>'safety' end));
  if p_answers->>'faculty'='Other' then p_answers:=jsonb_set(p_answers,'{faculty}','"Other*"'); end if;
  if p_answers->>'circle'='Other relevant function' then p_answers:=jsonb_set(p_answers,'{circle}','"Other relevant function*"'); end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  select id,reference into rid,ref from public.registrations where user_id=uid;
  if found then
    if not exists(select 1 from public.registrations where id=rid and submission_key=p_key) then raise exception 'A registration already exists for this email. Use it to verify at checkout.'; end if;
    return jsonb_build_object('id',rid,'reference',ref);
  end if;
  if jsonb_typeof(p_answers) is distinct from 'object' or (p_file is not null and jsonb_typeof(p_file) is distinct from 'object') then raise exception 'Invalid submission'; end if;
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
  select lower(u.email) into email from auth.users u where u.id=uid;
  if email is null or email<>lower(trim(p_answers->>'email')) then raise exception 'Registration email does not match the identity'; end if;

  -- Optional CV validation: only validate if a file is uploaded
  if p_file is not null and (p_file->>'storage_key') is not null and length(trim(p_file->>'storage_key'))>0 then
    if not exists(select 1 from storage.objects o where o.bucket_id='delegate-cvs' and o.name=p_file->>'storage_key'
      and split_part(o.name,'/',1)=uid::text and split_part(o.name,'/',2)=p_key::text
      and (o.metadata->>'size')::bigint between 1 and 5242880
      and o.metadata->>'mimetype' in ('application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document')) then raise exception 'Upload a valid CV file'; end if;
    has_file:=true;
  end if;

  insert into public.registrations(user_id,submission_key,full_name,gender,nic,aiesec_email,personal_email,phone,
    university,university_other,study_year,semester,faculty,faculty_other,programme,rank,function,function_other,warrior_persona,aspiration,motivation,final_note,cv_partner_consent)
  values(uid,p_key,trim(p_answers->>'name'),p_answers->>'gender',upper(regexp_replace(p_answers->>'nic','\s','','g')),
    lower(trim(p_answers->>'aiesecEmail')),lower(trim(p_answers->>'email')),regexp_replace(p_answers->>'phone','[\s-]','','g'),
    'SLIIT',null,p_answers->>'year',p_answers->>'sem',p_answers->>'faculty',p_answers->>'faculty-sp',
    p_answers->>'path',p_answers->>'rank',p_answers->>'circle',p_answers->>'circle-sp',p_answers->>'type',p_answers->>'seek',p_answers->>'drive',p_answers->>'note',
    coalesce(p_answers->>'cvConsent' in ('true','Yes','1'),false))
  returning id,reference into rid,ref;

  insert into public.registration_wellbeing values(rid,p_answers->>'diet',p_answers->>'allergy'='Yes*',p_answers->>'allergy-sp',
    p_answers->>'safety'='Yes*',p_answers->>'safety-sp',p_answers->>'ecName',regexp_replace(p_answers->>'ecPhone','[\s-]','','g'));

  if has_file then
    insert into public.registration_files(registration_id,storage_key,original_name,mime_type,size_bytes)
    select rid,o.name,left(p_file->>'original_name',255),o.metadata->>'mimetype',(o.metadata->>'size')::integer
    from storage.objects o where o.bucket_id='delegate-cvs' and o.name=p_file->>'storage_key';
  end if;

  insert into public.audit_events(actor_user_id,entity_type,entity_id,action) values(uid,'registration',rid,'submitted');
  return jsonb_build_object('id',rid,'reference',ref);
end $$;


revoke all on function public.submit_registration_for_anonymous(uuid,uuid,jsonb,jsonb) from public,anon,authenticated;
create or replace function public.submit_unverified_registration(p_user_id uuid,p_key uuid,p_answers jsonb,p_file jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or auth.uid()<>p_user_id or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) is not true then
   raise exception 'Start a new registration session before submitting';
 end if;
 return public.submit_registration_for_anonymous(p_user_id,p_key,p_answers,p_file);
end $$;
revoke all on function public.submit_unverified_registration(uuid,uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.submit_unverified_registration(uuid,uuid,jsonb,jsonb) to authenticated;

-- After the user verifies the registration email at checkout, associate the
-- anonymous registration with that verified Auth identity.
create function public.link_registration_to_verified_email() returns boolean
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); mail text; anon_uid uuid; rid uuid;
begin
 if uid is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Verify your personal email first'; end if;
 select lower(email) into mail from auth.users where id=uid and email_confirmed_at is not null;
 if mail is null then raise exception 'Verify your personal email first'; end if;
 select r.id,r.user_id into rid,anon_uid from public.registrations r where lower(r.personal_email)=mail for update;
 if not found then raise exception 'No registration was found for this email address'; end if;
 if anon_uid=uid then return true; end if;
 if not exists(select 1 from auth.users where id=anon_uid and is_anonymous) then raise exception 'This email is already linked to another account'; end if;
 if exists(select 1 from public.registrations where user_id=uid and id<>rid) then raise exception 'This account already has a different registration'; end if;
 update public.registrations set user_id=uid where id=rid;
 return true;
end $$;
revoke all on function public.link_registration_to_verified_email() from public,anon;
grant execute on function public.link_registration_to_verified_email() to authenticated;

commit;

-- Anonymous Auth users do not have an email until checkout verification.
begin;
create or replace function public.submit_registration_for_anonymous(p_user_id uuid,p_key uuid,p_answers jsonb,p_file jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=p_user_id; rid uuid; ref text; k text; email text; has_file boolean:=false;
begin
  if uid is null then raise exception 'Registration identity required'; end if;
  if exists(select 1 from public.admin_memberships where user_id=uid) then raise exception 'Use a delegate email address'; end if;
  -- Accept the form's clean labels and legacy starred values.
  p_answers:=jsonb_set(p_answers,'{allergy}',to_jsonb(case when p_answers->>'allergy' in ('Yes','Yes*') then 'Yes*' else p_answers->>'allergy' end));
  p_answers:=jsonb_set(p_answers,'{safety}',to_jsonb(case when p_answers->>'safety' in ('Yes','Yes*') then 'Yes*' else p_answers->>'safety' end));
  if p_answers->>'faculty'='Other' then p_answers:=jsonb_set(p_answers,'{faculty}','"Other*"'); end if;
  if p_answers->>'circle'='Other relevant function' then p_answers:=jsonb_set(p_answers,'{circle}','"Other relevant function*"'); end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  select id,reference into rid,ref from public.registrations where user_id=uid;
  if found then
    if not exists(select 1 from public.registrations where id=rid and submission_key=p_key) then raise exception 'A registration already exists for this email. Use it to verify at checkout.'; end if;
    return jsonb_build_object('id',rid,'reference',ref);
  end if;
  if jsonb_typeof(p_answers) is distinct from 'object' or (p_file is not null and jsonb_typeof(p_file) is distinct from 'object') then raise exception 'Invalid submission'; end if;
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
  if coalesce((auth.jwt()->>'is_anonymous')::boolean,false) is true then
    -- Anonymous identities have no Auth email yet; checkout verifies this value.
    email:=lower(trim(p_answers->>'email'));
  else
    select lower(u.email) into email from auth.users u where u.id=uid;
    if email is null or email<>lower(trim(p_answers->>'email')) then raise exception 'Registration email does not match the identity'; end if;
  end if;

  -- Optional CV validation: only validate if a file is uploaded
  if p_file is not null and (p_file->>'storage_key') is not null and length(trim(p_file->>'storage_key'))>0 then
    if not exists(select 1 from storage.objects o where o.bucket_id='delegate-cvs' and o.name=p_file->>'storage_key'
      and split_part(o.name,'/',1)=uid::text and split_part(o.name,'/',2)=p_key::text
      and (o.metadata->>'size')::bigint between 1 and 5242880
      and o.metadata->>'mimetype' in ('application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document')) then raise exception 'Upload a valid CV file'; end if;
    has_file:=true;
  end if;

  insert into public.registrations(user_id,submission_key,full_name,gender,nic,aiesec_email,personal_email,phone,
    university,university_other,study_year,semester,faculty,faculty_other,programme,rank,function,function_other,warrior_persona,aspiration,motivation,final_note,cv_partner_consent)
  values(uid,p_key,trim(p_answers->>'name'),p_answers->>'gender',upper(regexp_replace(p_answers->>'nic','\s','','g')),
    lower(trim(p_answers->>'aiesecEmail')),lower(trim(p_answers->>'email')),regexp_replace(p_answers->>'phone','[\s-]','','g'),
    'SLIIT',null,p_answers->>'year',p_answers->>'sem',p_answers->>'faculty',p_answers->>'faculty-sp',
    p_answers->>'path',p_answers->>'rank',p_answers->>'circle',p_answers->>'circle-sp',p_answers->>'type',p_answers->>'seek',p_answers->>'drive',p_answers->>'note',
    coalesce(p_answers->>'cvConsent' in ('true','Yes','1'),false))
  returning id,reference into rid,ref;

  insert into public.registration_wellbeing values(rid,p_answers->>'diet',p_answers->>'allergy'='Yes*',p_answers->>'allergy-sp',
    p_answers->>'safety'='Yes*',p_answers->>'safety-sp',p_answers->>'ecName',regexp_replace(p_answers->>'ecPhone','[\s-]','','g'));

  if has_file then
    insert into public.registration_files(registration_id,storage_key,original_name,mime_type,size_bytes)
    select rid,o.name,left(p_file->>'original_name',255),o.metadata->>'mimetype',(o.metadata->>'size')::integer
    from storage.objects o where o.bucket_id='delegate-cvs' and o.name=p_file->>'storage_key';
  end if;

  insert into public.audit_events(actor_user_id,entity_type,entity_id,action) values(uid,'registration',rid,'submitted');
  return jsonb_build_object('id',rid,'reference',ref);
end $$;


commit;


-- 202611120001_registration_sheet_sync.sql
begin;
-- Durable, versioned outbox. A stale acknowledgement cannot hide a newer edit.
create table public.registration_sheet_sync (
 registration_id uuid primary key references public.registrations(id) on delete cascade,
 version bigint not null default 1,
 synced_version bigint not null default 0,
 last_synced_at timestamptz,
 last_error text,
 next_attempt_at timestamptz not null default now()
);
alter table public.registration_sheet_sync enable row level security;
create policy sheet_sync_admin_read on public.registration_sheet_sync for select to authenticated
 using(private.has_role(array['admin']));
grant select on public.registration_sheet_sync to authenticated;
create function private.queue_registration_sheet_sync() returns trigger
language plpgsql security definer set search_path='' as $$ begin
 insert into public.registration_sheet_sync(registration_id) values(new.id)
 on conflict(registration_id) do update set version=public.registration_sheet_sync.version+1,last_error=null,next_attempt_at=now();
 return new;
end $$;
create trigger registration_sheet_sync_changed after insert or update on public.registrations
 for each row execute function private.queue_registration_sheet_sync();
insert into public.registration_sheet_sync(registration_id) select id from public.registrations;
create function public.admin_requeue_sheet_sync(p_all boolean default false) returns void
language plpgsql security definer set search_path='' as $$ begin
 if not private.has_role(array['admin']) then raise exception 'Not authorized'; end if;
 update public.registration_sheet_sync set version=version+1,last_error=null,next_attempt_at=now()
 where p_all or last_error is not null;
end $$;
create function public.admin_sheet_sync_status() returns jsonb
language plpgsql security definer set search_path='' as $$ begin
 if not private.has_role(array['admin']) then raise exception 'Not authorized'; end if;
 return jsonb_build_object('total',(select count(*) from public.registration_sheet_sync),
 'pending',(select count(*) from public.registration_sheet_sync where version>synced_version and last_error is null),
 'failed',(select count(*) from public.registration_sheet_sync where version>synced_version and last_error is not null),
 'last_synced_at',(select max(last_synced_at) from public.registration_sheet_sync));
end $$;
-- Worker-only API. Explicit allowlist avoids exporting identities or private files.
create function public.sheet_sync_batch() returns jsonb
language sql security definer set search_path='' as $$
 select coalesce(jsonb_agg(j),'[]'::jsonb) from (
 select q.registration_id,q.version,jsonb_build_array(r.id,r.reference,r.created_at,r.full_name,r.gender,r.nic,
 r.aiesec_email,r.personal_email,r.phone,r.university,r.university_other,r.study_year,r.semester,
 r.faculty,r.faculty_other,r.programme,r.rank,r.function,r.function_other,r.warrior_persona,
 r.aspiration,r.motivation,r.final_note,r.cv_partner_consent,r.status,r.checked_in_at,r.updated_at) as cells
 from public.registration_sheet_sync q join public.registrations r on r.id=q.registration_id
 where q.version>q.synced_version and q.next_attempt_at<=now()
 order by q.next_attempt_at,q.registration_id limit 100
 ) j
$$;
create function public.sheet_sync_ack(p_id uuid,p_version bigint,p_error text default null) returns void
language plpgsql security definer set search_path='' as $$ begin
 update public.registration_sheet_sync set
 synced_version=case when p_error is null then p_version else synced_version end,
 last_synced_at=case when p_error is null then now() else last_synced_at end,
 last_error=left(p_error,500),
 next_attempt_at=case when p_error is null then now() else now()+interval '5 minutes' end
 where registration_id=p_id and version=p_version;
end $$;
revoke all on function public.admin_requeue_sheet_sync(boolean),public.admin_sheet_sync_status(),public.sheet_sync_batch(),public.sheet_sync_ack(uuid,bigint,text) from public,anon,authenticated;
grant execute on function public.admin_requeue_sheet_sync(boolean),public.admin_sheet_sync_status() to authenticated;
grant execute on function public.sheet_sync_batch(),public.sheet_sync_ack(uuid,bigint,text) to service_role;
commit;


-- 202611120002_viewer_access.sql
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
