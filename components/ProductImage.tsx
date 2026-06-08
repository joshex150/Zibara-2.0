'use client';

import { useState } from 'react';
import ZibaraPlaceholder from './ZibaraPlaceholder';

type Tone = 'espresso' | 'crimson' | 'olive' | 'deep';
type Variant = 'hero' | 'default' | 'compact';

interface ProductImageProps {
  src?: string;
  name: string;
  sublabel?: string;
  tone?: Tone;
  variant?: Variant;
  className?: string;
}

const TONE_CYCLE: Tone[] = ['espresso', 'crimson', 'deep', 'olive'];

export function pickTone(key: string): Tone {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return TONE_CYCLE[Math.abs(hash) % TONE_CYCLE.length];
}

// Cloudinary stores full-resolution originals. Without a transform the browser
// downloads the multi-MB source even for a 64px thumbnail, so we insert a
// width/quality/format transform sized to how the image is actually displayed.
const VARIANT_WIDTH: Record<Variant, number> = {
  hero: 1400,
  default: 900,
  compact: 400,
};

export function optimizeImageSrc(src: string, variant: Variant): string {
  if (!src.includes('res.cloudinary.com') || !src.includes('/image/upload/')) {
    return src;
  }

  const uploadSegment = '/image/upload/';
  const uploadIndex = src.indexOf(uploadSegment);
  const afterUpload = src.substring(uploadIndex + uploadSegment.length);
  const firstSegment = afterUpload.split('/')[0];

  // Only transform a plain delivery URL (first segment is the version or the
  // public id itself). If a transform segment is already present, leave it.
  const hasExistingTransform =
    firstSegment.includes(',') || /^[a-z]{1,3}_/.test(firstSegment);
  if (hasExistingTransform) return src;

  const width = VARIANT_WIDTH[variant];
  return src.replace(
    uploadSegment,
    `${uploadSegment}w_${width},c_limit,q_auto,f_auto/`,
  );
}

export default function ProductImage({
  src,
  name,
  sublabel,
  tone,
  variant = 'default',
  className = '',
}: ProductImageProps) {
  const [brokenSrc, setBrokenSrc] = useState<string>();
  const isBroken = Boolean(src && brokenSrc === src);

  const isStub =
    isBroken ||
    !src ||
    src.trim() === '' ||
    src.includes('placehold.co') ||
    src.startsWith('zibara://');

  if (isStub) {
    return (
      <ZibaraPlaceholder
        label={name}
        sublabel={sublabel ?? 'ZIBARASTUDIO'}
        tone={tone ?? pickTone(name)}
        variant={variant}
        className={className}
      />
    );
  }

  return (
    <img
      src={optimizeImageSrc(src!, variant)}
      alt={name}
      loading="lazy"
      decoding="async"
      onError={() => setBrokenSrc(src)}
      className={`${className} object-cover object-center`}
    />
  );
}
