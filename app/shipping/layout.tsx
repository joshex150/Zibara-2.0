import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Shipping',
  description: 'Shipping timelines, delivery options, and international shipping details for ZIBARASTUDIO orders.',
  path: '/shipping',
  keywords: ['ZIBARASTUDIO shipping', 'fashion delivery', 'international shipping', 'Lagos fashion shipping'],
});

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
