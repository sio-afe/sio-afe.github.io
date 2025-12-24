# Supabase Storage Cleanup (Unused Images)

This repo provides **two** ways to find (and optionally delete) unused images from your Supabase Storage bucket:

1) **Admin UI (recommended)**: `Muqawamah Admin → Utilities → Storage Cleanup (Unused Images)`  
2) **CLI script (fallback)**: `muqawamah-react/scripts/find-unused-storage-images.mjs`

## 1) Admin UI (Edge Function)

The Admin UI runs an Edge Function called `storage-unused`. This is required because listing/deleting Storage objects needs **service-role** permissions (never expose this key in the browser).

### Deploy the function

From the repo root:

```bash
supabase functions deploy storage-unused
```

### Set required secrets

In your Supabase project (Dashboard → Edge Functions → Secrets) set:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_MEDIA_BUCKET` (optional, defaults to `muqawamah-media`)
- `MUQAWAMAH_SUPER_ADMIN_EMAILS` (optional, comma-separated; defaults to `admin@sio-abulfazal.org`)
- `MUQAWAMAH_ALLOWED_ORIGIN` (optional; defaults to `*`)

### Use it

In Admin → Utilities:

- Click **Scan Unused** to generate a safe report
- Review the list
- Click **Delete (capped)** to delete up to “Max delete” items

## 2) CLI script (fallback)

From `muqawamah-react/`:

```bash
npm run storage:unused
```

Optional flags:

- `--limit-per-table=5000`
- `--prefixes=legacy,admin`
- `--out=/tmp/unused.json`
- `--delete --max-delete=200` (dangerous)


