'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import BrandLoader from '@/components/BrandLoader';

export default function AdminLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/admin');
    }
  }, [session, status, router]);

  // Show loading while checking session
  if (status === 'loading') {
    return <BrandLoader label="Admin" sublabel="ZIBARASTUDIO" tone="crimson" />;
  }

  // If authenticated, don't render login form (will redirect)
  if (status === 'authenticated') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/admin');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zibara-black flex items-center justify-center px-4 text-zibara-cream">
      <div
        className="max-w-md w-full rounded-lg p-8 border border-zibara-cream/10 bg-zibara-deep shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-zibara-crimson/20 border border-zibara-gold/20 rounded-full mb-4">
            <Lock size={32} className="text-zibara-cream" />
          </div>
          <h1 className="text-2xl font-light uppercase tracking-[0.25em]" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
            Admin Login
          </h1>
          <p className="text-sm text-zibara-cream/55 mt-2 font-mono uppercase tracking-[0.25em]">
            ZIBARASTUDIO Management Portal
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-zibara-crimson/15 border border-zibara-crimson/35 text-zibara-cream rounded text-sm font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-[10px] font-mono uppercase tracking-[0.3em] text-zibara-cream/55 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-zibara-cream/35 rounded-lg bg-zibara-black/40 text-zibara-cream focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 focus:border-zibara-gold/50"
              placeholder="Email Address"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[10px] font-mono uppercase tracking-[0.3em] text-zibara-cream/55 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-zibara-cream/35 rounded-lg bg-zibara-black/40 text-zibara-cream focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 focus:border-zibara-gold/50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zibara-crimson text-zibara-cream py-3 rounded-lg font-mono uppercase tracking-[0.3em] hover:bg-zibara-blood transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zibara-cream/40 font-mono">
          This is a secure admin area. Unauthorized access is prohibited.
        </div>
      </div>
    </div>
  );
}
