'use client';

import { useEffect, useRef, useState, ElementType } from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

const inheritTextStyles = (node: HTMLElement) => {
  node.style.fontFamily = 'inherit';
  node.style.fontSize = 'inherit';
  node.style.fontWeight = 'inherit';
  node.style.letterSpacing = 'inherit';
  node.style.textTransform = 'inherit';
};

interface AnimatedTextProps {
  children: string;
  tag?: ElementType;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  onScroll?: boolean;
}

let idCounter = 0;

export default function AnimatedText({
  children,
  tag: Tag = 'p',
  className = '',
  delay = 0,
  duration = 1.3,
  stagger = 0.06,
  onScroll = true,
}: AnimatedTextProps) {
  const ref = useRef<HTMLElement>(null);
  const uid = useRef(`zibara-text-${++idCounter}`).current;
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    setInitialized(false);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setInitialized(true);
      return;
    }

    let split: SplitType | null = null;
    let io: IntersectionObserver | null = null;
    let animation: gsap.core.Tween | null = null;
    let innerNodes: HTMLElement[] = [];
    let resizeFrame = 0;
    let splitWidth = 0;
    let setupFrame = 0;
    let firstReveal = true;

    const restoreResponsiveText = () => {
      if (!split) return;
      io?.disconnect();
      io = null;
      animation?.kill();
      animation = null;
      split.revert();
      split = null;
      innerNodes = [];
      setInitialized(true);
    };

    const handleResize = () => {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = 0;
        if (!split) return;

        const nextWidth = el.getBoundingClientRect().width;
        if (Math.abs(nextWidth - splitWidth) > 1) restoreResponsiveText();
      });
    };

    const reveal = () => {
      if (animation) {
        animation.play();
        return;
      }

      animation = gsap.to(innerNodes, {
        y: '0%',
        opacity: 1,
        filter: 'blur(0px)',
        stagger,
        delay: firstReveal ? delay : 0,
        duration,
        ease: 'power3.out',
        force3D: true,
        overwrite: 'auto',
      });
      firstReveal = false;
    };

    const setup = () => {
      try {
        const computedLH = window.getComputedStyle(el).lineHeight;
        split = new SplitType(el, { types: 'lines', lineClass: `zibara-text-line-${uid}` });

        split.lines?.forEach((line) => {
          const lineEl = line as HTMLElement;
          const inner = document.createElement('span');

          inner.className = `zibara-text-inner-${uid}`;
          inner.innerHTML = lineEl.innerHTML;
          inner.style.display = 'block';
          inner.style.willChange = 'transform, opacity, filter';
          inheritTextStyles(inner);

          lineEl.innerHTML = '';
          lineEl.style.overflow = 'clip';
          lineEl.style.display = 'block';
          lineEl.style.lineHeight = computedLH;
          lineEl.style.margin = '0';
          lineEl.style.padding = '0';
          inheritTextStyles(lineEl);
          lineEl.appendChild(inner);
        });

        innerNodes = Array.from(el.querySelectorAll<HTMLElement>(`.zibara-text-inner-${uid}`));
        if (!innerNodes.length) {
          setInitialized(true);
          return;
        }

        gsap.set(innerNodes, { y: '110%', opacity: 0, filter: 'blur(4px)', force3D: true });
        splitWidth = el.getBoundingClientRect().width;
        window.addEventListener('resize', handleResize, { passive: true });
        setInitialized(true);

        if (onScroll && 'IntersectionObserver' in window) {
          io = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                // Reveal once, then stop observing. Reversing on exit makes the
                // lines re-hide whenever the mobile address bar resizes the
                // viewport (which re-fires this observer), causing flicker and a
                // visible dark gap below the hero. Play-once keeps it stable.
                reveal();
                io?.disconnect();
                io = null;
              });
            },
            // Positive bottom margin reveals slightly *before* the element
            // enters the viewport, so a fast scroll never lands on the empty
            // (still hidden) section below the hero.
            { rootMargin: '0px 0px 12% 0px', threshold: 0 },
          );
          io.observe(el);
        } else {
          reveal();
        }
      } catch {
        split?.revert();
        split = null;
        setInitialized(true);
      }
    };

    setupFrame = window.requestAnimationFrame(setup);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      if (setupFrame) window.cancelAnimationFrame(setupFrame);
      io?.disconnect();
      animation?.kill();
      split?.revert();
    };
  }, [children, delay, duration, stagger, onScroll, uid]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ visibility: initialized ? undefined : 'hidden' }}
    >
      {children}
    </Tag>
  );
}
