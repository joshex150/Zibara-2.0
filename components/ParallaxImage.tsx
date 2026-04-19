'use client';

import { useRef, useEffect } from 'react';
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

  useEffect(() => {
    const wrap = wrapRef.current;
    const media = mediaRef.current;
    if (!wrap || !media) return;

    gsap.set(media, { scale: 1.15, y: 0, opacity: 0, filter: 'blur(10px)' });

    const enter = gsap.to(media, {
      opacity: 1,
      filter: 'blur(0px)',
      duration: 1.6,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: wrap,
        start: 'top 95%',
        once: true,
      },
    });

    const parallax = gsap.to(media, {
      y: `${speed * 100}%`,
      ease: 'none',
      scrollTrigger: {
        trigger: wrap,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.8,
      },
    });

    return () => {
      enter.kill();
      parallax.kill();
    };
  }, [speed]);

  return (
    <div ref={wrapRef} className={`overflow-hidden ${className}`}>
      <div ref={mediaRef} className="w-full h-full will-change-transform">
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
