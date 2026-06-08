'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollTriggerRefresh() {
  const pathname = usePathname();

  useEffect(() => {
    const shouldResetScroll = !window.location.hash;

    if (shouldResetScroll) {
      ScrollTrigger.clearScrollMemory('manual');
    }

    const timer = window.setTimeout(() => {
      if (shouldResetScroll) {
        ScrollTrigger.clearScrollMemory('manual');
      }

      ScrollTrigger.refresh();

      if (shouldResetScroll) {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    }, 120);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    // Don't let ScrollTrigger auto-refresh when the mobile browser chrome
    // (address bar) collapses/expands — that fires a resize on nearly every
    // scroll and a mid-scroll refresh causes visible scroll jumps.
    ScrollTrigger.config({ ignoreMobileResize: true });

    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.ready) {
      fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    }

    const refresh = () => ScrollTrigger.refresh();

    // Only refresh on a real layout change (width / orientation). The address
    // bar show/hide changes height only, so ignoring height-only resizes keeps
    // scrolling smooth on mobile.
    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      refresh();
    };

    window.addEventListener('pageshow', refresh);
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      window.removeEventListener('pageshow', refresh);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return null;
}
