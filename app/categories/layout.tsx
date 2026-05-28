import { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Categories',
  description: 'Explore ZIBARASTUDIO by category, silhouette, and mood.',
  path: '/categories',
  keywords: [
    'fashion categories',
    'silhouette guide',
    'luxury womenswear',
    'Afro-futurism',
    'ZIBARASTUDIO',
  ],
});

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
