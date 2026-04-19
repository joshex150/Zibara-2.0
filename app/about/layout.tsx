import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Crochellaa.ng - Handmade crochet fashion brand. Our story, mission, and commitment to sustainable, artisanal fashion.',
  keywords: [
    'about Crochellaa',
    'handmade crochet',
    'sustainable fashion',
    'artisan clothing',
    'crochet brand',
  ],
  openGraph: {
    type: 'website',
    url: 'https://crochellaa.ng/about',
    title: 'About Us',
    description: 'Learn about Crochellaa.ng - Handmade crochet fashion brand',
    siteName: 'Crochellaa.ng',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us',
    description: 'Learn about Crochellaa.ng - Handmade crochet fashion brand',
  },
  alternates: {
    canonical: 'https://crochellaa.ng/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
