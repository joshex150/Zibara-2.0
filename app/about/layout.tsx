import { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'About Us',
  description: 'Learn about ZIBARASTUDIO, an Afro-futurist luxury fashion house creating intentional silhouettes for nights that matter.',
  path: '/about',
  keywords: [
    'about ZIBARASTUDIO',
    'Afro-futurism',
    'luxury fashion house',
    'Lagos fashion',
    'intentional design',
  ],
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
