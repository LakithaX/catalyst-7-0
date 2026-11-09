begin;

create table if not exists public.partnership_settings (
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

insert into public.partnership_settings(id) values (true)
on conflict (id) do nothing;

alter table public.partnership_settings enable row level security;
revoke all on public.partnership_settings from anon, authenticated;
grant select on public.partnership_settings to anon, authenticated;
drop policy if exists partnership_settings_read on public.partnership_settings;
create policy partnership_settings_read on public.partnership_settings
  for select to anon, authenticated using (id = true);

create or replace function public.admin_save_partnerships(p_content jsonb) returns void
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

  insert into public.partnership_settings(id,content,updated_at)
    values(true,p_content,now())
    on conflict(id) do update set content=excluded.content,updated_at=excluded.updated_at;
  insert into public.audit_events(actor_user_id,entity_type,entity_id,action)
    values(auth.uid(),'partnership',gen_random_uuid(),'announcement_updated');
end $$;

revoke all on function public.admin_save_partnerships(jsonb) from public, anon, authenticated;
grant execute on function public.admin_save_partnerships(jsonb) to authenticated;

commit;
notify pgrst, 'reload schema';
