'use client';

import { useState, useEffect, useRef } from 'react';
import { Link } from 'next-view-transitions';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';

const navLinks = [
  { href: '/shop',        label: 'Shop'        },
  { href: '/collections', label: 'Collections' },
  { href: '/categories',  label: 'Categories'  },
  { href: '/about',       label: 'About'       },
  { href: '/contact',     label: 'Contact'     },
];

export default function Header() {
  const router   = useRouter();
  const pathname = usePathname();
  const { cartCount } = useCart();

  const [menuOpen,    setMenuOpen]    = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled,    setScrolled]    = useState(false);

  const menuRef    = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const linksRef   = useRef<HTMLLIElement[]>([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (pathname === '/shop') return;

    const frame = window.requestAnimationFrame(() => {
      setSearchOpen(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else          document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const openMenu = () => {
    setMenuOpen(true);
    const menu    = menuRef.current;
    const overlay = overlayRef.current;
    const links   = linksRef.current.filter(Boolean);
    if (!menu || !overlay) return;

    gsap.set(menu, { x: '100%' });
    gsap.set(overlay, { opacity: 0, display: 'block' });
    gsap.set(links, { x: 40, opacity: 0 });

    const tl = gsap.timeline();
    tl.to(overlay, { opacity: 1, duration: 0.28, ease: 'power2.out' })
      .to(menu,    { x: '0%',   duration: 0.52, ease: 'power3.out' }, 0)
      .to(links,   { x: 0, opacity: 1, stagger: 0.045, duration: 0.34, ease: 'power3.out' }, 0.16);
  };

  const closeMenu = () => {
    const menu    = menuRef.current;
    const overlay = overlayRef.current;
    const links   = linksRef.current.filter(Boolean);
    if (!menu || !overlay) return;

    gsap.timeline({ onComplete: () => setMenuOpen(false) })
      .to(links,   { x: 16, opacity: 0, stagger: 0.02, duration: 0.2, ease: 'power2.in' })
      .to(menu,    { x: '100%', duration: 0.38, ease: 'power3.in' }, 0.06)
      .to(overlay, { opacity: 0, duration: 0.28, ease: 'power2.in', onComplete: () => { overlay.style.display = 'none'; } }, 0.06);
  };

  return (
    <>
      {/* ── MAIN HEADER ──────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-300 ${
          scrolled
            ? 'bg-zibara-black/95 backdrop-blur-sm border-zibara-cream/10'
            : 'bg-gradient-to-b from-zibara-black/85 via-zibara-black/45 to-transparent'
        }`}
      >
             {/* Announcement bar */}
             <div className="hidden md:block">
          <div className="max-w-[1400px] mx-auto px-6 h-9 flex items-center justify-between">
            <span className="text-[10px] leading-none tracking-[0.35em] text-zibara-cream/55 uppercase font-mono">
              Lagos · Abuja · London
            </span>
            <span className="text-[10px] leading-none tracking-[0.35em] text-zibara-cream/55 uppercase font-mono">
              You belong in rooms where taste is understood
            </span>
            <span className="text-[10px] leading-none tracking-[0.35em] text-zibara-cream/55 uppercase font-mono">
              New arrivals — Season III
            </span>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 flex items-center justify-between py-4 md:py-5">
          {/* Wordmark */}
          <Link href="/" className="group">
            <span
              className="font-display font-light tracking-[0.25em] uppercase text-zibara-cream text-xl md:text-2xl hover:text-zibara-gold transition-colors duration-300"
              style={{ fontFamily: 'var(--font-cormorant), serif', fontWeight: 300 }}
            >
              ZIBARASTUDIO
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[11px] tracking-widest uppercase font-mono relative group transition-colors duration-300 ${
                  pathname === link.href ? 'text-zibara-cream' : 'text-zibara-cream/65 hover:text-zibara-cream'
                }`}
              >
                {link.label}
                <span className={`absolute -bottom-0.5 left-0 h-px bg-zibara-cream/70 transition-all duration-500 ${pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-zibara-cream/70 hover:text-zibara-cream transition-colors duration-300"
              aria-label="Search"
            >
              <Search size={18} strokeWidth={1.2} />
            </button>

            <Link href="/cart" className="relative text-zibara-cream/70 hover:text-zibara-cream transition-colors duration-300">
              <ShoppingBag size={18} strokeWidth={1.2} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-zibara-crimson text-zibara-cream rounded-full text-[8px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Hamburger — always visible */}
            <button
              onClick={openMenu}
              aria-label="Open menu"
              className="flex flex-col gap-[5px] group"
            >
              <span className="block w-5 h-px bg-zibara-cream/75 group-hover:bg-zibara-cream transition-colors duration-300" />
              <span className="block w-3 h-px bg-zibara-cream/75 group-hover:bg-zibara-cream transition-colors duration-300" />
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="bg-zibara-black">
            <div className="max-w-[1400px] mx-auto px-8 py-4">
              <form
                className="flex items-center gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = searchQuery.trim();
                  router.push(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
              >
                <Search size={16} strokeWidth={1.2} className="text-zibara-cream/55" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH THE COLLECTION..."
                  className="flex-1 text-[11px] tracking-widest uppercase font-mono text-zibara-cream placeholder:text-zibara-cream/45 bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                  className="text-zibara-cream/60 hover:text-zibara-cream transition-colors"
                >
                  <X size={16} strokeWidth={1.2} />
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* ── MENU OVERLAY ─────────────────────────── */}
      <div
        ref={overlayRef}
        onClick={closeMenu}
        style={{ display: 'none' }}
        className="fixed inset-0 z-[60] bg-zibara-black/70 backdrop-blur-sm"
      />

      {/* ── SLIDE-IN MENU ────────────────────────── */}
      <div
        ref={menuRef}
        className="fixed top-0 right-0 h-full w-[85vw] max-w-[480px] bg-zibara-deep z-[70] flex flex-col"
        style={{ transform: 'translateX(100%)' }}
      >
        {/* Menu header */}
        <div className="flex items-center justify-between px-8 py-6">
          <span
            className="text-[10px] tracking-[0.4em] uppercase font-mono text-zibara-cream/55"
          >
            Menu
          </span>
          <button
            onClick={closeMenu}
            className="text-zibara-cream/65 hover:text-zibara-cream transition-colors duration-300"
            aria-label="Close menu"
          >
            <X size={20} strokeWidth={1.2} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-8 pt-12 pb-8 overflow-y-auto">
          <ul className="space-y-1">
            {navLinks.map((link, i) => (
              <li
                key={link.href}
                ref={(el) => { if (el) linksRef.current[i] = el; }}
              >
                <Link
                  href={link.href}
                  onClick={closeMenu}
                  className="block py-4 group"
                >
                  <span
                    className="font-display font-light text-3xl md:text-4xl text-zibara-cream/85 group-hover:text-zibara-cream transition-colors duration-300 tracking-wider uppercase"
                    style={{ fontFamily: 'var(--font-cormorant), serif' }}
                  >
                    {link.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Secondary links */}
          <ul className="mt-10 space-y-3">
            {[
              { href: '/size-guide', label: 'Size Guide' },
              { href: '/custom-order', label: 'Custom Order' },
              { href: '/order-tracking', label: 'Track Order' },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={closeMenu}
                  className="text-[11px] tracking-widest uppercase font-mono text-zibara-cream/60 hover:text-zibara-cream transition-colors duration-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Menu footer */}
        <div className="px-8 py-6">
          <p className="text-[10px] tracking-[0.3em] uppercase font-mono text-zibara-cream/45">
            © 2026 ZIBARASTUDIO
          </p>
        </div>
      </div>
    </>
  );
}
