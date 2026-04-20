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

export default function ProductImage({
  src,
  name,
  sublabel,
  tone,
  variant = 'default',
  className = '',
}: ProductImageProps) {
  const [isBroken, setIsBroken] = useState(false);
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
      src={src}
      alt={name}
      loading="lazy"
      decoding="async"
      onError={() => setIsBroken(true)}
      className={`${className} object-cover object-center`}
    />
  );
}
