-- Run in Supabase SQL Editor after applying 202611120002_viewer_access.sql.
-- First create eb@cat.com in Authentication > Users with a password.
-- This grants panel access only; it does not create an Auth user or set passwords.
begin;
do $$
declare viewer_id uuid;
begin
  select id into strict viewer_id from auth.users where lower(email) = 'eb@cat.com';
  if exists(select 1 from public.admin_memberships where user_id = viewer_id and role = 'admin') then
    raise exception 'This user is already an administrator. Refusing to change their role.';
  end if;
  insert into public.admin_memberships(user_id, role, is_active)
    values(viewer_id, 'viewer', true)
    on conflict(user_id) do update set is_active = true
    where public.admin_memberships.role = 'viewer';
exception
  when no_data_found then
    raise exception 'Create the eb@cat.com Auth user with a password before granting viewer access.';
end $$;
commit;

select u.email, m.role, m.is_active
from public.admin_memberships m join auth.users u on u.id = m.user_id
where lower(u.email) in ('eb@cat.com', 'delocvp@cat.com');
