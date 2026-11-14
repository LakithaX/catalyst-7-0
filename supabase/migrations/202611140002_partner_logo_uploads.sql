begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('partner-logos','partner-logos',true,2097152,array['image/png','image/jpeg','image/webp'])
on conflict(id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy partner_logo_upload on storage.objects for insert to authenticated
with check(bucket_id='partner-logos' and private.has_role(array['admin']) and (storage.foldername(name))[1]=auth.uid()::text);
create policy partner_logo_read on storage.objects for select to anon,authenticated
using(bucket_id='partner-logos');
commit;
notify pgrst,'reload schema';
