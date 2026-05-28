import { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Collections',
  description: 'Explore ZIBARASTUDIO collections built around silhouette, ceremony, and presence.',
  path: '/collections',
  keywords: [
    'fashion collections',
    'seasonal collections',
    'Afro-futurism',
    'luxury fashion',
    'editorial fashion',
    'ZIBARASTUDIO',
  ],
});

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
