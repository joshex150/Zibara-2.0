'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollTriggerRefresh() {
  const pathname = usePathname();

  useEffect(() => {
    const timer = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.ready) {
      fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    }

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('pageshow', refresh);
    window.addEventListener('resize', refresh, { passive: true });

    return () => {
      window.removeEventListener('pageshow', refresh);
      window.removeEventListener('resize', refresh);
    };
  }, []);

  return null;
}
