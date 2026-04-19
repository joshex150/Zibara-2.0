'use client';

import { useRef, useEffect, CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger, CustomEase);
CustomEase.create('zibaraReveal', 'M0,0 C0.22,0.01 0.11,1 1,1');

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

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const split = new SplitType(el, { types: 'lines' });
    const lines = split.lines ?? [];

    lines.forEach((line) => {
      const inner = document.createElement('span');
      inner.style.display = 'block';
      inner.style.willChange = 'transform, opacity, filter';
      while (line.firstChild) inner.appendChild(line.firstChild);
      line.style.overflow = 'hidden';
      line.style.display = 'block';
      line.style.paddingBottom = '0.08em';
      line.appendChild(inner);

      gsap.set(inner, {
        yPercent: direction === 'up' ? 110 : -110,
        opacity: 0,
        filter: 'blur(6px)',
      });
    });

    const innerSpans = lines.map((l) => l.querySelector('span')!).filter(Boolean);

    const animate = () =>
      gsap.to(innerSpans, {
        yPercent: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration,
        delay,
        ease: 'zibaraReveal',
        stagger,
      });

    let trigger: ScrollTrigger | undefined;
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

    return () => {
      trigger?.kill();
      split.revert();
    };
  }, [children, delay, duration, stagger, direction, onScroll]);

  return (
    <Tag ref={ref as React.RefObject<HTMLHeadingElement>} className={className} style={style}>
      {children}
    </Tag>
  );
}
