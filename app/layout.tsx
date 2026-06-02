import type { Metadata } from "next";
import { Cormorant, Cormorant_Garamond, Space_Mono } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NoticePopup from "@/components/NoticePopup";
import RouteScrollReset from "@/components/RouteScrollReset";
import ScrollTriggerRefresh from "@/components/ScrollTriggerRefresh";
import Toastie from "@/components/toastie/Toastie";
import { CartProvider } from "@/context/CartContext";
import { DataProvider } from "@/context/DataContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import {
  BRAND_ICON,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

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
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'fashion',
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    'Zibara',
    'ZibaraStudio',
    'Afro-futurism',
    'luxury fashion Nigeria',
    'Lagos fashion',
    'editorial fashion',
    'intentional design',
  ],
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: BRAND_ICON, sizes: '512x512', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
    other: [
      { rel: 'mask-icon', url: '/icon.svg', color: '#030303' },
    ],
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    locale: 'en_US',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: DEFAULT_TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/site.webmanifest',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#030303',
  maximumScale: 1,
  userScalable: false,
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}${BRAND_ICON}`,
  image: `${SITE_URL}${BRAND_ICON}`,
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/shop?q={search_term_string}`,
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
                <RouteScrollReset />
                <ScrollTriggerRefresh />
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
