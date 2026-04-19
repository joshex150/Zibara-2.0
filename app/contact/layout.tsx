import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Crochellaa.ng. We\'d love to hear from you! Contact us for inquiries, custom orders, or any questions.',
  keywords: [
    'contact Crochellaa',
    'crochet inquiries',
    'custom orders',
    'handmade fashion contact',
  ],
  openGraph: {
    type: 'website',
    url: 'https://crochellaa.ng/contact',
    title: 'Contact Us',
    description: 'Get in touch with Crochellaa.ng. We\'d love to hear from you!',
    siteName: 'Crochellaa.ng',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us',
    description: 'Get in touch with Crochellaa.ng. We\'d love to hear from you!',
  },
  alternates: {
    canonical: 'https://crochellaa.ng/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
