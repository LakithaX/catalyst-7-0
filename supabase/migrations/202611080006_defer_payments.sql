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
