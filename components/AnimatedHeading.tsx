'use client';

import { useEffect, useRef, useState, CSSProperties } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import SplitType from 'split-type';

gsap.registerPlugin(CustomEase);
if (!CustomEase.get('zibaraReveal')) {
  CustomEase.create('zibaraReveal', 'M0,0 C0.22,0.01 0.11,1 1,1');
}

const inheritTextStyles = (node: HTMLElement) => {
  node.style.fontFamily = 'inherit';
  node.style.fontSize = 'inherit';
  node.style.fontWeight = 'inherit';
  node.style.letterSpacing = 'inherit';
  node.style.textTransform = 'inherit';
};

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

let idCounter = 0;

export default function AnimatedHeading({
  children,
  tag: Tag = 'h2',
  className = '',
  style,
  delay = 0,
  duration = 0.9,
  stagger = 0.08,
  direction = 'up',
  onScroll = false,
}: AnimatedHeadingProps) {
  const ref = useRef<HTMLElement>(null);
  const uid = useRef(`zibara-head-${++idCounter}`).current;
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    setInitialized(false);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInitialized(true);
      return;
    }

    let split: SplitType | null = null;
    let io: IntersectionObserver | null = null;
    let tween: gsap.core.Tween | null = null;
    let innerNodes: HTMLElement[] = [];
    let setupFrame = 0;
    let resizeFrame = 0;
    let splitWidth = 0;

    const fromPercent = direction === 'up' ? 120 : -120;

    // A re-split is needed when the line breaks change (width change). The
    // mobile address bar only changes height, so this never fires mid-scroll.
    const restoreResponsive = () => {
      io?.disconnect();
      io = null;
      tween?.kill();
      tween = null;
      split?.revert();
      split = null;
      innerNodes = [];
      window.removeEventListener('resize', handleResize);
      setInitialized(true);
    };

    const handleResize = () => {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = 0;
        if (!split) return;
        const nextWidth = el.getBoundingClientRect().width;
        if (Math.abs(nextWidth - splitWidth) > 1) restoreResponsive();
      });
    };

    const reveal = () => {
      tween = gsap.to(innerNodes, {
        yPercent: 0,
        opacity: 1,
        duration,
        delay,
        stagger,
        ease: 'zibaraReveal',
        force3D: true,
        overwrite: 'auto',
      });
    };

    const setup = () => {
      try {
        const computedLH = window.getComputedStyle(el).lineHeight;
        split = new SplitType(el, { types: 'lines', lineClass: `zibara-head-line-${uid}` });

        split.lines?.forEach((line) => {
          const lineEl = line as HTMLElement;
          const inner = document.createElement('span');

          inner.className = `zibara-head-inner-${uid}`;
          inner.innerHTML = lineEl.innerHTML;
          inner.style.display = 'block';
          inner.style.willChange = 'transform, opacity';
          inheritTextStyles(inner);

          lineEl.innerHTML = '';
          // `clip` masks the sliding text. The vertical padding (cancelled by a
          // matching negative margin) keeps tight-leading display type from
          // having its ascenders/descenders clipped while still masking motion.
          lineEl.style.overflow = 'clip';
          lineEl.style.display = 'block';
          lineEl.style.lineHeight = computedLH;
          lineEl.style.padding = '0.12em 0';
          lineEl.style.margin = '-0.12em 0';
          inheritTextStyles(lineEl);
          lineEl.appendChild(inner);
        });

        innerNodes = Array.from(el.querySelectorAll<HTMLElement>(`.zibara-head-inner-${uid}`));
        if (!innerNodes.length) {
          setInitialized(true);
          return;
        }

        gsap.set(innerNodes, { yPercent: fromPercent, opacity: 0, force3D: true });
        splitWidth = el.getBoundingClientRect().width;
        window.addEventListener('resize', handleResize, { passive: true });
        setInitialized(true);

        if (onScroll && 'IntersectionObserver' in window) {
          io = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                // Reveal once, then stop observing so the heading doesn't
                // re-hide when the mobile address bar resizes the viewport.
                reveal();
                io?.disconnect();
                io = null;
              });
            },
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
      tween?.kill();
      split?.revert();
    };
  }, [children, delay, duration, stagger, direction, onScroll, uid]);

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
