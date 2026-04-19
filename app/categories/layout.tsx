import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Explore our handmade crochet fashion by category. Find the perfect piece for your style.',
  keywords: [
    'crochet categories',
    'handmade fashion',
    'sustainable fashion',
    'artisan clothing',
    'Crochellaa',
  ],
  openGraph: {
    type: 'website',
    url: 'https://crochellaa.ng/categories',
    title: 'Categories',
    description: 'Explore our handmade crochet fashion by category',
    siteName: 'Crochellaa.ng',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Categories',
    description: 'Explore our handmade crochet fashion by category',
  },
  alternates: {
    canonical: 'https://crochellaa.ng/categories',
  },
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
