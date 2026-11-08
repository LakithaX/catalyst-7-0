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
