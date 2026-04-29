import type { Metadata } from "next";
import { Cormorant, Cormorant_Garamond, Space_Mono } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NoticePopup from "@/components/NoticePopup";
import Toastie from "@/components/toastie/Toastie";
import { CartProvider } from "@/context/CartContext";
import { DataProvider } from "@/context/DataContext";
import { CurrencyProvider } from "@/context/CurrencyContext";

const cormorant = Cormorant({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant-garamond',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://zibarastudio.com'),
  title: {
    default: 'ZIBARASTUDIO — For Nights That Matter',
    template: '%s | ZIBARASTUDIO',
  },
  description: 'Afro-futurist fashion for the woman who arrives composed. Silhouette over decoration. Form over noise.',
  keywords: [
    'Zibara',
    'ZibaraStudio',
    'Afro-futurism',
    'luxury fashion Nigeria',
    'Lagos fashion',
    'editorial fashion',
    'intentional design',
  ],
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    url: 'https://zibarastudio.com',
    siteName: 'ZIBARASTUDIO',
    title: 'ZIBARASTUDIO — For Nights That Matter',
    description: 'Afro-futurist fashion for the woman who arrives composed.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'ZIBARASTUDIO — For Nights That Matter' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZIBARASTUDIO — For Nights That Matter',
    description: 'Afro-futurist fashion for the woman who arrives composed.',
    images: ['/opengraph-image'],
  },
  manifest: '/site.webmanifest',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#030303',
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ZIBARASTUDIO',
  url: 'https://zibarastudio.com',
  logo: 'https://zibarastudio.com/icon.svg',
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ZIBARASTUDIO',
  url: 'https://zibarastudio.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://zibarastudio.com/shop?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ViewTransitions>
      <html
        lang="en"
        className={`${cormorant.variable} ${cormorantGaramond.variable} ${spaceMono.variable}`}
      >
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
          />
        </head>
        <body className="antialiased bg-zibara-black text-zibara-cream">
          <a href="#main" className="skip-to-content">Skip to content</a>
          <DataProvider>
            <CurrencyProvider>
              <CartProvider>
                <Header />
                <main id="main">{children}</main>
                <Footer />
                <NoticePopup />
                <Toastie />
              </CartProvider>
            </CurrencyProvider>
          </DataProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
