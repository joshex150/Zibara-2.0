'use client';

import { useRef, useEffect, ElementType } from 'react';
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
      line.style.paddingBottom = '0.1em';
      line.appendChild(inner);
      gsap.set(inner, { yPercent: 105, opacity: 0, filter: 'blur(4px)' });
    });

    const innerSpans = lines.map((l) => l.querySelector('span')!).filter(Boolean);

    const animate = () =>
      gsap.to(innerSpans, {
        yPercent: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration,
        delay,
        ease: 'power3.out',
        stagger,
      });

    let trigger: ScrollTrigger | undefined;
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

    return () => {
      trigger?.kill();
      split.revert();
    };
  }, [children, delay, duration, stagger, onScroll]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
