import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Returns',
  description: 'Returns, exchanges, and defective-item support for ZIBARASTUDIO orders.',
  path: '/returns',
  keywords: ['ZIBARASTUDIO returns', 'fashion exchanges', 'return policy', 'custom order returns'],
});

export default function ReturnsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
