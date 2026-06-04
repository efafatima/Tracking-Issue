-- Supabase Storage setup for complaint attachments.
-- Run this in Supabase SQL Editor after schema.sql.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'complaint-attachments',
  'complaint-attachments',
  true,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Authenticated users can upload complaint attachments" on storage.objects;
create policy "Authenticated users can upload complaint attachments" on storage.objects
for insert to authenticated
with check (bucket_id = 'complaint-attachments');

drop policy if exists "Anyone can read complaint attachments" on storage.objects;
create policy "Anyone can read complaint attachments" on storage.objects
for select
using (bucket_id = 'complaint-attachments');

drop policy if exists "Authenticated users can update own complaint attachments" on storage.objects;
create policy "Authenticated users can update own complaint attachments" on storage.objects
for update to authenticated
using (bucket_id = 'complaint-attachments')
with check (bucket_id = 'complaint-attachments');

drop policy if exists "Authenticated users can delete complaint attachments" on storage.objects;
create policy "Authenticated users can delete complaint attachments" on storage.objects
for delete to authenticated
using (bucket_id = 'complaint-attachments');
