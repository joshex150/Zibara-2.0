'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);
CustomEase.create('hop', 'M0,0 C0.22,0.3 0.18,0.82 0.38,0.94 0.58,1.02 0.78,1 1,1');
CustomEase.create('zibaraOut', 'M0,0 C0.76,0 0.24,1 1,1');

interface PreloaderProps {
  onComplete?: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const rootRef    = useRef<HTMLDivElement>(null);
  const barRef     = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const counterRef = useRef<HTMLSpanElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const hasCompletedRef = useRef(false);

  const wordmark = 'ZIBARASTUDIO';

  useLayoutEffect(() => {
    const root    = rootRef.current;
    const bar     = barRef.current;
    const counter = counterRef.current;
    const tagline = taglineRef.current;
    if (!root || !bar) return;

    const letters = lettersRef.current.filter(Boolean) as HTMLSpanElement[];
    let exitTl: gsap.core.Timeline | null = null;
    let isCancelled = false;

    hasCompletedRef.current = false;

    const complete = () => {
      if (isCancelled || hasCompletedRef.current) return;
      hasCompletedRef.current = true;
      root.style.display = 'none';
      onComplete?.();
    };

    root.style.display = 'flex';
    root.style.opacity = '1';
    gsap.set(letters, { y: '115%', rotation: 0.001 });
    gsap.set(bar,     { scaleX: 0 });
    gsap.set(tagline, { opacity: 0, y: 8 });
    gsap.set(counter, { opacity: 1 });

    const tl = gsap.timeline({
      onComplete: () => {
        if (isCancelled) return;

        exitTl = gsap.timeline({
          onComplete: complete,
        })
        .to(letters, {
          y: '-115%',
          duration: 1.1,
          ease: 'zibaraOut',
          stagger: 0.04,
        })
        .to([tagline, counter], {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
        }, 0)
        .to(root, {
          opacity: 0,
          duration: 0.9,
          ease: 'power2.inOut',
        }, 0.4);
      },
    });

    tl.to(bar, {
      scaleX: 1,
      duration: 3.8,
      ease: 'power2.inOut',
    })
    .to(letters, {
      y: '0%',
      duration: 1.6,
      ease: 'hop',
      stagger: 0.085,
    }, 0.4)
    .to(tagline, {
      opacity: 1,
      y: 0,
      duration: 1.0,
      ease: 'power3.out',
    }, 1.1)
    .to(counter, {
      textContent: '100',
      duration: 3.6,
      ease: 'power2.inOut',
      snap: { textContent: 1 },
      modifiers: {
        textContent: (v: string) => `${Math.round(Number(v)).toString().padStart(3, '0')}`,
      },
    }, 0.2)
    .to({}, { duration: 0.9 });

    return () => {
      isCancelled = true;
      tl.kill();
      exitTl?.kill();
      gsap.killTweensOf([root, bar, tagline, counter, ...letters]);
      root.style.removeProperty('display');
      root.style.removeProperty('opacity');
    };
  }, [onComplete]);

  return (
    <div
      ref={rootRef}
      id="zibara-preloader"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#030303',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '2rem',
        overflow: 'hidden',
      }}
    >
      <span
        ref={counterRef}
        style={{
          position: 'absolute',
          bottom: '2rem',
          right: '2rem',
          fontFamily: 'var(--font-space-mono), monospace',
          fontSize: '11px',
          letterSpacing: '0.3em',
          color: 'rgba(239,239,201,0.55)',
        }}
      >
        000
      </span>

      <div
        style={{
          overflow: 'hidden',
          display: 'flex',
          gap: '0.05em',
        }}
      >
        {wordmark.split('').map((char, i) => (
          <span
            key={i}
            ref={(el) => { lettersRef.current[i] = el; }}
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: 'clamp(1.8rem, 6vw, 5.5rem)',
              fontWeight: 300,
              letterSpacing: '0.18em',
              color: '#EFEFC9',
              transform: 'translateY(115%)',
              willChange: 'transform',
            }}
          >
            {char}
          </span>
        ))}
      </div>

      <p
        ref={taglineRef}
        style={{
          fontFamily: 'var(--font-space-mono), monospace',
          fontSize: '10px',
          letterSpacing: '0.5em',
          color: 'rgba(239,239,201,0.55)',
          textTransform: 'uppercase',
          opacity: 0,
          transform: 'translateY(8px)',
          willChange: 'transform, opacity',
        }}
      >
        For nights that matter
      </p>

      <div
        ref={barRef}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '1px',
          width: '100%',
          background: 'rgba(239,239,201,0.55)',
          transformOrigin: 'left',
          transform: 'scaleX(0)',
        }}
      />
    </div>
  );
}
