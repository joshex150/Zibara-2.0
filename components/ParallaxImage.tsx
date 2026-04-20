'use client';

import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ZibaraPlaceholder from './ZibaraPlaceholder';

gsap.registerPlugin(ScrollTrigger);

interface ParallaxImageProps {
  src?: string;
  alt: string;
  className?: string;
  speed?: number;
  tone?: 'espresso' | 'crimson' | 'olive' | 'deep';
  sublabel?: string;
  variant?: 'hero' | 'default' | 'compact';
}

export default function ParallaxImage({
  alt,
  className = '',
  speed = 0.3,
  tone = 'espresso',
  sublabel = 'ZIBARASTUDIO',
  variant = 'hero',
}: ParallaxImageProps) {
  const wrapRef   = useRef<HTMLDivElement>(null);
  const mediaRef  = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const media = mediaRef.current;
    if (!wrap || !media) return;

    const glowLayers = media.querySelectorAll('.zibara-placeholder-glow, .zibara-placeholder-shimmer');
    const ringLayers = media.querySelectorAll('.zibara-placeholder-ring-primary, .zibara-placeholder-ring-secondary');
    const panel = media.querySelector('.zibara-placeholder-panel');
    const baseScale = 1.15;
    const yPercent = Math.max(10, Math.round(Math.abs(speed) * 24));

    const ctx = gsap.context(() => {
      gsap.set(media, { scale: baseScale, yPercent: -Math.round(yPercent * 0.32) });
      gsap.set(glowLayers, { yPercent: -8, scale: 1.08, transformOrigin: 'center center' });
      gsap.set(ringLayers, { yPercent: 4, rotation: -2, transformOrigin: 'center center' });
      gsap.set(panel, { yPercent: 3 });

      gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.7,
        },
      })
        .to(media, {
          yPercent,
          ease: 'none',
        }, 0)
        .to(glowLayers, {
          yPercent: -Math.round(yPercent * 0.55),
          scale: 1.14,
          ease: 'none',
          stagger: 0.02,
        }, 0)
        .to(ringLayers, {
          yPercent: Math.round(yPercent * 0.35),
          rotation: 4,
          ease: 'none',
          stagger: 0.02,
        }, 0)
        .to(panel, {
          yPercent: -Math.round(yPercent * 0.18),
          ease: 'none',
        }, 0);
    }, wrap);

    return () => ctx.revert();
  }, [speed]);

  return (
    <div ref={wrapRef} className={`overflow-hidden ${className}`}>
      <div ref={mediaRef} className="w-full h-full will-change-transform origin-center">
        <ZibaraPlaceholder
          label={alt}
          sublabel={sublabel}
          tone={tone}
          variant={variant}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
