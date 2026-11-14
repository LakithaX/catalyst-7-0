begin;
-- Queue the acknowledgement for existing active registrations, including those
-- created before submission-triggered email was installed. Never reset a job:
-- sent, in-flight and uncertain results must retain their duplicate protection.
insert into public.registration_acceptance_emails(registration_id,recipient,full_name,reference)
select id,personal_email,full_name,reference from public.registrations
where status in ('pending','approved')
on conflict(registration_id) do nothing;
commit;
notify pgrst, 'reload schema';
