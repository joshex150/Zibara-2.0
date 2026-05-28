import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Order Tracking',
  description: 'Track your ZIBARASTUDIO order status.',
  path: '/order-tracking',
  noIndex: true,
});

export default function OrderTrackingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
