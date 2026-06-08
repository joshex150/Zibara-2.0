'use client';

import { useEffect, useRef, useState, CSSProperties } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);
if (!CustomEase.get('zibaraReveal')) {
  CustomEase.create('zibaraReveal', 'M0,0 C0.22,0.01 0.11,1 1,1');
}

interface AnimatedHeadingProps {
  children: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4';
  className?: string;
  style?: CSSProperties;
  delay?: number;
  duration?: number;
  stagger?: number;
  direction?: 'up' | 'down';
  onScroll?: boolean;
  split?: boolean;
}

export default function AnimatedHeading({
  children,
  tag: Tag = 'h2',
  className = '',
  style,
  delay = 0,
  duration = 0.85,
  direction = 'up',
  onScroll = false,
}: AnimatedHeadingProps) {
  const ref = useRef<HTMLElement>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let io: IntersectionObserver | null = null;
    let tween: gsap.core.Tween | null = null;
    let setupFrame = 0;
    let firstReveal = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setupFrame = window.requestAnimationFrame(() => setInitialized(true));
      return () => {
        if (setupFrame) window.cancelAnimationFrame(setupFrame);
      };
    }

    const reveal = () => {
      if (tween) {
        tween.play();
        return;
      }

      tween = gsap.to(el, {
        y: 0,
        opacity: 1,
        duration,
        delay: firstReveal ? delay : 0,
        ease: 'zibaraReveal',
        force3D: true,
        overwrite: 'auto',
      });
      firstReveal = false;
    };

    const setup = () => {
      el.style.willChange = 'transform, opacity';
      gsap.set(el, {
        y: direction === 'up' ? 18 : -18,
        opacity: 0,
        force3D: true,
      });
      setInitialized(true);

      if (onScroll && 'IntersectionObserver' in window) {
        io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              // Reveal once, then stop observing. Reversing on exit makes the
              // text re-hide whenever the mobile address bar resizes the
              // viewport (which re-fires this observer), causing flicker and a
              // visible dark gap. Play-once keeps it stable after first reveal.
              reveal();
              io?.disconnect();
              io = null;
            });
          },
          // Positive bottom margin reveals slightly *before* the element enters
          // the viewport, so a fast scroll never lands on the empty (still
          // hidden) section below the hero.
          { rootMargin: '0px 0px 12% 0px', threshold: 0 },
        );
        io.observe(el);
      } else {
        reveal();
      }
    };

    setupFrame = window.requestAnimationFrame(setup);

    return () => {
      if (setupFrame) window.cancelAnimationFrame(setupFrame);
      io?.disconnect();
      tween?.kill();
      gsap.set(el, { clearProps: 'transform,opacity,willChange' });
    };
  }, [children, delay, duration, direction, onScroll]);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={className}
      style={{ ...style, visibility: initialized ? style?.visibility : 'hidden' }}
    >
      {children}
    </Tag>
  );
}
