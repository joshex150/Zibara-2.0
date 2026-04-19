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
  openGraph: {
    type: 'website',
    url: 'https://zibarastudio.com',
    siteName: 'ZIBARASTUDIO',
    title: 'ZIBARASTUDIO — For Nights That Matter',
    description: 'Afro-futurist fashion for the woman who arrives composed.',
    images: [{ url: '/android-chrome-512x512.png', width: 512, height: 512, alt: 'ZIBARASTUDIO' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZIBARASTUDIO — For Nights That Matter',
    description: 'Afro-futurist fashion for the woman who arrives composed.',
    images: ['/android-chrome-512x512.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon', sizes: 'any' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
  alternates: { canonical: 'https://zibarastudio.com' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        <body className="antialiased bg-zibara-black text-zibara-cream">
          <DataProvider>
            <CurrencyProvider>
              <CartProvider>
                <Header />
                {children}
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
