import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with ZIBARASTUDIO for private orders, fittings, press, and brand inquiries.',
  keywords: [
    'contact ZIBARASTUDIO',
    'fashion inquiries',
    'custom orders',
    'luxury fashion contact',
  ],
  openGraph: {
    type: 'website',
    url: 'https://zibarastudio.com/contact',
    title: 'Contact Us',
    description: 'Get in touch with ZIBARASTUDIO for private orders, fittings, press, and brand inquiries.',
    siteName: 'ZIBARASTUDIO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us',
    description: 'Get in touch with ZIBARASTUDIO for private orders, fittings, press, and brand inquiries.',
  },
  alternates: {
    canonical: 'https://zibarastudio.com/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
