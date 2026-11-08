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
