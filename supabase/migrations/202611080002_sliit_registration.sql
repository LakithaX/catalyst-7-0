begin;
-- University is fixed for new registrations; preserve any existing records.
alter table public.registrations alter column university set default 'SLIIT';

create or replace function public.submit_registration(p_key uuid,p_answers jsonb,p_file jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); rid uuid; ref text; k text; email text;
begin
  if uid is null then raise exception 'Please verify your email first'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  select id,reference into rid,ref from public.registrations where user_id=uid;
  if found then return jsonb_build_object('id',rid,'reference',ref); end if;
  if jsonb_typeof(p_answers) is distinct from 'object' or jsonb_typeof(p_file) is distinct from 'object' then raise exception 'Invalid submission'; end if;
  foreach k in array array['name','gender','nic','aiesecEmail','email','phone','year','sem','faculty','path','rank','circle','type','seek','drive','diet','allergy','safety','ecName','ecPhone'] loop
    if length(trim(coalesce(p_answers->>k,'')))=0 or length(p_answers->>k)>4000 then raise exception 'Missing or invalid field: %',k; end if;
  end loop;
  foreach k in array array['faculty','circle','allergy','safety'] loop
    if right(p_answers->>k,1)='*' and length(trim(coalesce(p_answers->>(k||'-sp'),'')))=0 then raise exception 'Specify details for %',k; end if;
  end loop;
  if octet_length(p_answers::text)>50000 then raise exception 'Submission too large'; end if;
  if upper(regexp_replace(p_answers->>'nic','\s','','g')) !~ '^(\d{9}[VX]|\d{12})$'
    or regexp_replace(p_answers->>'phone','[\s-]','','g') !~ '^\+?\d{9,13}$'
    or regexp_replace(p_answers->>'ecPhone','[\s-]','','g') !~ '^\+?\d{9,13}$'
    or (p_answers->>'email') !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$'
    or (p_answers->>'aiesecEmail') !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' then raise exception 'Invalid identity or contact details'; end if;
  select lower(u.email) into email from auth.users u where u.id=uid and u.email_confirmed_at is not null;
  if email is null or email not in (lower(trim(p_answers->>'email')),lower(trim(p_answers->>'aiesecEmail'))) then raise exception 'Sign in with one of your registration email addresses'; end if;
  if not exists(select 1 from storage.objects o where o.bucket_id='delegate-cvs' and o.name=p_file->>'storage_key'
    and split_part(o.name,'/',1)=uid::text
    and (o.metadata->>'size')::bigint between 1 and 5242880
    and o.metadata->>'mimetype' in ('application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document')) then raise exception 'Upload a valid CV first'; end if;
  insert into public.registrations(user_id,submission_key,full_name,gender,nic,aiesec_email,personal_email,phone,
    university,university_other,study_year,semester,faculty,faculty_other,programme,rank,function,function_other,warrior_persona,aspiration,motivation,final_note)
  values(uid,p_key,trim(p_answers->>'name'),p_answers->>'gender',upper(regexp_replace(p_answers->>'nic','\s','','g')),
    lower(trim(p_answers->>'aiesecEmail')),lower(trim(p_answers->>'email')),regexp_replace(p_answers->>'phone','[\s-]','','g'),
    'SLIIT',null,p_answers->>'year',p_answers->>'sem',p_answers->>'faculty',p_answers->>'faculty-sp',
    p_answers->>'path',p_answers->>'rank',p_answers->>'circle',p_answers->>'circle-sp',p_answers->>'type',p_answers->>'seek',p_answers->>'drive',p_answers->>'note')
  returning id,reference into rid,ref;
  insert into public.registration_wellbeing values(rid,p_answers->>'diet',p_answers->>'allergy'='Yes*',p_answers->>'allergy-sp',
    p_answers->>'safety'='Yes*',p_answers->>'safety-sp',p_answers->>'ecName',regexp_replace(p_answers->>'ecPhone','[\s-]','','g'));
  insert into public.registration_files(registration_id,storage_key,original_name,mime_type,size_bytes)
  select rid,o.name,left(p_file->>'original_name',255),o.metadata->>'mimetype',(o.metadata->>'size')::integer
  from storage.objects o where o.bucket_id='delegate-cvs' and o.name=p_file->>'storage_key';
  insert into public.audit_events(actor_user_id,entity_type,entity_id,action) values(uid,'registration',rid,'submitted');
  return jsonb_build_object('id',rid,'reference',ref);
end $$;

commit;
