import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Explore ZIBARASTUDIO by category, silhouette, and mood.',
  keywords: [
    'fashion categories',
    'silhouette guide',
    'luxury womenswear',
    'Afro-futurism',
    'ZIBARASTUDIO',
  ],
  openGraph: {
    type: 'website',
    url: 'https://zibarastudio.com/categories',
    title: 'Categories',
    description: 'Explore ZIBARASTUDIO by category, silhouette, and mood.',
    siteName: 'ZIBARASTUDIO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Categories',
    description: 'Explore ZIBARASTUDIO by category, silhouette, and mood.',
  },
  alternates: {
    canonical: 'https://zibarastudio.com/categories',
  },
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
