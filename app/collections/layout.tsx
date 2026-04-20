import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Explore ZIBARASTUDIO collections built around silhouette, ceremony, and presence.',
  keywords: [
    'fashion collections',
    'seasonal collections',
    'Afro-futurism',
    'luxury fashion',
    'editorial fashion',
    'ZIBARASTUDIO',
  ],
  openGraph: {
    type: 'website',
    url: 'https://zibarastudio.com/collections',
    title: 'Collections',
    description: 'Explore ZIBARASTUDIO collections built around silhouette, ceremony, and presence.',
    siteName: 'ZIBARASTUDIO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Collections',
    description: 'Explore ZIBARASTUDIO collections built around silhouette, ceremony, and presence.',
  },
  alternates: {
    canonical: 'https://zibarastudio.com/collections',
  },
};

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
