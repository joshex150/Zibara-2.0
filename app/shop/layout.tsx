import { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Shop',
  description: 'Browse ZIBARASTUDIO pieces designed for galas, private dinners, and nights that matter.',
  path: '/shop',
  keywords: [
    'Afro-futurist fashion shop',
    'luxury womenswear',
    'Lagos fashion',
    'occasionwear',
    'ZIBARASTUDIO',
    'editorial fashion',
  ],
});

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
