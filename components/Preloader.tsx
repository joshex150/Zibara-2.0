'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);
CustomEase.create('hop', 'M0,0 C0.22,0.3 0.18,0.82 0.38,0.94 0.58,1.02 0.78,1 1,1');
CustomEase.create('zibaraOut', 'M0,0 C0.76,0 0.24,1 1,1');

interface PreloaderProps {
  onComplete?: () => void;
}

const INTRO_DURATION_MS = 4000;
const INTRO_FALLBACK_MS = INTRO_DURATION_MS + 750;

export default function Preloader({ onComplete }: PreloaderProps) {
  const rootRef    = useRef<HTMLDivElement>(null);
  const barRef     = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const counterRef = useRef<HTMLSpanElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const onCompleteRef = useRef(onComplete);

  const wordmark = 'ZIBARASTUDIO';

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useLayoutEffect(() => {
    const root    = rootRef.current;
    const bar     = barRef.current;
    const counter = counterRef.current;
    const tagline = taglineRef.current;
    if (!root || !bar) return;

    const letters = lettersRef.current.filter(Boolean) as HTMLSpanElement[];

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      onCompleteRef.current?.();
    };

    const ctx = gsap.context(() => {
      gsap.set(letters, { y: '115%', rotation: 0.001 });
      gsap.set(bar,     { scaleX: 0 });
      gsap.set(tagline, { opacity: 0, y: 8 });
      gsap.set(counter, { opacity: 1 });

      const tl = gsap.timeline({ onComplete: finish });

      tl.to(bar, {
        scaleX: 1,
        duration: 3.0,
        ease: 'power2.inOut',
      })
      .to(letters, {
        y: '0%',
        duration: 1.05,
        ease: 'hop',
        stagger: 0.055,
      }, 0.25)
      .to(tagline, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: 'power3.out',
      }, 0.9)
      .to(counter, {
        textContent: '100',
        duration: 3.0,
        ease: 'power2.inOut',
        snap: { textContent: 1 },
        modifiers: {
          textContent: (v: string) => `${Math.round(Number(v)).toString().padStart(3, '0')}`,
        },
      }, 0.15)
      .to([tagline, counter], {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.out',
      }, 3.05)
      .to(letters, {
        y: '-115%',
        duration: 0.65,
        ease: 'zibaraOut',
        stagger: 0.025,
      }, 3.05)
      .to(root, {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.inOut',
      }, 3.65);
    }, root);

    const fallbackTimer = window.setTimeout(() => {
      if (finished) return;

      gsap.killTweensOf([letters, tagline, counter, bar, root]);
      gsap.to(root, {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.out',
        onComplete: finish,
      });
    }, INTRO_FALLBACK_MS);

    return () => {
      window.clearTimeout(fallbackTimer);
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      ctx.revert();
    };
  }, []);

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
