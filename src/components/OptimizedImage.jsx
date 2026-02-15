import React from 'react';

// OptimizedImage: use <picture> to serve AVIF/WebP with an img fallback.
// Props: src (required), alt (required), width, height, className, sizes, srcWebp, srcAvif
export default function OptimizedImage({
  src,
  srcWebp,
  srcAvif,
  alt,
  width,
  height,
  className = '',
  sizes,
  loading = 'lazy',
  ...props
}) {
  if (!src) return null;

  return (
    <picture>
      {srcAvif && <source srcSet={srcAvif} type="image/avif" />}
      {srcWebp && <source srcSet={srcWebp} type="image/webp" />}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        sizes={sizes}
        className={className}
        {...props}
      />
    </picture>
  );
}
