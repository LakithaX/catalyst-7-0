begin;
-- Durable, versioned outbox. A stale acknowledgement cannot hide a newer edit.
create table public.registration_sheet_sync (
 registration_id uuid primary key references public.registrations(id) on delete cascade,
 version bigint not null default 1,
 synced_version bigint not null default 0,
 last_synced_at timestamptz,
 last_error text,
 next_attempt_at timestamptz not null default now()
);
alter table public.registration_sheet_sync enable row level security;
create policy sheet_sync_admin_read on public.registration_sheet_sync for select to authenticated
 using(private.has_role(array['admin']));
grant select on public.registration_sheet_sync to authenticated;
create function private.queue_registration_sheet_sync() returns trigger
language plpgsql security definer set search_path='' as $$ begin
 insert into public.registration_sheet_sync(registration_id) values(new.id)
 on conflict(registration_id) do update set version=public.registration_sheet_sync.version+1,last_error=null,next_attempt_at=now();
 return new;
end $$;
create trigger registration_sheet_sync_changed after insert or update on public.registrations
 for each row execute function private.queue_registration_sheet_sync();
insert into public.registration_sheet_sync(registration_id) select id from public.registrations;
create function public.admin_requeue_sheet_sync(p_all boolean default false) returns void
language plpgsql security definer set search_path='' as $$ begin
 if not private.has_role(array['admin']) then raise exception 'Not authorized'; end if;
 update public.registration_sheet_sync set version=version+1,last_error=null,next_attempt_at=now()
 where p_all or last_error is not null;
end $$;
create function public.admin_sheet_sync_status() returns jsonb
language plpgsql security definer set search_path='' as $$ begin
 if not private.has_role(array['admin']) then raise exception 'Not authorized'; end if;
 return jsonb_build_object('total',(select count(*) from public.registration_sheet_sync),
 'pending',(select count(*) from public.registration_sheet_sync where version>synced_version and last_error is null),
 'failed',(select count(*) from public.registration_sheet_sync where version>synced_version and last_error is not null),
 'last_synced_at',(select max(last_synced_at) from public.registration_sheet_sync));
end $$;
-- Worker-only API. Explicit allowlist avoids exporting identities or private files.
create function public.sheet_sync_batch() returns jsonb
language sql security definer set search_path='' as $$
 select coalesce(jsonb_agg(j),'[]'::jsonb) from (
 select q.registration_id,q.version,jsonb_build_array(r.id,r.reference,r.created_at,r.full_name,r.gender,r.nic,
 r.aiesec_email,r.personal_email,r.phone,r.university,r.university_other,r.study_year,r.semester,
 r.faculty,r.faculty_other,r.programme,r.rank,r.function,r.function_other,r.warrior_persona,
 r.aspiration,r.motivation,r.final_note,r.cv_partner_consent,r.status,r.checked_in_at,r.updated_at) as cells
 from public.registration_sheet_sync q join public.registrations r on r.id=q.registration_id
 where q.version>q.synced_version and q.next_attempt_at<=now()
 order by q.next_attempt_at,q.registration_id limit 100
 ) j
$$;
create function public.sheet_sync_ack(p_id uuid,p_version bigint,p_error text default null) returns void
language plpgsql security definer set search_path='' as $$ begin
 update public.registration_sheet_sync set
 synced_version=case when p_error is null then p_version else synced_version end,
 last_synced_at=case when p_error is null then now() else last_synced_at end,
 last_error=left(p_error,500),
 next_attempt_at=case when p_error is null then now() else now()+interval '5 minutes' end
 where registration_id=p_id and version=p_version;
end $$;
revoke all on function public.admin_requeue_sheet_sync(boolean),public.admin_sheet_sync_status(),public.sheet_sync_batch(),public.sheet_sync_ack(uuid,bigint,text) from public,anon,authenticated;
grant execute on function public.admin_requeue_sheet_sync(boolean),public.admin_sheet_sync_status() to authenticated;
grant execute on function public.sheet_sync_batch(),public.sheet_sync_ack(uuid,bigint,text) to service_role;
commit;
