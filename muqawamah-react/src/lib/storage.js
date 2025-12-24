import { supabaseClient } from './supabaseClient';

// Change this to whatever bucket name you create in Supabase Storage.
export const MEDIA_BUCKET = 'muqawamah-media';

export function shouldUseSupabaseImageTransforms() {
  // Supabase "render/image" is not available on all projects/plans.
  // Default OFF to avoid breaking images; enable explicitly in Vite env when verified.
  try {
    const v = import.meta?.env?.VITE_SUPABASE_IMAGE_TRANSFORMS;
    return String(v).toLowerCase() === 'true';
  } catch {
    return false;
  }
}

export function isDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:');
}

export function isImageDataUrl(value) {
  return isDataUrl(value) && value.startsWith('data:image/');
}

export function sanitizePathSegment(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);
}

export function dataUrlToBlob(dataUrl) {
  const [meta, base64] = String(dataUrl).split(',');
  if (!meta || !base64) {
    throw new Error('Invalid data URL');
  }
  const match = meta.match(/^data:([^;]+);base64$/);
  const contentType = match?.[1] || 'application/octet-stream';

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { blob: new Blob([bytes], { type: contentType }), contentType };
}

/**
 * Uploads an image data URL to Supabase Storage and returns a public URL.
 * If `value` is already a URL/path (not a data URL), it is returned unchanged.
 */
export async function ensurePublicImageUrl({
  value,
  bucket = MEDIA_BUCKET,
  path,
  cacheControl = '31536000',
  upsert = true
}) {
  if (!value) return null;
  if (!isImageDataUrl(value)) return value;
  if (!path) throw new Error('ensurePublicImageUrl requires a storage path');

  const { blob, contentType } = dataUrlToBlob(value);
  const uploadRes = await supabaseClient.storage.from(bucket).upload(path, blob, {
    contentType,
    cacheControl,
    upsert
  });

  if (uploadRes.error) throw uploadRes.error;

  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || null;
}

/**
 * Build a Supabase Image Transformation URL for fast thumbnails.
 * Input can be either:
 * - a public object URL: .../storage/v1/object/public/{bucket}/{path}
 * - or a plain public URL for non-supabase images (it will be returned as-is)
 */
export function toSupabaseRenderImageUrl(url, { width, height, quality = 80, format = 'webp' } = {}) {
  if (!url || typeof url !== 'string') return url;
  if (!shouldUseSupabaseImageTransforms()) return url;

  const marker = '/storage/v1/object/public/';
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  const after = url.slice(idx + marker.length); // "{bucket}/{path...}"
  const [bucket, ...pathParts] = after.split('/');
  const path = pathParts.join('/');
  if (!bucket || !path) return url;

  const base = url.slice(0, idx); // "https://xxx.supabase.co"
  // IMPORTANT: URL-encode the path part so spaces/special chars don't break.
  // Keep slashes but encode each segment.
  const encodedPath = path
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');
  const renderBase = `${base}/storage/v1/render/image/public/${bucket}/${encodedPath}`;

  const params = new URLSearchParams();
  if (width) params.set('width', String(width));
  if (height) params.set('height', String(height));
  if (quality) params.set('quality', String(quality));
  if (format) params.set('format', String(format));

  const qs = params.toString();
  return qs ? `${renderBase}?${qs}` : renderBase;
}


