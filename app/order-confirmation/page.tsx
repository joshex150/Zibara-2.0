'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';
import ZibaraPlaceholder from '@/components/ZibaraPlaceholder';
import BrandLoader from '@/components/BrandLoader';

interface OrderDetails {
  orderId?: string;
  _id?: string;
  orderNumber?: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country?: string;
    zipCode?: string;
  };
  items: Array<{
    id: string;
    name: string;
    price: number;
    size: string;
    color?: string;
    quantity: number;
    image: string;
  }>;
  total: number;
  paymentMethod: string;
}

type ApiOrderItem = {
  productId?: { _id?: string };
  id?: string;
  name: string;
  price: number;
  size: string;
  color?: string;
  quantity: number;
  image: string;
};

function OrderConfirmationContent() {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchOrder = async () => {
      const savedOrder = localStorage.getItem('lastOrder');
      if (savedOrder) {
        try {
          const parsed = JSON.parse(savedOrder) as OrderDetails;
          setOrderDetails(parsed);
        } catch (e) {
          console.error('Error parsing saved order:', e);
        }
      }

      const orderNumber = searchParams.get('orderNumber');
      const email = searchParams.get('email');

      if (orderNumber && email) {
        try {
          const response = await fetch('/api/orders/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderNumber, email }),
          });
          const payload = await response.json();

          if (response.ok && payload?.success) {
            setOrderDetails({
              _id: payload.data._id,
              orderId: payload.data._id,
              orderNumber: payload.data.orderNumber,
              customer: payload.data.customer,
              items: payload.data.items.map((item: ApiOrderItem) => ({
                id: item.productId?._id || item.id || '',
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                image: item.image,
              })),
              total: payload.data.total,
              paymentMethod: payload.data.paymentMethod || 'Unknown',
            });
          }
        } catch (error) {
          console.error('Error fetching order:', error);
        }
      }
    };

    fetchOrder();
  }, [searchParams]);

  const { formatPrice } = useCurrency();

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-zibara-black text-zibara-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-[11px] font-mono text-zibara-cream/60 uppercase tracking-widest mb-6">No order found</p>
          <Link
            href="/shop"
            className="inline-block px-10 py-3 border border-zibara-cream/35 text-[10px] uppercase tracking-[0.4em] font-mono text-zibara-cream/80 hover:bg-zibara-cream hover:text-zibara-black transition-all duration-300"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream pt-24 md:pt-28">
      <div className="max-w-[900px] mx-auto px-4 md:px-8 pb-16">

        {/* SUCCESS */}
        <div className="text-center mb-12">
          <div className="mb-8">
            <span
              className="font-display font-light text-[4rem] text-zibara-cream/60 leading-none"
              style={{ fontFamily: 'var(--font-cormorant), serif' }}
            >
              ✓
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-light uppercase tracking-[0.3em] mb-4"
            style={{ fontFamily: 'var(--font-cormorant), serif' }}>
            Order Confirmed
          </h1>
          <p className="text-[11px] font-mono text-zibara-cream/75 mb-1">
            Thank you, {orderDetails.customer.firstName}.
          </p>
          <p className="text-[10px] font-mono text-zibara-cream/65 uppercase tracking-widest">
            Order: {orderDetails.orderNumber || orderDetails.orderId || orderDetails._id}
          </p>
        </div>

        {/* ORDER DETAILS */}
        <div className="border-t border-zibara-cream/8 pt-8 mb-14">
          <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/60 uppercase mb-6">Order Details</p>

          <div className="space-y-5 mb-6">
            {orderDetails.items.map((item) => (
              <div key={`${item.id}-${item.size}-${item.color ?? 'default'}`} className="flex gap-4">
                <div className="w-20 aspect-[3/4] bg-zibara-espresso overflow-hidden flex-shrink-0">
                  <ZibaraPlaceholder
                    label={item.name}
                    sublabel={item.color || item.size || 'ORDER ITEM'}
                    variant="compact"
                    tone="deep"
                    className="w-full h-full"
                  />
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-[10px] uppercase tracking-wider font-mono text-zibara-cream/85">{item.name}</p>
                  <p className="text-[9px] font-mono text-zibara-cream/60 mt-1">
                    Size: {item.size}{item.color ? ` · ${item.color}` : ''} × {item.quantity}
                  </p>
                  <p className="text-[11px] font-mono text-zibara-cream mt-2">{formatPrice(item.price * item.quantity, 'USD')}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-5 border-t border-zibara-cream/10">
            <div className="flex justify-between">
              <span className="text-[10px] font-mono text-zibara-cream/65 uppercase tracking-wider">Total Paid</span>
              <span className="text-base font-mono text-zibara-cream">{formatPrice(orderDetails.total, 'USD')}</span>
            </div>
            <p className="text-[9px] font-mono text-zibara-cream/65 uppercase tracking-wider mt-2">
              Via {orderDetails.paymentMethod}
            </p>
          </div>
        </div>

        {/* SHIPPING */}
        <div className="border-t border-zibara-cream/8 pt-8 mb-14">
          <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/60 uppercase mb-5">Shipping To</p>
          <div className="text-[11px] font-mono text-zibara-cream/70 space-y-1">
            <p className="text-zibara-cream/90">{orderDetails.customer.firstName} {orderDetails.customer.lastName}</p>
            <p>{orderDetails.customer.address}</p>
            <p>{orderDetails.customer.city}, {orderDetails.customer.state}{orderDetails.customer.zipCode && ` ${orderDetails.customer.zipCode}`}</p>
            {orderDetails.customer.country && <p>{orderDetails.customer.country}</p>}
            <p className="pt-2 text-zibara-cream/65">{orderDetails.customer.phone}</p>
            <p className="text-zibara-cream/65">{orderDetails.customer.email}</p>
          </div>
        </div>

        {/* WHAT'S NEXT */}
        <div className="border-t border-zibara-cream/8 pt-8 mb-14">
          <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/60 uppercase mb-6">What&apos;s Next</p>
          <ul className="space-y-5">
            {[
              { n: '01', title: 'Order Confirmation Email', body: `We've sent a confirmation to ${orderDetails.customer.email}` },
              { n: '02', title: 'Production Begins', body: 'Our studio team will begin preparing your pieces within 24 hours' },
              { n: '03', title: 'Shipping & Tracking', body: "You'll receive tracking information once your order ships (7–10 business days)" },
            ].map(({ n, title, body }) => (
              <li key={n} className="flex gap-4">
                <span className="text-[8px] tracking-widest font-mono text-zibara-cream/60 pt-0.5 flex-shrink-0">{n}</span>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-mono text-zibara-cream/80 mb-0.5">{title}</p>
                  <p className="text-[10px] font-mono text-zibara-cream/65">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/shop"
            className="px-10 py-3 border border-zibara-cream/35 text-[10px] uppercase tracking-[0.4em] font-mono text-zibara-cream/80 hover:bg-zibara-cream hover:text-zibara-black transition-all duration-300 text-center"
          >
            Continue Shopping
          </Link>
          <Link
            href={`/order-tracking?orderNumber=${encodeURIComponent(orderDetails.orderNumber || orderDetails.orderId || orderDetails._id || '')}&email=${encodeURIComponent(orderDetails.customer.email)}`}
            className="px-10 py-3 border border-zibara-cream/15 text-[10px] uppercase tracking-[0.4em] font-mono text-zibara-cream/55 hover:border-zibara-cream/35 hover:text-zibara-cream/80 transition-all duration-300 text-center"
          >
            Track Order
          </Link>
          <Link
            href="/contact"
            className="px-10 py-3 text-[10px] uppercase tracking-[0.4em] font-mono text-zibara-cream/45 hover:text-zibara-cream/65 transition-colors text-center"
          >
            Contact Us
          </Link>
        </div>

        <div className="text-center mt-10 pt-8 border-t border-zibara-cream/5">
          <p className="text-[10px] font-mono text-zibara-cream/65">
            Need help?{' '}
            <Link href="/contact" className="text-zibara-cream/75 underline hover:text-zibara-cream transition-colors">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return <BrandLoader label="Order Confirmed" sublabel="ZIBARASTUDIO" tone="crimson" />;
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
