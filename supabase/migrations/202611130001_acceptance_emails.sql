begin;
-- An approval and its email job commit together; existing approvals are not mailed.
create table public.registration_acceptance_emails (
 registration_id uuid primary key references public.registrations(id),
 recipient text not null, full_name text not null, reference text not null,
 status text not null default 'pending' check(status in ('pending','sending','sent','failed','uncertain')),
 attempts integer not null default 0, claim_token uuid,
 created_at timestamptz not null default now(), attempted_at timestamptz,
 sent_at timestamptz, message_id text
);
alter table public.registration_acceptance_emails enable row level security;
revoke all on public.registration_acceptance_emails from anon,authenticated;
grant select on public.registration_acceptance_emails to authenticated;
create policy acceptance_email_admin_read on public.registration_acceptance_emails
 for select to authenticated using(private.can_view_admin());

create function private.queue_acceptance_email() returns trigger
language plpgsql security definer set search_path='' as $$ begin
 if new.status='approved' and old.status is distinct from 'approved' then
  insert into public.registration_acceptance_emails(registration_id,recipient,full_name,reference)
  values(new.id,new.personal_email,new.full_name,new.reference)
  on conflict(registration_id) do nothing;
 end if;
 return new;
end $$;
revoke all on function private.queue_acceptance_email() from public,anon,authenticated;
create trigger registration_acceptance_email after update of status on public.registrations
 for each row execute function private.queue_acceptance_email();

-- A claim is never automatically expired: SMTP can accept mail before a process
-- crashes. Retrying an abandoned claim could send a duplicate confirmation.
create function public.claim_acceptance_email(p_id uuid)
returns setof public.registration_acceptance_emails
language plpgsql security definer set search_path='' as $$ begin
 perform 1 from public.registrations where id=p_id and status='approved' for update;
 if not found then return; end if;
 return query update public.registration_acceptance_emails
 set status='sending',claim_token=gen_random_uuid(),attempts=attempts+1,attempted_at=now()
 where registration_id=p_id and status in ('pending','failed')
 returning *;
end $$;
create function public.finish_acceptance_email(p_id uuid,p_token uuid,p_status text,p_message_id text default null)
returns boolean language plpgsql security definer set search_path='' as $$
declare changed integer;
begin
 if p_status not in ('sent','failed','uncertain') or p_status is null then raise exception 'Invalid email result'; end if;
 update public.registration_acceptance_emails set status=p_status,
 sent_at=case when p_status='sent' then now() else null end,message_id=p_message_id
 where registration_id=p_id and claim_token=p_token and status='sending';
 get diagnostics changed=row_count;
 return changed=1;
end $$;
revoke all on function public.claim_acceptance_email(uuid),public.finish_acceptance_email(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.claim_acceptance_email(uuid),public.finish_acceptance_email(uuid,uuid,text,text) to service_role;
commit;
notify pgrst, 'reload schema';
