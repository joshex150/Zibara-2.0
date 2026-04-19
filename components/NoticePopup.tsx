'use client';

import React, { useState, useEffect, useRef } from 'react';
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

export default function NoticePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [popup, setPopup] = useState<PopupData | null>(null);
  const previousPopupRef = useRef<PopupData | null>(null);

  useEffect(() => {
    const fetchPopup = async () => {
      try {
        const res = await fetch('/api/popup');
        const data = await res.json();
        if (data.success && data.popup) {
          const newPopup = data.popup;
          const previousPopup = previousPopupRef.current;
          
          // Check if popup was disabled and is now re-enabled
          const wasDisabled = previousPopup && !previousPopup.enabled && newPopup.enabled;
          
          // Check if content has changed
          const contentChanged = previousPopup && (
            previousPopup.title !== newPopup.title ||
            previousPopup.message !== newPopup.message ||
            previousPopup.buttonText !== newPopup.buttonText ||
            previousPopup.buttonLink !== newPopup.buttonLink ||
            previousPopup.showOnce !== newPopup.showOnce
          );
          
          // If popup was re-enabled or content changed, clear all dismissal flags
          if (wasDisabled || contentChanged) {
            // Clear all possible dismissal keys from localStorage
            localStorage.removeItem('popup_dismissed');
            const localStorageKeys: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('popup_dismissed_')) {
                localStorageKeys.push(key);
              }
            }
            localStorageKeys.forEach(key => localStorage.removeItem(key));
            
            // Clear all possible dismissal keys from sessionStorage
            sessionStorage.removeItem('popup_dismissed');
            const sessionStorageKeys: string[] = [];
            for (let i = 0; i < sessionStorage.length; i++) {
              const key = sessionStorage.key(i);
              if (key && key.startsWith('popup_dismissed_')) {
                sessionStorageKeys.push(key);
              }
            }
            sessionStorageKeys.forEach(key => sessionStorage.removeItem(key));
          }
          
          previousPopupRef.current = newPopup;
          setPopup(newPopup);
        }
      } catch (error) {
        console.error('Error fetching popup:', error);
      }
    };

    fetchPopup();
    // Poll for popup updates every 30 seconds
    const interval = setInterval(fetchPopup, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!popup || !popup.enabled) {
      setIsVisible(false);
      return;
    }

    // Create a content signature to detect content changes
    const contentSignature = `${popup.title}|${popup.message}|${popup.buttonText}|${popup.buttonLink}`;
    const storageKey = `popup_dismissed_${contentSignature}`;
    
    // Check if popup was already dismissed for this content
    const dismissed = popup.showOnce 
      ? localStorage.getItem(storageKey) === 'true'
      : sessionStorage.getItem(storageKey) === 'true';

    if (!dismissed) {
      // Show popup after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [popup]);

  const handleClose = () => {
    setIsVisible(false);
    if (!popup) return;
    
    // Create a content signature
    const contentSignature = `${popup.title}|${popup.message}|${popup.buttonText}|${popup.buttonLink}`;
    const storageKey = `popup_dismissed_${contentSignature}`;
    
    if (popup.showOnce) {
      // Store in localStorage - shows once ever, but if content changes, signature changes so it shows again
      localStorage.setItem(storageKey, 'true');
    } else {
      // Store in sessionStorage - shows once per session, clears when tab closes
      // If content changes, signature changes so it shows again even in same session
      sessionStorage.setItem(storageKey, 'true');
    }
  };

  if (!isVisible || !popup || !popup.enabled) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[100] animate-fadeIn"
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="relative rounded-lg p-6 md:p-8 max-w-md w-full pointer-events-auto animate-scaleIn bg-zibara-deep text-zibara-cream"
          style={{
            border: '1px solid rgba(239,239,201,0.14)',
            boxShadow: '0 0 0 1px rgba(201,169,110,0.12), 0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 text-zibara-cream/45 hover:text-zibara-cream transition-colors"
            aria-label="Close popup"
          >
            <X size={24} />
          </button>

          {/* Content */}
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
