'use client';

import { useRef, useLayoutEffect, CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger, CustomEase);
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
}

export default function AnimatedHeading({
  children,
  tag: Tag = 'h2',
  className = '',
  style,
  delay = 0,
  duration = 1.6,
  stagger = 0.11,
  direction = 'up',
  onScroll = false,
}: AnimatedHeadingProps) {
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
        line.style.paddingBottom = '0.08em';
        line.setAttribute('aria-hidden', 'true');
        line.appendChild(inner);
        gsap.set(inner, {
          yPercent: direction === 'up' ? 110 : -110,
          opacity: 0,
          filter: 'blur(6px)',
        });
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
          ease: 'zibaraReveal',
          stagger,
        });
      };

      if (onScroll) {
        trigger = ScrollTrigger.create({
          trigger: el,
          start: 'top 86%',
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
  }, [children, delay, duration, stagger, direction, onScroll]);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={className}
      style={style}
    >
      {children}
    </Tag>
  );
}
