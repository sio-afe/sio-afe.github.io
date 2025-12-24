# Supabase Storage setup (Muqawamah images)

This repo was previously storing images as **base64 strings in Postgres** (e.g. `team_registrations.team_logo`, `team_players.player_image`). That makes pages slow because the DB response becomes huge.

The code is now set up to upload images to **Supabase Storage** and store only **public URLs** in the DB.

## 1) Create a bucket

In Supabase Dashboard:

- Storage → Buckets → **New bucket**
- Name: `muqawamah-media` (or change `MEDIA_BUCKET` in `muqawamah-react/src/lib/storage.js`)
- Public: **ON**

## 2) Add Storage policies (SQL)

**Important**: don’t paste this markdown file into the SQL editor (that’s why you saw `syntax error at or near "#"`)

Instead, open and run:

- `docs/supabase_storage_policies.sql`

## 2.1) Set env vars for migration script (server-side)

The base64 migration script (`scripts/migrate-base64-images-to-storage.mjs`) reads these env vars:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_MEDIA_BUCKET` (set to `muqawamah-media`)

I added a template you can copy:

- `env.example` → copy to `.env` (root of repo)

Run the migration script from the repo root:

- `node scripts/migrate-base64-images-to-storage.mjs`

Or, if you're currently in `muqawamah-react/`, run:

- `node ../scripts/migrate-base64-images-to-storage.mjs`

If you don't have dependencies installed at the repo root, run the copy inside `muqawamah-react/` instead:

- `node scripts/migrate-base64-images-to-storage.mjs`

Notes:

- If you prefer admins-only uploads, restrict the `insert/update/delete` policies further.
- Public read is required if you want simple `<img src="...public...">` URLs without signed URLs.

## 3) What gets stored where

Uploads go to paths like:

- `registrations/{teamId}/team_logo.webp`
- `registrations/{teamId}/players/{stableId}.webp`
- `registrations/{teamId}/payment_screenshot.webp`

DB fields will store the **public URL** returned by Supabase Storage.


