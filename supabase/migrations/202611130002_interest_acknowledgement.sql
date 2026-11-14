begin;
-- Keep the existing queue and its delivery history. New jobs now acknowledge
-- interest at submission time, rather than confirming acceptance on approval.
drop trigger if exists registration_acceptance_email on public.registrations;
create or replace function private.queue_acceptance_email() returns trigger
language plpgsql security definer set search_path='' as $$ begin
 insert into public.registration_acceptance_emails(registration_id,recipient,full_name,reference)
 values(new.id,new.personal_email,new.full_name,new.reference)
 on conflict(registration_id) do nothing;
 return new;
end $$;
create trigger registration_interest_email after insert on public.registrations
 for each row execute function private.queue_acceptance_email();

create or replace function public.claim_acceptance_email(p_id uuid)
returns setof public.registration_acceptance_emails
language plpgsql security definer set search_path='' as $$ begin
 perform 1 from public.registrations where id=p_id and status in ('pending','approved') for update;
 if not found then return; end if;
 return query update public.registration_acceptance_emails
 set status='sending',claim_token=gen_random_uuid(),attempts=attempts+1,attempted_at=now()
 where registration_id=p_id and status in ('pending','failed')
 returning *;
end $$;
-- Preserve the server-only grants from the preceding migration. Do not backfill
-- existing registrations or resend previously delivered emails.
commit;
notify pgrst, 'reload schema';
