begin;

-- 1. Add cv_partner_consent column to public.registrations
alter table public.registrations
  add column if not exists cv_partner_consent boolean not null default false;

-- 2. Update submit_registration to make CV optional and record partner consent
create or replace function public.submit_registration(p_key uuid,p_answers jsonb,p_file jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); rid uuid; ref text; k text; email text; has_file boolean:=false;
begin
  if uid is null then raise exception 'Please verify your email first'; end if;
  -- Accept the form's clean labels and legacy starred values.
  p_answers:=jsonb_set(p_answers,'{allergy}',to_jsonb(case when p_answers->>'allergy' in ('Yes','Yes*') then 'Yes*' else p_answers->>'allergy' end));
  p_answers:=jsonb_set(p_answers,'{safety}',to_jsonb(case when p_answers->>'safety' in ('Yes','Yes*') then 'Yes*' else p_answers->>'safety' end));
  if p_answers->>'faculty'='Other' then p_answers:=jsonb_set(p_answers,'{faculty}','"Other*"'); end if;
  if p_answers->>'circle'='Other relevant function' then p_answers:=jsonb_set(p_answers,'{circle}','"Other relevant function*"'); end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  select id,reference into rid,ref from public.registrations where user_id=uid;
  if found then return jsonb_build_object('id',rid,'reference',ref); end if;
  if jsonb_typeof(p_answers) is distinct from 'object' or (p_file is not null and jsonb_typeof(p_file) is distinct from 'object') then raise exception 'Invalid submission'; end if;
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

  -- Optional CV validation: only validate if a file is uploaded
  if p_file is not null and (p_file->>'storage_key') is not null and length(trim(p_file->>'storage_key'))>0 then
    if not exists(select 1 from storage.objects o where o.bucket_id='delegate-cvs' and o.name=p_file->>'storage_key'
      and split_part(o.name,'/',1)=uid::text
      and (o.metadata->>'size')::bigint between 1 and 5242880
      and o.metadata->>'mimetype' in ('application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document')) then raise exception 'Upload a valid CV file'; end if;
    has_file:=true;
  end if;

  insert into public.registrations(user_id,submission_key,full_name,gender,nic,aiesec_email,personal_email,phone,
    university,university_other,study_year,semester,faculty,faculty_other,programme,rank,function,function_other,warrior_persona,aspiration,motivation,final_note,cv_partner_consent)
  values(uid,p_key,trim(p_answers->>'name'),p_answers->>'gender',upper(regexp_replace(p_answers->>'nic','\s','','g')),
    lower(trim(p_answers->>'aiesecEmail')),lower(trim(p_answers->>'email')),regexp_replace(p_answers->>'phone','[\s-]','','g'),
    'SLIIT',null,p_answers->>'year',p_answers->>'sem',p_answers->>'faculty',p_answers->>'faculty-sp',
    p_answers->>'path',p_answers->>'rank',p_answers->>'circle',p_answers->>'circle-sp',p_answers->>'type',p_answers->>'seek',p_answers->>'drive',p_answers->>'note',
    coalesce(p_answers->>'cvConsent' in ('true','Yes','1'),false))
  returning id,reference into rid,ref;

  insert into public.registration_wellbeing values(rid,p_answers->>'diet',p_answers->>'allergy'='Yes*',p_answers->>'allergy-sp',
    p_answers->>'safety'='Yes*',p_answers->>'safety-sp',p_answers->>'ecName',regexp_replace(p_answers->>'ecPhone','[\s-]','','g'));

  if has_file then
    insert into public.registration_files(registration_id,storage_key,original_name,mime_type,size_bytes)
    select rid,o.name,left(p_file->>'original_name',255),o.metadata->>'mimetype',(o.metadata->>'size')::integer
    from storage.objects o where o.bucket_id='delegate-cvs' and o.name=p_file->>'storage_key';
  end if;

  insert into public.audit_events(actor_user_id,entity_type,entity_id,action) values(uid,'registration',rid,'submitted');
  return jsonb_build_object('id',rid,'reference',ref);
end $$;

commit;
