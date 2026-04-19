import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Custom Order',
  description: 'Request a custom handmade crochet piece. Work with our artisans to create a unique, personalized garment just for you.',
  keywords: [
    'custom crochet',
    'bespoke crochet',
    'handmade custom order',
    'personalized crochet',
    'custom fashion',
  ],
  openGraph: {
    type: 'website',
    url: 'https://crochellaa.ng/custom-order',
    title: 'Custom Order',
    description: 'Request a custom handmade crochet piece. Work with our artisans to create a unique, personalized garment.',
    siteName: 'Crochellaa.ng',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Custom Order',
    description: 'Request a custom handmade crochet piece. Work with our artisans to create a unique, personalized garment.',
  },
  alternates: {
    canonical: 'https://crochellaa.ng/custom-order',
  },
};

export default function CustomOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
