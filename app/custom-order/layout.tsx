import { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Custom Order',
  description: 'Request a bespoke ZIBARASTUDIO piece tailored to your event, silhouette, and measurements.',
  path: '/custom-order',
  keywords: [
    'bespoke fashion',
    'custom order',
    'made-to-measure fashion',
    'private order',
    'custom fashion',
  ],
});

export default function CustomOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
