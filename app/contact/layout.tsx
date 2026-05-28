import { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Contact Us',
  description: 'Get in touch with ZIBARASTUDIO for private orders, fittings, press, and brand inquiries.',
  path: '/contact',
  keywords: [
    'contact ZIBARASTUDIO',
    'fashion inquiries',
    'custom orders',
    'luxury fashion contact',
  ],
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
