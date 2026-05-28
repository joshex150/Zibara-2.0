import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Shopping Bag',
  description: 'Review your selected ZIBARASTUDIO pieces before secure checkout.',
  path: '/cart',
  noIndex: true,
});

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
