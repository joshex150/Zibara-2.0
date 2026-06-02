'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function RouteScrollReset() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (window.location.hash) return;

    let active = true;
    const reset = () => {
      if (active) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };

    reset();
    const frame = window.requestAnimationFrame(() => {
      reset();
      Promise.allSettled(document.getAnimations().map((animation) => animation.finished))
        .then(reset);
    });
    const timer = window.setTimeout(() => {
      reset();
    }, 500);

    return () => {
      active = false;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}
