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
    if (queryOrderNumber) {
      setOrderNumber(queryOrderNumber);
    }
    if (queryEmail) {
      setEmail(queryEmail);
    }
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
    <div className="min-h-screen bg-[#EBB0C9] text-[#8b2b4d] scroll-mt-32">
      <div className="max-w-[900px] mx-auto px-4 py-12 md:py-16">
        <div className="mb-10 text-center">
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-[0.3em] mb-3">
            ORDER TRACKING
          </h1>
          <p className="text-xs md:text-sm tracking-wider opacity-70">
            Enter your order number and email to track status.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/30 rounded-sm p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                Order Number
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value)}
                className="w-full px-4 py-3 bg-white/70 border-2 border-[#8b2b4d]/20 rounded-sm focus:outline-none focus:border-[#8b2b4d]/60"
                placeholder="CRL-XXXX-XXX"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-4 py-3 bg-white/70 border-2 border-[#8b2b4d]/20 rounded-sm focus:outline-none focus:border-[#8b2b4d]/60"
                placeholder="studio@zibarastudio.com"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-xs uppercase tracking-wider text-red-700 mt-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-3 bg-[#8b2b4d] text-white text-xs uppercase tracking-[0.3em] font-bold hover:bg-[#6d1f3a] transition-colors rounded-sm disabled:opacity-60"
          >
            {loading ? 'CHECKING...' : 'TRACK ORDER'}
          </button>
        </form>

        {order && (
          <div className="mt-8 bg-white/30 rounded-sm p-6 md:p-8">
            <h2 className="text-lg font-bold uppercase tracking-[0.25em] mb-4">
              ORDER {order.orderNumber}
            </h2>
            <p className="text-sm opacity-80 mb-4">
              Status: <span className="font-semibold">{order.orderStatus}</span> · Payment:{' '}
              <span className="font-semibold">{order.paymentStatus}</span>
            </p>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color ?? 'default'}`} className="flex gap-4">
                  <div className="w-16 aspect-[3/4] bg-zibara-espresso rounded-sm overflow-hidden flex-shrink-0">
                    <ZibaraPlaceholder
                      label={item.name}
                      sublabel={item.color || item.size || 'TRACKED ITEM'}
                      variant="compact"
                      tone="olive"
                      className="w-full h-full"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider">{item.name}</p>
                    <p className="text-xs opacity-70">
                      {item.size ? `Size: ${item.size}` : ''}
                      {item.color ? ` • Color: ${item.color}` : ''}
                      {item.quantity ? ` × ${item.quantity}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-sm">
              <p className="font-semibold">
                Need help?{' '}
                <Link href="/contact" className="underline hover:opacity-80">
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
