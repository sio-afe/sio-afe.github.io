import React, { useMemo, useState } from 'react';

function replaceSuffixBeforeExtension(url, suffix) {
  // Insert suffix before the last extension in the pathname.
  // Works for normal URLs and Supabase public URLs.
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/');
    const file = parts.pop() || '';
    const dot = file.lastIndexOf('.');
    if (dot === -1) return null;
    const nextFile = `${file.slice(0, dot)}${suffix}${file.slice(dot)}`;
    u.pathname = [...parts, nextFile].join('/');
    return u.toString();
  } catch {
    // Fallback for non-URL strings
    const dot = url.lastIndexOf('.');
    if (dot === -1) return null;
    return `${url.slice(0, dot)}${suffix}${url.slice(dot)}`;
  }
}

const VARIANT_SUFFIX = {
  crestSm: '_thumb',
  crestMd: '_thumb',
  matchCrest: '_thumb',
  playerAvatar: '_thumb',
  playerCard: '_card'
};

/**
 * SmartImg:
 * - If `src` is a Storage URL, it tries a smaller variant (like *_thumb.webp) first.
 * - On error (missing variant), it automatically falls back to the original `src`.
 *
 * This avoids relying on Supabase image transforms, while still enabling fast thumbnails.
 */
export default function SmartImg({
  src,
  alt = '',
  className,
  preset,
  loading = 'lazy',
  decoding = 'async',
  fetchpriority,
  style,
  ...rest
}) {
  const [useOriginal, setUseOriginal] = useState(false);

  const variantUrl = useMemo(() => {
    if (!src || typeof src !== 'string') return null;
    const suffix = preset ? VARIANT_SUFFIX[preset] : null;
    if (!suffix) return null;
    return replaceSuffixBeforeExtension(src, suffix);
  }, [src, preset]);

  const effectiveSrc = !useOriginal && variantUrl ? variantUrl : src;

  if (!src) return null;

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      fetchpriority={fetchpriority}
      style={style}
      onError={() => {
        if (!useOriginal) setUseOriginal(true);
      }}
      {...rest}
    />
  );
}


