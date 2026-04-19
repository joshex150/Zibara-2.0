import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Explore our curated seasonal collections of handmade crochet fashion. Each collection tells a unique story.',
  keywords: [
    'crochet collections',
    'seasonal collections',
    'handmade fashion',
    'sustainable fashion',
    'artisan clothing',
    'Crochellaa',
  ],
  openGraph: {
    type: 'website',
    url: 'https://crochellaa.ng/collections',
    title: 'Collections',
    description: 'Explore our curated seasonal collections of handmade crochet fashion',
    siteName: 'Crochellaa.ng',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Collections',
    description: 'Explore our curated seasonal collections of handmade crochet fashion',
  },
  alternates: {
    canonical: 'https://crochellaa.ng/collections',
  },
};

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
