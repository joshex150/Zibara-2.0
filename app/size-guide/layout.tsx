import { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Size Guide',
  description: 'Find your ZIBARASTUDIO fit with body measurements, garment sizing, and styling guidance.',
  path: '/size-guide',
  keywords: [
    'size guide',
    'fashion sizing',
    'size chart',
    'measurements',
    'fit guide',
  ],
});

export default function SizeGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
