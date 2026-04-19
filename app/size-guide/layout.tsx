import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Size Guide',
  description: 'Find your perfect fit with our comprehensive size guide. Measurements and sizing information for all our handmade crochet pieces.',
  keywords: [
    'crochet size guide',
    'handmade fashion sizing',
    'size chart',
    'measurements',
    'fit guide',
  ],
  openGraph: {
    type: 'website',
    url: 'https://crochellaa.ng/size-guide',
    title: 'Size Guide',
    description: 'Find your perfect fit with our comprehensive size guide',
    siteName: 'Crochellaa.ng',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Size Guide',
    description: 'Find your perfect fit with our comprehensive size guide',
  },
  alternates: {
    canonical: 'https://crochellaa.ng/size-guide',
  },
};

export default function SizeGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
