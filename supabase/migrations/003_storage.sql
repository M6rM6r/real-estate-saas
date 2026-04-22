-- ============================================================
-- Migration 003: Storage buckets
-- ============================================================

-- Avatars bucket (public read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars', 'avatars', true, 2097152,
  array['image/jpeg', 'image/png', 'image/webp']
);

-- Covers bucket (public read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'covers', 'covers', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
);

-- Media bucket (public read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
);

-- ─── Storage RLS ─────────────────────────────────────────────
-- Avatars: tenant can upload to their own folder
create policy "avatars_tenant_upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (
      select tenant_id::text from public.users where id = auth.uid()
    )
  );

create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_tenant_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (
      select tenant_id::text from public.users where id = auth.uid()
    )
  );

-- Covers
create policy "covers_tenant_upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'covers'
    and (storage.foldername(name))[1] = (
      select tenant_id::text from public.users where id = auth.uid()
    )
  );

create policy "covers_public_read"
  on storage.objects for select
  using (bucket_id = 'covers');

create policy "covers_tenant_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'covers'
    and (storage.foldername(name))[1] = (
      select tenant_id::text from public.users where id = auth.uid()
    )
  );

-- Media
create policy "media_tenant_upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = (
      select tenant_id::text from public.users where id = auth.uid()
    )
  );

create policy "media_public_read"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "media_tenant_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = (
      select tenant_id::text from public.users where id = auth.uid()
    )
  );
