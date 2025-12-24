import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// This copy of the migration script lives inside muqawamah-react so it can use
// muqawamah-react/node_modules (no need to install deps at repo root).

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from:
// - muqawamah-react/.env (most common when you run from muqawamah-react/)
// - repo-root .env (also supported)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const BUCKET = process.env.SUPABASE_MEDIA_BUCKET || 'muqawamah-media';

if (!SUPABASE_URL) {
  console.error('Missing SUPABASE_URL in environment');
  process.exit(1);
}
if (!SUPABASE_SERVICE_KEY) {
  console.error(
    'Missing SUPABASE_SERVICE_ROLE_KEY (recommended) or SUPABASE_SERVICE_KEY in environment'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

function isImageDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:image/');
}

function parseDataUrlToBuffer(dataUrl) {
  const [meta, base64] = String(dataUrl).split(',');
  if (!meta || !base64) throw new Error('Invalid data URL');

  const match = meta.match(/^data:([^;]+);base64$/);
  const contentType = match?.[1] || 'application/octet-stream';

  const buffer = Buffer.from(base64, 'base64');

  let ext = 'bin';
  if (contentType === 'image/webp') ext = 'webp';
  else if (contentType === 'image/png') ext = 'png';
  else if (contentType === 'image/jpeg') ext = 'jpg';
  else if (contentType === 'image/jpg') ext = 'jpg';

  return { buffer, contentType, ext };
}

async function uploadAndGetPublicUrl({ objectPath, dataUrl }) {
  const { buffer, contentType } = parseDataUrlToBuffer(dataUrl);

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(objectPath, buffer, {
    contentType,
    cacheControl: '31536000',
    upsert: true
  });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
  return data?.publicUrl || null;
}

async function migrateTableColumn({ table, idColumn = 'id', imageColumn, pathPrefix }) {
  console.log(`\n== Migrating ${table}.${imageColumn} -> storage://${BUCKET}/${pathPrefix}/... ==`);

  const pageSize = 500;
  let from = 0;
  let totalMigrated = 0;
  let totalScanned = 0;

  while (true) {
    const { data: rows, error } = await supabase
      .from(table)
      .select(`${idColumn}, ${imageColumn}`)
      .range(from, from + pageSize - 1);

    if (error) {
      console.warn(`Skipping ${table}.${imageColumn} due to error:`, error.message);
      return { migrated: totalMigrated, scanned: totalScanned, skipped: true };
    }

    if (!rows || rows.length === 0) break;

    for (const row of rows) {
      totalScanned += 1;
      const id = row?.[idColumn];
      const value = row?.[imageColumn];

      if (!id || !isImageDataUrl(value)) continue;

      try {
        const { ext } = parseDataUrlToBuffer(value);
        const objectPath = `${pathPrefix}/${id}.${ext}`;
        const publicUrl = await uploadAndGetPublicUrl({ objectPath, dataUrl: value });
        if (!publicUrl) throw new Error('Failed to get public URL');

        const { error: updateError } = await supabase
          .from(table)
          .update({ [imageColumn]: publicUrl })
          .eq(idColumn, id);

        if (updateError) throw updateError;

        totalMigrated += 1;
        if (totalMigrated % 25 === 0) console.log(`Migrated ${totalMigrated} images so far...`);
      } catch (e) {
        console.error(
          `Failed migrating ${table}.${imageColumn} for ${idColumn}=${id}:`,
          e?.message || e
        );
      }
    }

    from += pageSize;
  }

  console.log(`Done: scanned=${totalScanned}, migrated=${totalMigrated}`);
  return { migrated: totalMigrated, scanned: totalScanned, skipped: false };
}

async function main() {
  console.log('Starting base64 -> Storage migration');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Bucket: ${BUCKET}`);

  await migrateTableColumn({
    table: 'team_registrations',
    imageColumn: 'team_logo',
    pathPrefix: 'legacy/team_registrations/team_logo'
  });
  await migrateTableColumn({
    table: 'team_players',
    imageColumn: 'player_image',
    pathPrefix: 'legacy/team_players/player_image'
  });
  await migrateTableColumn({
    table: 'teams',
    imageColumn: 'crest_url',
    pathPrefix: 'legacy/teams/crest_url'
  });
  await migrateTableColumn({
    table: 'players',
    imageColumn: 'player_image',
    pathPrefix: 'legacy/players/player_image'
  });

  console.log('\nMigration complete.');
}

main().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});


