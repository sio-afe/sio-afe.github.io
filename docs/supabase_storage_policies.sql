-- Supabase Storage policies for bucket: muqawamah-media
-- Paste this into Supabase Dashboard -> SQL Editor and run.
--
-- If you changed the bucket name, replace 'muqawamah-media' everywhere below.

-- NOTE:
-- Supabase already manages RLS on `storage.objects`. On some projects/roles you may see:
--   ERROR: 42501: must be owner of table objects
-- If you see that, it's usually because ALTER TABLE requires table ownership.
-- You can safely skip ALTER TABLE here and just create the policies below.

-- Idempotent policy creation (drop then create).
drop policy if exists "public read muqawamah-media" on storage.objects;
create policy "public read muqawamah-media"
on storage.objects
for select
to public
using (bucket_id = 'muqawamah-media');

drop policy if exists "authenticated upload muqawamah-media" on storage.objects;
create policy "authenticated upload muqawamah-media"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'muqawamah-media');

drop policy if exists "authenticated update own muqawamah-media" on storage.objects;
create policy "authenticated update own muqawamah-media"
on storage.objects
for update
to authenticated
using (bucket_id = 'muqawamah-media' and owner = auth.uid())
with check (bucket_id = 'muqawamah-media' and owner = auth.uid());

drop policy if exists "authenticated delete own muqawamah-media" on storage.objects;
create policy "authenticated delete own muqawamah-media"
on storage.objects
for delete
to authenticated
using (bucket_id = 'muqawamah-media' and owner = auth.uid());


