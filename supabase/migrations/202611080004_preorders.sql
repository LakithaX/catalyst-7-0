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
