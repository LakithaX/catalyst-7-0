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
