'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
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
      // First try to get from localStorage
      const savedOrder = localStorage.getItem('lastOrder');
      if (savedOrder) {
        try {
          const parsed = JSON.parse(savedOrder) as OrderDetails;
          setOrderDetails(parsed);
        } catch (e) {
          console.error('Error parsing saved order:', e);
        }
      }

      // Then try to fetch from API using query params
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
            // Use API data if available, it's more up-to-date
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
      <div className="min-h-screen bg-[#EBB0C9] text-[#8b2b4d] flex items-center justify-center scroll-mt-32">
        <div className="text-center">
          <p className="text-lg mb-4">No order found</p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3 bg-[#8b2b4d] text-white text-xs uppercase tracking-[0.3em] font-bold hover:bg-[#6d1f3a] transition-colors rounded-sm"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EBB0C9] text-[#8b2b4d] scroll-mt-32">
      <div className="max-w-[900px] mx-auto px-4 py-12 md:py-16">
        
        {/* SUCCESS MESSAGE */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-6">
            <CheckCircle size={32} className="text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-[0.3em] mb-4">
            ORDER CONFIRMED!
          </h1>
          <p className="text-base md:text-lg opacity-90 mb-2">
            Thank you for your order, {orderDetails.customer.firstName}!
          </p>
          <p className="text-sm opacity-70">
            Order ID:{' '}
            <span className="font-semibold">
              {orderDetails.orderNumber || orderDetails.orderId || orderDetails._id}
            </span>
          </p>
        </div>

        {/* ORDER DETAILS */}
        <div className="bg-white/30 rounded-sm p-6 md:p-8 mb-8">
          <h2 className="text-lg font-bold uppercase tracking-[0.25em] mb-6 pb-3 border-b border-[#8b2b4d]/20">
            ORDER DETAILS
          </h2>

          <div className="space-y-4 mb-6">
            {orderDetails.items.map((item) => (
              <div key={`${item.id}-${item.size}-${item.color ?? 'default'}`} className="flex gap-4">
                <div className="w-20 aspect-[3/4] bg-zibara-espresso rounded-sm overflow-hidden flex-shrink-0">
                  <ZibaraPlaceholder
                    label={item.name}
                    sublabel={item.color || item.size || 'ORDER ITEM'}
                    variant="compact"
                    tone="deep"
                    className="w-full h-full"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold uppercase tracking-wider">{item.name}</p>
                  <p className="text-xs opacity-70 mt-1">
                    Size: {item.size}
                    {item.color ? ` • Color: ${item.color}` : ''} × {item.quantity}
                  </p>
                  <p className="text-base font-bold mt-2">{formatPrice(item.price * item.quantity, 'USD')}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#8b2b4d]/20">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Paid</span>
              <span>{formatPrice(orderDetails.total, 'USD')}</span>
            </div>
            <p className="text-xs opacity-70 mt-2">
              Payment Method: {orderDetails.paymentMethod}
            </p>
          </div>
        </div>

        {/* SHIPPING INFORMATION */}
        <div className="bg-white/30 rounded-sm p-6 md:p-8 mb-8">
          <h2 className="text-lg font-bold uppercase tracking-[0.25em] mb-4">
            SHIPPING TO
          </h2>
          <div className="text-sm space-y-1">
            <p className="font-semibold">
              {orderDetails.customer.firstName} {orderDetails.customer.lastName}
            </p>
            <p>{orderDetails.customer.address}</p>
            <p>
              {orderDetails.customer.city}, {orderDetails.customer.state}
              {orderDetails.customer.zipCode && ` ${orderDetails.customer.zipCode}`}
            </p>
            {orderDetails.customer.country && (
              <p>{orderDetails.customer.country}</p>
            )}
            <p className="pt-2">{orderDetails.customer.phone}</p>
            <p>{orderDetails.customer.email}</p>
          </div>
        </div>

        {/* WHAT'S NEXT */}
        <div className="bg-white/30 rounded-sm p-6 md:p-8 mb-8">
          <h2 className="text-lg font-bold uppercase tracking-[0.25em] mb-4">
            WHAT&apos;S NEXT?
          </h2>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#8b2b4d] text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </span>
              <div>
                <p className="font-semibold">Order Confirmation Email</p>
                <p className="opacity-70">
                  We&apos;ve sent a confirmation email to {orderDetails.customer.email}
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#8b2b4d] text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </span>
              <div>
                <p className="font-semibold">Production Begins</p>
                <p className="opacity-70">
                  Our studio team will begin preparing your pieces within 24 hours
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#8b2b4d] text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </span>
              <div>
                <p className="font-semibold">Shipping & Tracking</p>
                <p className="opacity-70">
                  You&apos;ll receive tracking information once your order ships (7-10 business days)
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shop"
            className="px-10 py-3 bg-[#8b2b4d] text-white text-xs uppercase tracking-[0.3em] font-bold hover:bg-[#6d1f3a] transition-colors rounded-sm text-center"
          >
            CONTINUE SHOPPING
          </Link>
          <Link
            href={`/order-tracking?orderNumber=${encodeURIComponent(
              orderDetails.orderNumber || orderDetails.orderId || orderDetails._id || ''
            )}&email=${encodeURIComponent(orderDetails.customer.email)}`}
            className="px-10 py-3 bg-white/70 text-[#8b2b4d] text-xs uppercase tracking-[0.3em] font-bold hover:bg-white transition-colors rounded-sm text-center"
          >
            TRACK ORDER
          </Link>
          <Link
            href="/contact"
            className="px-10 py-3 bg-white/50 text-[#8b2b4d] text-xs uppercase tracking-[0.3em] font-bold hover:bg-white/70 transition-colors rounded-sm text-center"
          >
            CONTACT US
          </Link>
        </div>

        {/* SUPPORT MESSAGE */}
        <div className="text-center mt-12 pt-8 border-t border-[#8b2b4d]/20">
          <p className="text-sm opacity-70">
            Need help with your order?{' '}
            <Link href="/contact" className="underline hover:opacity-100">
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
