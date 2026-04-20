import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse ZIBARASTUDIO pieces designed for galas, private dinners, and nights that matter.',
  keywords: [
    'Afro-futurist fashion shop',
    'luxury womenswear',
    'Lagos fashion',
    'occasionwear',
    'ZIBARASTUDIO',
    'editorial fashion',
  ],
  openGraph: {
    type: 'website',
    url: 'https://zibarastudio.com/shop',
    title: 'Shop',
    description: 'Browse ZIBARASTUDIO pieces designed for nights that matter.',
    siteName: 'ZIBARASTUDIO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop',
    description: 'Browse ZIBARASTUDIO pieces designed for nights that matter.',
  },
  alternates: {
    canonical: 'https://zibarastudio.com/shop',
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
