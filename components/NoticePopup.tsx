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

// Identifies a specific popup configuration. Dismissals are keyed by this, so
// editing the popup in admin naturally lets it show again.
const signatureOf = (p: PopupData) =>
  `${p.title}|${p.message}|${p.buttonText}|${p.buttonLink}`;

// Respect the admin "Show Only Once" setting:
//   showOnce: true  → localStorage   (dismissed forever, across sessions)
//   showOnce: false → sessionStorage (dismissed for the current browser session)
const dismissalStore = (showOnce: boolean): Storage =>
  showOnce ? window.localStorage : window.sessionStorage;

const dismissalKey = (sig: string) => `popup_dismissed_${sig}`;

const isDismissed = (p: PopupData): boolean => {
  try {
    return dismissalStore(p.showOnce).getItem(dismissalKey(signatureOf(p))) === 'true';
  } catch {
    return false;
  }
};

const markDismissed = (p: PopupData) => {
  try {
    dismissalStore(p.showOnce).setItem(dismissalKey(signatureOf(p)), 'true');
  } catch {
    /* storage unavailable (private mode) — popup simply re-shows */
  }
};

// Remove a signature's dismissal flag from both stores.
const clearDismissal = (sig: string) => {
  const key = dismissalKey(sig);
  try {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
};

export default function NoticePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [popup, setPopup] = useState<PopupData | null>(null);
  const previousPopupRef = useRef<PopupData | null>(null);
  // Signature already auto-shown this load — stops the 30s poll from re-arming
  // the show timer and reopening the popup after the user closes it.
  const shownSignatureRef = useRef<string | null>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Fetch settings on mount and poll for admin changes.
  useEffect(() => {
    const fetchPopup = async () => {
      try {
        const res = await fetch('/api/popup');
        const data = await res.json();
        if (!data.success || !data.popup) return;

        const newPopup: PopupData = data.popup;
        const previousPopup = previousPopupRef.current;

        // Only react when something the visitor can perceive changed. This
        // prevents the 30s poll from triggering needless re-renders/effects
        // (the root of the flicker / double-show).
        const relevantChanged =
          !previousPopup ||
          previousPopup.enabled !== newPopup.enabled ||
          previousPopup.title !== newPopup.title ||
          previousPopup.message !== newPopup.message ||
          previousPopup.showButton !== newPopup.showButton ||
          previousPopup.buttonText !== newPopup.buttonText ||
          previousPopup.buttonLink !== newPopup.buttonLink ||
          previousPopup.showOnce !== newPopup.showOnce;

        if (!relevantChanged) return;

        const reEnabled = Boolean(previousPopup && !previousPopup.enabled && newPopup.enabled);
        const contentChanged = Boolean(
          previousPopup &&
            (previousPopup.title !== newPopup.title ||
              previousPopup.message !== newPopup.message ||
              previousPopup.buttonText !== newPopup.buttonText ||
              previousPopup.buttonLink !== newPopup.buttonLink ||
              previousPopup.showOnce !== newPopup.showOnce)
        );

        // Admin re-enabled or edited the popup → let it show again.
        if (reEnabled || contentChanged) {
          shownSignatureRef.current = null;
          if (previousPopup) clearDismissal(signatureOf(previousPopup));
          clearDismissal(signatureOf(newPopup));
        }

        previousPopupRef.current = newPopup;
        setPopup(newPopup);
      } catch (error) {
        console.error('Error fetching popup:', error);
      }
    };

    fetchPopup();
    const interval = setInterval(fetchPopup, 30000);
    return () => clearInterval(interval);
  }, []);

  // Decide whether/when to show. Runs only when the settings actually change.
  useEffect(() => {
    // Drop any pending show timer before re-evaluating.
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    if (!popup || !popup.enabled) {
      setIsVisible(false);
      return;
    }

    const sig = signatureOf(popup);

    // Already shown/dismissed this config this load → never reopen via polling.
    if (shownSignatureRef.current === sig) return;

    if (isDismissed(popup)) {
      shownSignatureRef.current = sig;
      return;
    }

    showTimerRef.current = setTimeout(() => {
      showTimerRef.current = null;
      // Re-check at fire time in case it was dismissed during the delay.
      if (isDismissed(popup)) return;
      shownSignatureRef.current = sig;
      setIsVisible(true);
    }, 1500);

    return () => {
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
    };
  }, [popup]);

  const handleClose = () => {
    // Cancel any pending show timer so it can't reopen after dismissal.
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    setIsVisible(false);
    if (!popup) return;
    shownSignatureRef.current = signatureOf(popup);
    markDismissed(popup);
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
