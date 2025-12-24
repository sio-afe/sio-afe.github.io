import { toSupabaseRenderImageUrl } from './storage';

export const IMAGE_PRESETS = {
  // Small square crests/logos (tables, lists, headers)
  crestSm: { width: 64, height: 64, quality: 80, format: 'webp' },
  crestMd: { width: 96, height: 96, quality: 80, format: 'webp' },

  // Player thumbnails (cards, lists)
  playerCard: { width: 420, height: 525, quality: 75, format: 'webp' },
  playerAvatar: { width: 96, height: 96, quality: 80, format: 'webp' },

  // Match header crests
  matchCrest: { width: 110, height: 110, quality: 80, format: 'webp' }
};

export function imgUrl(url, preset) {
  if (!url) return url;
  // Supabase transforms are not reliable across all projects.
  // Keep this function as a "no-op or best-effort" transform; the UI should prefer `SmartImg`
  // for thumbnail variants and fallback behavior.
  if (!preset) return toSupabaseRenderImageUrl(url, { quality: 80, format: 'webp' });

  const opts = typeof preset === 'string' ? IMAGE_PRESETS[preset] : preset;
  if (!opts) return toSupabaseRenderImageUrl(url, { quality: 80, format: 'webp' });
  return toSupabaseRenderImageUrl(url, opts);
}


