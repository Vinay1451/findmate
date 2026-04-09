-- Create public storage bucket for item images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'item-images',
  'item-images',
  true,
  10485760,  -- 10MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set public = true;

-- Allow anyone to read (public bucket)
create policy "Public read item images"
  on storage.objects for select
  using (bucket_id = 'item-images');

-- Authenticated users can upload
create policy "Auth users upload item images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'item-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own images
create policy "Users delete own item images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'item-images' and auth.uid()::text = (storage.foldername(name))[1]);
