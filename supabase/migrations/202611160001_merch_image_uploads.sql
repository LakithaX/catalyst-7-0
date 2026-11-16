begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('merch-images','merch-images',true,5242880,array['image/png','image/jpeg','image/webp'])
on conflict(id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy merch_image_upload on storage.objects for insert to authenticated
with check(bucket_id='merch-images' and private.has_role(array['admin']) and (storage.foldername(name))[1]=auth.uid()::text);
create policy merch_image_read on storage.objects for select to anon,authenticated
using(bucket_id='merch-images');
commit;
notify pgrst,'reload schema';
