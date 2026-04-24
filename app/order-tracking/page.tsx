'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ZibaraPlaceholder from '@/components/ZibaraPlaceholder';
import BrandLoader from '@/components/BrandLoader';

type TrackedOrder = {
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    size?: string;
    color?: string;
    image: string;
  }>;
  total: number;
};

function OrderTrackingContent() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const queryOrderNumber = searchParams.get('orderNumber');
    const queryEmail = searchParams.get('email');
    if (queryOrderNumber) setOrderNumber(queryOrderNumber);
    if (queryEmail) setEmail(queryEmail);
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setOrder(null);
    setLoading(true);

    try {
      const response = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, email }),
      });
      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || 'Order not found.');
      }

      setOrder(payload.data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to find order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream pt-24 md:pt-28">
      <div className="max-w-[900px] mx-auto px-4 md:px-8 pb-16">

        <div className="mb-12 border-b border-zibara-cream/5 pb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-light uppercase tracking-[0.3em]"
            style={{ fontFamily: 'var(--font-cormorant), serif' }}>
            Order Tracking
          </h1>
          <p className="text-[10px] font-mono text-zibara-cream/60 uppercase tracking-widest mt-3">
            Enter your order number and email to track status
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[8px] uppercase tracking-[0.4em] font-mono text-zibara-cream/60 mb-2">
                Order Number
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value)}
                className="w-full px-0 py-3 bg-transparent border-b border-zibara-cream/40 text-zibara-cream text-[11px] font-mono placeholder:text-zibara-cream/40 focus:outline-none focus:border-zibara-cream/70 transition-colors"
                placeholder="CRL-XXXX-XXX"
                required
              />
            </div>
            <div>
              <label className="block text-[8px] uppercase tracking-[0.4em] font-mono text-zibara-cream/60 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-0 py-3 bg-transparent border-b border-zibara-cream/40 text-zibara-cream text-[11px] font-mono placeholder:text-zibara-cream/40 focus:outline-none focus:border-zibara-cream/70 transition-colors"
                placeholder="studio@zibarastudio.com"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-[9px] uppercase tracking-wider font-mono text-red-400/80 mt-5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full py-4 border border-zibara-cream/35 text-[10px] uppercase tracking-[0.4em] font-mono text-zibara-cream/80 hover:bg-zibara-cream hover:text-zibara-black hover:border-zibara-cream transition-all duration-300 disabled:opacity-40"
          >
            {loading ? 'Checking...' : 'Track Order'}
          </button>
        </form>

        {order && (
          <div className="mt-12 border-t border-zibara-cream/10 pt-8">
            <h2 className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/60 uppercase mb-2">Order</h2>
            <p className="text-xl font-light uppercase tracking-wider text-zibara-cream mb-1"
              style={{ fontFamily: 'var(--font-cormorant), serif' }}>
              {order.orderNumber}
            </p>
            <p className="text-[10px] font-mono text-zibara-cream/65 mb-8">
              Status: <span className="text-zibara-cream/80">{order.orderStatus}</span>
              {' · '}
              Payment: <span className="text-zibara-cream/80">{order.paymentStatus}</span>
            </p>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color ?? 'default'}`} className="flex gap-4">
                  <div className="w-16 aspect-[3/4] bg-zibara-espresso overflow-hidden flex-shrink-0">
                    <ZibaraPlaceholder
                      label={item.name}
                      sublabel={item.color || item.size || 'TRACKED ITEM'}
                      variant="compact"
                      tone="olive"
                      className="w-full h-full"
                    />
                  </div>
                  <div className="pt-1">
                    <p className="text-[10px] uppercase tracking-wider font-mono text-zibara-cream/85">{item.name}</p>
                    <p className="text-[9px] font-mono text-zibara-cream/60 mt-1">
                      {item.size ? `Size: ${item.size}` : ''}
                      {item.color ? ` · Color: ${item.color}` : ''}
                      {item.quantity ? ` × ${item.quantity}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-zibara-cream/10">
              <p className="text-[10px] font-mono text-zibara-cream/55">
                Need help?{' '}
                <Link href="/contact" className="text-zibara-cream underline hover:text-zibara-gold transition-colors">
                  Contact support
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingFallback() {
  return <BrandLoader label="Order Tracking" sublabel="ZIBARASTUDIO" tone="deep" />;
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrderTrackingContent />
    </Suspense>
  );
}
