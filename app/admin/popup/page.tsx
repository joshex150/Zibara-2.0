'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, EyeOff, X } from 'lucide-react';
import toast from 'react-hot-toast';
import BrandLoader from '@/components/BrandLoader';

interface PopupData {
  enabled: boolean;
  title: string;
  message: string;
  showButton: boolean;
  buttonText: string;
  buttonLink: string;
  showOnce: boolean;
}

const availablePages = [
  { value: '/', label: 'Home' },
  { value: '/shop', label: 'Shop' },
  { value: '/collections', label: 'Collections' },
  { value: '/categories', label: 'Categories' },
  { value: '/about', label: 'About' },
  { value: '/contact', label: 'Contact' },
  { value: '/shipping', label: 'Shipping Policy' },
  { value: '/returns', label: 'Returns' },
  { value: '/privacy', label: 'Privacy Policy' },
  { value: '/terms', label: 'Terms & Conditions' },
  { value: '/size-guide', label: 'Size Guide' },
  { value: '/custom-order', label: 'Custom Order' },
  { value: '/cart', label: 'Cart' },
];

export default function AdminPopupPage() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [customLink, setCustomLink] = useState('');
  const [data, setData] = useState<PopupData>({
    enabled: false,
    title: 'SPECIAL ANNOUNCEMENT',
    message: 'Welcome to ZIBARASTUDIO.',
    showButton: true,
    buttonText: 'Shop Now',
    buttonLink: '/shop',
    showOnce: true,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPopup();
    }
  }, [status]);

  const fetchPopup = async () => {
    try {
      const res = await fetch('/api/admin/popup');
      const result = await res.json();
      if (result.success && result.popup) {
        setData(result.popup);
        // Check if link is a custom/external link
        const isCustomLink = !availablePages.some(page => page.value === result.popup.buttonLink);
        if (isCustomLink && result.popup.buttonLink) {
          setCustomLink(result.popup.buttonLink);
        }
      }
    } catch (error) {
      console.error('Error fetching popup:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChange = (value: string) => {
    if (value === 'custom') {
      setData({ ...data, buttonLink: customLink || '' });
    } else {
      setData({ ...data, buttonLink: value });
      setCustomLink('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/popup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Popup settings saved successfully!');
        // Clear all dismissal keys so popup shows again after save
        ['localStorage', 'sessionStorage'].forEach((store) => {
          const s = store === 'localStorage' ? localStorage : sessionStorage;
          const keys: string[] = [];
          for (let i = 0; i < s.length; i++) {
            const k = s.key(i);
            if (k && (k === 'popup_dismissed' || k.startsWith('popup_dismissed_'))) keys.push(k);
          }
          keys.forEach((k) => s.removeItem(k));
        });
      } else {
        toast.error('Failed to save: ' + result.error);
      }
    } catch {
      toast.error('Error saving popup settings');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return <BrandLoader label="Popup" sublabel="ZIBARASTUDIO" tone="crimson" />;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream scroll-mt-32">
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0 mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <Link 
              href="/admin"
              className="p-2 bg-zibara-deep rounded-lg hover:bg-zibara-crimson/30 transition-colors flex-shrink-0 border border-zibara-cream/10"
            >
              <ArrowLeft size={20} className="text-zibara-cream" />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-light uppercase tracking-[0.25em]" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                Popup Notice
              </h1>
              <p className="text-xs md:text-sm text-zibara-cream/55 font-mono uppercase tracking-[0.25em]">
                Manage site-wide popup announcement
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-zibara-deep text-zibara-cream rounded-lg hover:bg-zibara-crimson/30 transition-colors text-sm font-medium border border-zibara-cream/10"
            >
              {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 bg-zibara-crimson text-zibara-cream rounded-lg hover:bg-zibara-blood transition-colors disabled:opacity-50 text-sm font-medium"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${showPreview ? 'lg:grid-cols-2' : ''} gap-6`}>
          {/* Settings Form */}
          <div className="space-y-6">
            {/* Enable/Disable Toggle */}
            <div className="bg-zibara-deep rounded-lg p-6 border border-zibara-cream/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-zibara-cream">Popup Status</h3>
                  <p className="text-sm text-zibara-cream/55 mt-1">
                    {data.enabled ? 'Popup is currently visible to visitors' : 'Popup is hidden from visitors'}
                  </p>
                </div>
                <button
                  onClick={() => setData({ ...data, enabled: !data.enabled })}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    data.enabled ? 'bg-zibara-crimson' : 'bg-zibara-cream/20'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 bg-zibara-cream rounded-full transition-transform ${
                      data.enabled ? 'left-8' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="bg-zibara-deep rounded-lg p-6 space-y-4 border border-zibara-cream/10">
              <h3 className="font-semibold text-zibara-cream uppercase tracking-wider text-sm">
                Content
              </h3>
              
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-zibara-cream/55 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-zibara-cream/35 focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 bg-zibara-black/40 text-sm text-zibara-cream"
                  placeholder="Enter popup title"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-zibara-cream/55 mb-2">
                  Message
                </label>
                <textarea
                  value={data.message}
                  onChange={(e) => setData({ ...data, message: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-zibara-cream/35 focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 bg-zibara-black/40 text-sm text-zibara-cream resize-none"
                  placeholder="Enter popup message (use line breaks for multiple paragraphs)"
                />
              </div>
            </div>

            {/* Button Settings */}
            <div className="bg-zibara-deep rounded-lg p-6 space-y-4 border border-zibara-cream/10">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-zibara-cream uppercase tracking-wider text-sm">
                  Button
                </h3>
                <button
                  onClick={() => setData({ ...data, showButton: !data.showButton })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    data.showButton ? 'bg-zibara-crimson' : 'bg-zibara-cream/20'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-zibara-cream rounded-full transition-transform ${
                      data.showButton ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {data.showButton && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-zibara-cream/55 mb-2">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={data.buttonText}
                      onChange={(e) => setData({ ...data, buttonText: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-zibara-cream/35 focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 bg-zibara-black/40 text-sm text-zibara-cream"
                      placeholder="e.g., Shop Now"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-zibara-cream/55 mb-2">
                      Button Link
                    </label>
                    <select
                      value={availablePages.some(p => p.value === data.buttonLink) ? data.buttonLink : 'custom'}
                      onChange={(e) => handleLinkChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-zibara-cream/15 focus:outline-none focus:ring-2 focus:ring-zibara-gold/30 focus:border-transparent bg-zibara-black/40 text-zibara-cream text-sm"
                    >
                      {availablePages.map(page => (
                        <option key={page.value} value={page.value}>
                          {page.label}
                        </option>
                      ))}
                      <option value="custom">Custom Link (External URL)</option>
                    </select>
                    {(!availablePages.some(p => p.value === data.buttonLink) || customLink) && (
                      <input
                        type="text"
                        value={customLink || data.buttonLink}
                        onChange={(e) => {
                          setCustomLink(e.target.value);
                          setData({ ...data, buttonLink: e.target.value });
                        }}
                        className="w-full px-4 py-3 rounded-lg border border-zibara-cream/35 focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 bg-zibara-black/40 text-sm text-zibara-cream mt-2"
                        placeholder="https://example.com or /custom-path"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Display Settings */}
            <div className="bg-zibara-deep rounded-lg p-6 border border-zibara-cream/10">
              <h3 className="font-semibold text-zibara-cream uppercase tracking-wider text-sm mb-4">
                Display Settings
              </h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-zibara-cream">Show Only Once</p>
                  <p className="text-xs text-zibara-cream/55 mt-1">
                    {data.showOnce 
                      ? 'Visitors see the popup only once (remembered forever)' 
                      : 'Visitors see the popup once per browser session'}
                  </p>
                </div>
                <button
                  onClick={() => setData({ ...data, showOnce: !data.showOnce })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    data.showOnce ? 'bg-zibara-crimson' : 'bg-zibara-cream/20'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-zibara-cream rounded-full transition-transform ${
                      data.showOnce ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <>
              {/* Mobile: Full screen overlay */}
              <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-zibara-black rounded-lg p-4 w-full max-w-md border border-zibara-cream/10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-zibara-cream/45 uppercase tracking-wider">
                      Preview
                    </p>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="text-zibara-cream/45 hover:text-zibara-cream transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="bg-zibara-deep rounded-lg p-6 flex items-center justify-center min-h-[300px]">
                    <div 
                      className="relative rounded-lg p-6 w-full bg-zibara-deep text-zibara-cream"
                      style={{
                        border: '1px solid rgba(239,239,201,0.14)',
                        boxShadow: '0 0 0 1px rgba(201,169,110,0.12), 0 25px 50px -12px rgba(0, 0, 0, 0.45)',
                      }}
                    >
                      <div className="text-center pt-2">
                        <h2 className="text-lg font-light uppercase tracking-[0.28em] mb-3" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                          {data.title || 'Title'}
                        </h2>
                        <p className="text-sm text-zibara-cream/72 leading-relaxed mb-4 whitespace-pre-line font-mono">
                          {data.message || 'Your message here...'}
                        </p>
                        {data.showButton && data.buttonText && (
                          <span className="inline-block px-6 py-2 bg-zibara-crimson text-zibara-cream text-sm uppercase tracking-[0.28em] font-mono rounded-lg">
                            {data.buttonText}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop: Side panel */}
              <div className="hidden lg:block lg:sticky lg:top-8">
                <div className="bg-zibara-black rounded-lg p-4 border border-zibara-cream/10">
                  <p className="text-xs text-zibara-cream/45 uppercase tracking-wider mb-3 text-center">
                    Preview
                  </p>
                  <div className="bg-zibara-deep rounded-lg p-6 flex items-center justify-center min-h-[400px]">
                    <div 
                      className="relative rounded-lg p-6 max-w-sm w-full bg-zibara-deep text-zibara-cream"
                      style={{
                        border: '1px solid rgba(239,239,201,0.14)',
                        boxShadow: '0 0 0 1px rgba(201,169,110,0.12), 0 25px 50px -12px rgba(0, 0, 0, 0.45)',
                      }}
                    >
                      <div className="text-center pt-2">
                        <h2 className="text-lg font-light uppercase tracking-[0.28em] mb-3" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                          {data.title || 'Title'}
                        </h2>
                        <p className="text-sm text-zibara-cream/72 leading-relaxed mb-4 whitespace-pre-line font-mono">
                          {data.message || 'Your message here...'}
                        </p>
                        {data.showButton && data.buttonText && (
                          <span className="inline-block px-6 py-2 bg-zibara-crimson text-zibara-cream text-sm uppercase tracking-[0.28em] font-mono rounded-lg">
                            {data.buttonText}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
