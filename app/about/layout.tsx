import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about ZIBARASTUDIO, an Afro-futurist luxury fashion house creating intentional silhouettes for nights that matter.',
  keywords: [
    'about ZIBARASTUDIO',
    'Afro-futurism',
    'luxury fashion house',
    'Lagos fashion',
    'intentional design',
  ],
  openGraph: {
    type: 'website',
    url: 'https://zibarastudio.com/about',
    title: 'About Us',
    description: 'Learn about ZIBARASTUDIO, an Afro-futurist luxury fashion house.',
    siteName: 'ZIBARASTUDIO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us',
    description: 'Learn about ZIBARASTUDIO, an Afro-futurist luxury fashion house.',
  },
  alternates: {
    canonical: 'https://zibarastudio.com/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
