import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse our collection of handmade crochet fashion. Sustainable, soft, and lovingly crafted pieces.',
  keywords: [
    'crochet shop',
    'handmade fashion',
    'sustainable fashion',
    'artisan clothing',
    'Crochellaa',
    'crochet clothing',
  ],
  openGraph: {
    type: 'website',
    url: 'https://crochellaa.ng/shop',
    title: 'Shop',
    description: 'Browse our collection of handmade crochet fashion',
    siteName: 'Crochellaa.ng',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop',
    description: 'Browse our collection of handmade crochet fashion',
  },
  alternates: {
    canonical: 'https://crochellaa.ng/shop',
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
