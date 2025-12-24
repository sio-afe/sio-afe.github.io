import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

const args = new Set(process.argv.slice(2));
const DO_DELETE = args.has('--delete');

function parseArgInt(prefix, fallback) {
  const raw = process.argv.find((a) => a.startsWith(prefix));
  if (!raw) return fallback;
  const v = parseInt(raw.slice(prefix.length), 10);
  return Number.isFinite(v) ? v : fallback;
}

const LIMIT_PER_TABLE = parseArgInt('--limit-per-table=', 5000);
const MAX_DELETE = parseArgInt('--max-delete=', 500);
const PREFIXES =
  process.argv.find((a) => a.startsWith('--prefixes='))?.slice('--prefixes='.length)?.split(',').map((s) => s.trim()).filter(Boolean) ||
  ['legacy', 'admin'];
const OUTPUT_JSON = process.argv.find((a) => a.startsWith('--out='))?.slice('--out='.length) ||
  path.resolve(process.cwd(), `unused-storage-objects.${BUCKET}.json`);

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

function parseStoragePublicUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const marker = '/storage/v1/object/public/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const after = url.slice(idx + marker.length); // "{bucket}/{path...}"
  const [bucket, ...pathParts] = after.split('/');
  const name = pathParts.join('/');
  if (!bucket || !name) return null;
  return { bucket, name };
}

function insertSuffixBeforeExtension(name, suffix) {
  const lastSlash = name.lastIndexOf('/');
  const file = lastSlash >= 0 ? name.slice(lastSlash + 1) : name;
  const dir = lastSlash >= 0 ? name.slice(0, lastSlash + 1) : '';
  const dot = file.lastIndexOf('.');
  if (dot === -1) return null;
  return `${dir}${file.slice(0, dot)}${suffix}${file.slice(dot)}`;
}

async function fetchUsedObjectNames() {
  const used = new Set();
  const otherBuckets = new Set();

  const tables = [
    { table: 'team_registrations', column: 'team_logo' },
    { table: 'team_registrations', column: 'payment_screenshot' },
    { table: 'team_players', column: 'player_image' },
    { table: 'teams', column: 'crest_url' },
    { table: 'players', column: 'player_image' }
  ];

  for (const t of tables) {
    try {
      // Use simple limit to keep script quick; can be bumped via --limit-per-table=
      const { data, error } = await supabase.from(t.table).select(`id, ${t.column}`).limit(LIMIT_PER_TABLE);
      if (error) throw error;

      for (const row of data || []) {
        const url = row?.[t.column];
        const parsed = parseStoragePublicUrl(url);
        if (!parsed) continue;
        if (parsed.bucket !== BUCKET) {
          otherBuckets.add(parsed.bucket);
          continue;
        }

        // Keep originals
        used.add(parsed.name);

        // Keep variants used by SmartImg
        const thumb = insertSuffixBeforeExtension(parsed.name, '_thumb');
        if (thumb) used.add(thumb);
        const card = insertSuffixBeforeExtension(parsed.name, '_card');
        if (card) used.add(card);
      }
    } catch (e) {
      console.warn(`Skipping ${t.table}.${t.column}:`, e?.message || e);
    }
  }

  return { used, otherBuckets };
}

async function fetchAllBucketObjectNames() {
  const all = [];

  async function walk(prefix) {
    let offset = 0;
    const limit = 1000;
    const clean = String(prefix || '').replace(/^\/+|\/+$/g, '');

    while (true) {
      const { data, error } = await supabase.storage.from(BUCKET).list(clean, { limit, offset });
      if (error) throw error;
      if (!data || data.length === 0) break;

      for (const item of data) {
        const name = item?.name;
        if (!name) continue;
        const full = clean ? `${clean}/${name}` : name;
        const isFolder = !item.id;
        if (isFolder) {
          await walk(full);
        } else {
          all.push(full);
        }
      }

      if (data.length < limit) break;
      offset += limit;
    }
  }

  for (const p of PREFIXES) {
    await walk(p);
  }

  return all;
}

async function deleteObjects(names) {
  const chunkSize = 100;
  let deleted = 0;
  for (let i = 0; i < names.length; i += chunkSize) {
    const chunk = names.slice(i, i + chunkSize);
    const { error } = await supabase.storage.from(BUCKET).remove(chunk);
    if (error) throw error;
    deleted += chunk.length;
    console.log(`Deleted ${deleted}/${names.length}...`);
  }
}

async function main() {
  console.log('Storage cleanup report (unused images)');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Bucket: ${BUCKET}`);
  console.log(`Mode: ${DO_DELETE ? 'DELETE (dangerous)' : 'REPORT (safe)'}`);
  console.log(`Limit per table: ${LIMIT_PER_TABLE}`);
  console.log(`Prefixes: ${PREFIXES.join(', ')}`);

  const { used, otherBuckets } = await fetchUsedObjectNames();
  if (otherBuckets.size > 0) {
    console.warn(
      `Warning: found references to other buckets in DB (not processed): ${Array.from(otherBuckets).join(', ')}`
    );
  }
  console.log(`Used (including _thumb/_card variants): ${used.size}`);

  const all = await fetchAllBucketObjectNames();
  console.log(`Total objects in bucket: ${all.length}`);

  const unused = all.filter((name) => !used.has(name));
  console.log(`Unused candidates: ${unused.length}`);

  const report = {
    bucket: BUCKET,
    generatedAt: new Date().toISOString(),
    limitPerTable: LIMIT_PER_TABLE,
    totalObjects: all.length,
    usedObjects: used.size,
    unusedCount: unused.length,
    unused
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Wrote report: ${OUTPUT_JSON}`);

  if (DO_DELETE) {
    const toDelete = unused.slice(0, MAX_DELETE);
    console.log(`\nDeleting up to ${MAX_DELETE} objects (actual: ${toDelete.length})...`);
    if (toDelete.length === 0) {
      console.log('Nothing to delete.');
      return;
    }
    await deleteObjects(toDelete);
    console.log('Delete complete.');
    if (unused.length > toDelete.length) {
      console.log(
        `Note: ${unused.length - toDelete.length} more candidates remain. Re-run with a higher --max-delete=... if desired.`
      );
    }
  } else {
    console.log('\nNext step (optional): review the JSON report, then run:');
    console.log('  npm run storage:unused:delete');
    console.log('You can also cap deletions:');
    console.log('  node scripts/find-unused-storage-images.mjs --delete --max-delete=200');
  }
}

main().catch((e) => {
  console.error('Failed:', e?.message || e);
  process.exit(1);
});


