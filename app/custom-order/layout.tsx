import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Custom Order',
  description: 'Request a bespoke ZIBARASTUDIO piece tailored to your event, silhouette, and measurements.',
  keywords: [
    'bespoke fashion',
    'custom order',
    'made-to-measure fashion',
    'private order',
    'custom fashion',
  ],
  openGraph: {
    type: 'website',
    url: 'https://zibarastudio.com/custom-order',
    title: 'Custom Order',
    description: 'Request a bespoke ZIBARASTUDIO piece tailored to your event, silhouette, and measurements.',
    siteName: 'ZIBARASTUDIO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Custom Order',
    description: 'Request a bespoke ZIBARASTUDIO piece tailored to your event, silhouette, and measurements.',
  },
  alternates: {
    canonical: 'https://zibarastudio.com/custom-order',
  },
};

export default function CustomOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
