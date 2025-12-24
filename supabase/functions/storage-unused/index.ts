import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('MUQAWAMAH_ALLOWED_ORIGIN') ?? '*',
  // Note: our frontend Supabase client adds `x-application-name` (see `src/lib/supabaseClient.js`),
  // so we must allow it here or the browser will block preflight.
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const DEFAULT_BUCKET = Deno.env.get('SUPABASE_MEDIA_BUCKET') ?? 'muqawamah-media';

const SUPER_ADMIN_EMAILS = (Deno.env.get('MUQAWAMAH_SUPER_ADMIN_EMAILS') ?? 'admin@sio-abulfazal.org')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

type Body = {
  bucket?: string;
  prefixes?: string[];
  limitPerTable?: number;
  dryRun?: boolean;
  maxReturn?: number;
  maxDelete?: number;
  confirm?: string;
};

function parseStoragePublicUrl(url: unknown) {
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

function insertSuffixBeforeExtension(name: string, suffix: string) {
  const lastSlash = name.lastIndexOf('/');
  const file = lastSlash >= 0 ? name.slice(lastSlash + 1) : name;
  const dir = lastSlash >= 0 ? name.slice(0, lastSlash + 1) : '';
  const dot = file.lastIndexOf('.');
  if (dot === -1) return null;
  return `${dir}${file.slice(0, dot)}${suffix}${file.slice(dot)}`;
}

async function listAllObjects({
  supabase,
  bucket,
  prefixes
}: {
  supabase: ReturnType<typeof createClient>;
  bucket: string;
  prefixes: string[];
}) {
  const all: string[] = [];

  // Supabase Storage has no true folders; we traverse prefixes by listing and recursing into "folder-like" entries.
  async function walk(prefix: string) {
    let offset = 0;
    const limit = 1000;

    while (true) {
      const { data, error } = await supabase.storage.from(bucket).list(prefix, {
        limit,
        offset
      });
      if (error) throw error;
      if (!data || data.length === 0) break;

      for (const item of data) {
        const name = item?.name;
        if (!name) continue;
        const full = prefix ? `${prefix}/${name}` : name;

        // Heuristic: folders come back without an id.
        // For files, id usually exists.
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

  for (const p of prefixes) {
    const cleaned = String(p || '').replace(/^\/+|\/+$/g, '');
    await walk(cleaned);
  }

  return all;
}

async function fetchUsedObjectNames({
  supabase,
  bucket,
  limitPerTable
}: {
  supabase: ReturnType<typeof createClient>;
  bucket: string;
  limitPerTable: number;
}) {
  const used = new Set<string>();
  const otherBuckets = new Set<string>();

  const tables = [
    { table: 'team_registrations', column: 'team_logo' },
    { table: 'team_registrations', column: 'payment_screenshot' },
    { table: 'team_players', column: 'player_image' },
    { table: 'teams', column: 'crest_url' },
    { table: 'players', column: 'player_image' }
  ];

  for (const t of tables) {
    const { data, error } = await supabase.from(t.table).select(`id, ${t.column}`).limit(limitPerTable);
    if (error) {
      // don't fail the whole run if a table/column isn't present in some envs
      console.warn(`Skipping ${t.table}.${t.column}:`, error.message);
      continue;
    }

    for (const row of data || []) {
      const parsed = parseStoragePublicUrl((row as Record<string, unknown>)[t.column]);
      if (!parsed) continue;
      if (parsed.bucket !== bucket) {
        otherBuckets.add(parsed.bucket);
        continue;
      }

      used.add(parsed.name);
      const thumb = insertSuffixBeforeExtension(parsed.name, '_thumb');
      if (thumb) used.add(thumb);
      const card = insertSuffixBeforeExtension(parsed.name, '_card');
      if (card) used.add(card);
    }
  }

  return { used, otherBuckets };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ ok: false, error: 'Server not configured (missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const authHeader = req.headers.get('Authorization') ?? '';
    const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';
    if (!jwt) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing Authorization bearer token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const body = (await req.json().catch(() => ({}))) as Body;
    const bucket = body.bucket ?? DEFAULT_BUCKET;
    const prefixes = (body.prefixes && body.prefixes.length > 0) ? body.prefixes : ['legacy', 'admin'];
    const limitPerTable = Math.max(1, Math.min(body.limitPerTable ?? 5000, 20000));
    const dryRun = body.dryRun !== false;
    const maxReturn = Math.max(1, Math.min(body.maxReturn ?? 250, 2000));
    const maxDelete = Math.max(0, Math.min(body.maxDelete ?? 200, 2000));

    // Service client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // Verify requester is a super admin by email
    const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !userData?.user?.email) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid user token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    const email = userData.user.email.toLowerCase();
    if (!SUPER_ADMIN_EMAILS.includes(email)) {
      return new Response(JSON.stringify({ ok: false, error: 'Forbidden (not a super admin)' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const { used, otherBuckets } = await fetchUsedObjectNames({ supabase, bucket, limitPerTable });
    const all = await listAllObjects({ supabase, bucket, prefixes });

    const unused = all.filter((name) => !used.has(name));
    const unusedPreview = unused.slice(0, maxReturn);

    let deleted: string[] = [];
    if (!dryRun) {
      if (body.confirm !== 'DELETE') {
        return new Response(JSON.stringify({ ok: false, error: 'Deletion requires confirm=\"DELETE\"' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      const toDelete = unused.slice(0, maxDelete);
      if (toDelete.length > 0) {
        const { error: delError } = await supabase.storage.from(bucket).remove(toDelete);
        if (delError) throw delError;
        deleted = toDelete;
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        bucket,
        prefixes,
        adminEmail: email,
        limitPerTable,
        totalObjectsScanned: all.length,
        usedObjectsCount: used.size,
        unusedCount: unused.length,
        unusedPreview,
        otherBuckets: Array.from(otherBuckets),
        deletedCount: deleted.length,
        deleted
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error('storage-unused error:', error);
    return new Response(JSON.stringify({ ok: false, error: error?.message ?? String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});


