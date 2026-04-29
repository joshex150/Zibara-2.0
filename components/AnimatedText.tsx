'use client';

import { useRef, useLayoutEffect, ElementType } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedTextProps {
  children: string;
  tag?: ElementType;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  onScroll?: boolean;
}

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

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      el.style.opacity = '1';
      return;
    }

    let split: SplitType | null = null;
    let trigger: ScrollTrigger | undefined;
    let tween: gsap.core.Tween | undefined;

    try {
      split = new SplitType(el, { types: 'lines' });
      const lines = split.lines ?? [];
      if (!lines.length) {
        el.style.opacity = '1';
        return;
      }

      lines.forEach((line) => {
        const inner = document.createElement('span');
        inner.style.display = 'block';
        inner.style.willChange = 'transform, opacity, filter';
        inner.setAttribute('aria-hidden', 'true');
        while (line.firstChild) inner.appendChild(line.firstChild);
        line.style.overflow = 'hidden';
        line.style.display = 'block';
        line.style.paddingBottom = '0.1em';
        line.setAttribute('aria-hidden', 'true');
        line.appendChild(inner);
        gsap.set(inner, { yPercent: 105, opacity: 0, filter: 'blur(4px)' });
      });

      el.setAttribute('aria-label', children);
      el.style.opacity = '1';

      const innerSpans = lines
        .map((l) => l.querySelector('span'))
        .filter((s): s is HTMLSpanElement => !!s);

      const animate = () => {
        tween = gsap.to(innerSpans, {
          yPercent: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration,
          delay,
          ease: 'power3.out',
          stagger,
        });
      };

      if (onScroll) {
        trigger = ScrollTrigger.create({
          trigger: el,
          start: 'top 92%',
          onEnter: animate,
          once: true,
        });
      } else {
        animate();
      }
    } catch {
      el.style.opacity = '1';
    }

    return () => {
      tween?.kill();
      trigger?.kill();
      try {
        split?.revert();
      } catch {
        /* noop */
      }
    };
  }, [children, delay, duration, stagger, onScroll]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
