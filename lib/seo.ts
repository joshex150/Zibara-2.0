import type { Metadata } from 'next';

export const SITE_URL = 'https://zibarastudio.com';
export const SITE_NAME = 'ZIBARASTUDIO';
export const DEFAULT_TITLE = 'ZIBARASTUDIO - For Nights That Matter';
export const DEFAULT_DESCRIPTION =
  'Afro-futurist fashion for the woman who arrives composed. Silhouette over decoration. Form over noise.';
export const DEFAULT_OG_IMAGE = '/opengraph-image';
export const BRAND_ICON = '/android-chrome-512x512.png';

export function absoluteUrl(path = '/') {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getCloudinaryOgImage(imageUrl: string) {
  if (!imageUrl.includes('res.cloudinary.com') || !imageUrl.includes('/image/upload/')) {
    return imageUrl;
  }

  const uploadSegment = '/image/upload/';
  const uploadIndex = imageUrl.indexOf(uploadSegment);
  const afterUpload = imageUrl.substring(uploadIndex + uploadSegment.length);

  if (!afterUpload.includes('/') || afterUpload.split('/')[0].includes('.')) {
    return imageUrl.replace(uploadSegment, `${uploadSegment}w_1200,h_630,c_fill,q_auto,f_auto/`);
  }

  return imageUrl;
}

export function pageMetadata({
  title,
  description,
  path,
  keywords = [],
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : undefined,
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: SITE_NAME,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}
