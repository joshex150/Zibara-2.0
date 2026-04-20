import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Size Guide',
  description: 'Find your ZIBARASTUDIO fit with body measurements, garment sizing, and styling guidance.',
  keywords: [
    'size guide',
    'fashion sizing',
    'size chart',
    'measurements',
    'fit guide',
  ],
  openGraph: {
    type: 'website',
    url: 'https://zibarastudio.com/size-guide',
    title: 'Size Guide',
    description: 'Find your ZIBARASTUDIO fit with body measurements and garment sizing.',
    siteName: 'ZIBARASTUDIO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Size Guide',
    description: 'Find your ZIBARASTUDIO fit with body measurements and garment sizing.',
  },
  alternates: {
    canonical: 'https://zibarastudio.com/size-guide',
  },
};

export default function SizeGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
