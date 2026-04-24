'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';

interface PopupData {
  enabled: boolean;
  title: string;
  message: string;
  showButton: boolean;
  buttonText: string;
  buttonLink: string;
  showOnce: boolean;
  updatedAt?: string;
}

// Module-level flag: resets on full page reload, persists across client-side navigation
let dismissedThisLoad = false;

export default function NoticePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [popup, setPopup] = useState<PopupData | null>(null);
  const previousPopupRef = useRef<PopupData | null>(null);

  // Scroll lock — applied to both html and body for cross-browser reliability
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (isVisible) {
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
    } else {
      html.style.overflow = '';
      body.style.overflow = '';
    }
    return () => {
      html.style.overflow = '';
      body.style.overflow = '';
    };
  }, [isVisible]);

  useEffect(() => {
    const fetchPopup = async () => {
      try {
        const res = await fetch('/api/popup');
        const data = await res.json();
        if (data.success && data.popup) {
          const newPopup = data.popup;
          const previousPopup = previousPopupRef.current;

          const wasDisabled = previousPopup && !previousPopup.enabled && newPopup.enabled;
          const contentChanged = previousPopup && (
            previousPopup.title !== newPopup.title ||
            previousPopup.message !== newPopup.message ||
            previousPopup.buttonText !== newPopup.buttonText ||
            previousPopup.buttonLink !== newPopup.buttonLink ||
            previousPopup.showOnce !== newPopup.showOnce
          );

          // Clear localStorage and reset in-memory flag when admin changes popup
          if (wasDisabled || contentChanged) {
            dismissedThisLoad = false;
            const keys: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (key === 'popup_dismissed' || key.startsWith('popup_dismissed_'))) {
                keys.push(key);
              }
            }
            keys.forEach(key => localStorage.removeItem(key));
          }

          previousPopupRef.current = newPopup;
          setPopup(newPopup);
        }
      } catch (error) {
        console.error('Error fetching popup:', error);
      }
    };

    fetchPopup();
    const interval = setInterval(fetchPopup, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!popup || !popup.enabled) {
      setIsVisible(false);
      return;
    }

    const contentSignature = `${popup.title}|${popup.message}|${popup.buttonText}|${popup.buttonLink}`;

    // showOnce: true  → localStorage (never shows again across sessions)
    // showOnce: false → in-memory flag (shows once per full page reload)
    const dismissed = popup.showOnce
      ? localStorage.getItem(`popup_dismissed_${contentSignature}`) === 'true'
      : dismissedThisLoad;

    if (!dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [popup]);

  const handleClose = () => {
    setIsVisible(false);
    if (!popup) return;

    if (popup.showOnce) {
      const contentSignature = `${popup.title}|${popup.message}|${popup.buttonText}|${popup.buttonLink}`;
      localStorage.setItem(`popup_dismissed_${contentSignature}`, 'true');
    } else {
      // Remember dismissal for this JS session (clears on full reload)
      dismissedThisLoad = true;
    }
  };

  if (!isVisible || !popup || !popup.enabled) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[100] animate-fadeIn"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative rounded-lg p-6 md:p-8 max-w-md w-full pointer-events-auto animate-scaleIn bg-zibara-deep text-zibara-cream"
          style={{
            border: '1px solid rgba(239,239,201,0.14)',
            boxShadow: '0 0 0 1px rgba(201,169,110,0.12), 0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          }}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 text-zibara-cream/45 hover:text-zibara-cream transition-colors"
            aria-label="Close popup"
          >
            <X size={24} />
          </button>

          <div className="text-center pt-4">
            <h2
              className="text-xl md:text-2xl font-light uppercase tracking-[0.28em] mb-4 text-zibara-cream"
              style={{ fontFamily: 'var(--font-cormorant), serif' }}
            >
              {popup.title}
            </h2>

            <p className="text-sm md:text-base text-zibara-cream/72 leading-relaxed mb-6 whitespace-pre-line font-mono">
              {popup.message}
            </p>

            {popup.showButton && popup.buttonText && popup.buttonLink && (
              <Link
                href={popup.buttonLink}
                onClick={handleClose}
                className="inline-block px-8 py-3 bg-zibara-crimson text-zibara-cream text-sm uppercase tracking-[0.28em] font-mono rounded-lg hover:bg-zibara-blood transition-colors"
              >
                {popup.buttonText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
