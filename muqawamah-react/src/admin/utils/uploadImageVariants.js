import { supabaseClient } from '../../lib/supabaseClient';
import { MEDIA_BUCKET, ensurePublicImageUrl } from '../../lib/storage';
import { compressImage } from '../../components/shared/registration/utils/imageCompression';

/**
 * Upload an image + thumbnail variants to Supabase Storage and return the public URL of the original.
 * Variants are stored by inserting suffixes before the extension:
 * - {name}.webp
 * - {name}_thumb.webp
 * - {name}_card.webp (optional)
 *
 * Paths are unique per upload (timestamp) so admins can "change image" without needing overwrite permissions.
 */
export async function uploadImageVariants({
  entityType,
  entityId,
  file,
  withCard = false,
  bucket = MEDIA_BUCKET
}) {
  if (!file) throw new Error('No file selected');
  if (!entityType || !entityId) throw new Error('Missing entityType/entityId');

  // Ensure the user is logged in (storage insert policy requires authenticated)
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) throw new Error('You must be logged in to upload images');

  const ts = Date.now();
  const baseDir = `admin/${entityType}/${entityId}`;
  const baseName = `${ts}`;

  // Create WebP variants in-browser (fast + consistent).
  const originalDataUrl = await compressImage(file, {
    maxWidth: 900,
    maxHeight: 900,
    quality: 0.86,
    outputFormat: 'image/webp'
  });

  const thumbDataUrl = await compressImage(file, {
    maxWidth: 240,
    maxHeight: 240,
    quality: 0.82,
    outputFormat: 'image/webp'
  });

  const cardDataUrl = withCard
    ? await compressImage(file, {
        maxWidth: 520,
        maxHeight: 650,
        quality: 0.86,
        outputFormat: 'image/webp'
      })
    : null;

  const originalPath = `${baseDir}/${baseName}.webp`;
  const thumbPath = `${baseDir}/${baseName}_thumb.webp`;
  const cardPath = withCard ? `${baseDir}/${baseName}_card.webp` : null;

  // Upload all (no overwrite; unique name per upload).
  const originalUrl = await ensurePublicImageUrl({
    value: originalDataUrl,
    bucket,
    path: originalPath,
    upsert: false
  });
  await ensurePublicImageUrl({
    value: thumbDataUrl,
    bucket,
    path: thumbPath,
    upsert: false
  });
  if (withCard && cardPath && cardDataUrl) {
    await ensurePublicImageUrl({
      value: cardDataUrl,
      bucket,
      path: cardPath,
      upsert: false
    });
  }

  return { originalUrl, originalPath, thumbPath, cardPath };
}


