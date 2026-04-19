'use client';

import React, { useState } from 'react';
import { Link } from 'next-view-transitions';
import { useData } from '@/context/DataContext';
import { useCurrency, Currency } from '@/context/CurrencyContext';

export default function Footer() {
  const { getContentValue } = useData();
  const { selectedCurrency, setSelectedCurrency, currencies } = useCurrency();

  const [email,       setEmail]       = useState('');
  const [subscribed,  setSubscribed]  = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [sending,     setSending]     = useState(false);
  const [sent,        setSent]        = useState(false);

  const instagramUrl = getContentValue('contact_instagram', 'https://instagram.com/zibarastudio');
  const tiktokUrl    = getContentValue('contact_tiktok',    'https://tiktok.com/@zibarastudio');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (res.ok) {
        setSent(true);
        setContactForm({ name: '', email: '', message: '' });
        setTimeout(() => { setSent(false); setContactOpen(false); }, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <footer className="bg-zibara-deep border-t border-zibara-cream/5 pt-20 pb-8">
      <div className="max-w-[1400px] mx-auto px-6 md:px-8">

        {/* Top: marquee tagline */}
        <div className="overflow-hidden mb-16 border-y border-zibara-cream/5 py-5">
          <div className="marquee-track">
            {Array(8).fill('FOR NIGHTS THAT MATTER · FOR THE WOMAN WHO ARRIVES COMPOSED · ELEGANCE BEFORE THE WORLD SEES YOU · ').map((t, i) => (
              <span key={i} className="text-[10px] tracking-[0.4em] uppercase font-mono text-zibara-cream/70 mr-8 whitespace-nowrap">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/">
              <span
                className="text-xl tracking-[0.2em] uppercase font-light text-zibara-cream/80 hover:text-zibara-cream transition-colors"
                style={{ fontFamily: 'var(--font-cormorant), serif' }}
              >
                ZIBARASTUDIO
              </span>
            </Link>
            <p className="mt-4 text-[11px] font-mono text-zibara-cream/55 leading-relaxed max-w-[200px]">
              (African Influence) + (Future Thinking) + (Intentional Design) − (Noise)
            </p>
            <div className="flex gap-5 mt-6">
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
                className="text-[10px] tracking-widest uppercase font-mono text-zibara-cream/55 hover:text-zibara-cream transition-colors">
                IG
              </a>
              <a href={tiktokUrl} target="_blank" rel="noopener noreferrer"
                className="text-[10px] tracking-widest uppercase font-mono text-zibara-cream/55 hover:text-zibara-cream transition-colors">
                TK
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase font-mono text-zibara-cream/45 mb-5">Collection</p>
            <ul className="space-y-3">
              {[
                { href: '/shop',        label: 'All Pieces'     },
                { href: '/collections', label: 'Collections'    },
                { href: '/categories',  label: 'Categories'     },
                { href: '/custom-order',label: 'Custom Order'   },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[11px] font-mono text-zibara-cream/65 hover:text-zibara-cream transition-colors tracking-wide">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase font-mono text-zibara-cream/45 mb-5">Info</p>
            <ul className="space-y-3">
              {[
                { href: '/about',          label: 'About Zibara'  },
                { href: '/size-guide',     label: 'Size Guide'    },
                { href: '/shipping',       label: 'Shipping'      },
                { href: '/returns',        label: 'Returns'       },
                { href: '/order-tracking', label: 'Track Order'   },
                { href: '/contact',        label: 'Contact'       },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[11px] font-mono text-zibara-cream/65 hover:text-zibara-cream transition-colors tracking-wide">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase font-mono text-zibara-cream/45 mb-5">Newsletter</p>
            {subscribed ? (
              <p className="text-[11px] font-mono text-zibara-cream/72 leading-relaxed">
                You're in. Expect the unexpected.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <p className="text-[11px] font-mono text-zibara-cream/55 leading-relaxed">
                  First access to new collections and private events.
                </p>
                <div className="flex border-b border-zibara-cream/20 pb-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 text-[11px] font-mono text-zibara-cream placeholder:text-zibara-cream/35 bg-transparent focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="text-[10px] tracking-widest uppercase font-mono text-zibara-cream/65 hover:text-zibara-cream transition-colors ml-3"
                  >
                    →
                  </button>
                </div>
              </form>
            )}

            {/* Currency selector */}
            {currencies && currencies.length > 0 && (
              <div className="mt-8">
                <p className="text-[10px] tracking-[0.3em] uppercase font-mono text-zibara-cream/45 mb-3">Currency</p>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="text-[11px] font-mono text-zibara-cream/65 bg-transparent cursor-pointer hover:text-zibara-cream transition-colors"
                >
                  {currencies.map((c: Currency) => (
                    <option key={c.code} value={c.code} className="bg-zibara-deep text-zibara-cream">
                      {c.code} — {c.symbol}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-6 border-t border-zibara-cream/5">
          <p className="text-[10px] tracking-widest font-mono text-zibara-cream/35 uppercase">
            © 2026 ZIBARASTUDIO. All rights reserved.
          </p>
          <div className="flex gap-6">
            {[
              { href: '/privacy', label: 'Privacy' },
              { href: '/terms',   label: 'Terms'   },
              { href: '/admin/login', label: 'Owner' },
            ].map((l) => (
              <Link key={l.href} href={l.href}
                className="text-[10px] tracking-widest font-mono text-zibara-cream/35 hover:text-zibara-cream/60 transition-colors uppercase">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick contact panel */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 bg-zibara-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-4 animate-fadeIn">
          <div className="bg-zibara-deep border border-zibara-cream/10 p-8 w-full max-w-md animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <p className="text-[10px] tracking-[0.3em] uppercase font-mono text-zibara-cream/40">Get in touch</p>
              <button onClick={() => setContactOpen(false)} className="text-zibara-cream/40 hover:text-zibara-cream transition-colors">✕</button>
            </div>
            {sent ? (
              <p className="text-[11px] font-mono text-zibara-cream/60">Message received. We'll be in touch.</p>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                {(['name', 'email', 'message'] as const).map((field) => (
                  <div key={field} className="border-b border-zibara-cream/10 pb-2">
                    <label className="block text-[9px] tracking-widest uppercase font-mono text-zibara-cream/30 mb-1">{field}</label>
                    {field === 'message' ? (
                      <textarea
                        rows={3}
                        value={contactForm[field]}
                        onChange={(e) => setContactForm(p => ({ ...p, [field]: e.target.value }))}
                        className="w-full text-[11px] font-mono text-zibara-cream bg-transparent resize-none"
                      />
                    ) : (
                      <input
                        type={field === 'email' ? 'email' : 'text'}
                        value={contactForm[field]}
                        onChange={(e) => setContactForm(p => ({ ...p, [field]: e.target.value }))}
                        className="w-full text-[11px] font-mono text-zibara-cream bg-transparent"
                      />
                    )}
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 border border-zibara-cream/20 text-[10px] tracking-widest uppercase font-mono text-zibara-cream/60 hover:text-zibara-cream hover:border-zibara-cream/40 transition-colors"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}
