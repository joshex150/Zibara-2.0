import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import Collection from '@/models/Collection';
import { absoluteUrl, BRAND_ICON, getCloudinaryOgImage, SITE_NAME } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    await connectDB();
    const collection = await Collection.findOne({ slug, published: true }).lean();

    if (!collection) {
      return {
        title: 'Collection Not Found',
        description: 'The collection you are looking for does not exist.',
        robots: { index: false, follow: false },
      };
    }

    const collectionUrl = `https://zibarastudio.com/collections/${slug}`;
    const collectionImage = getCloudinaryOgImage(absoluteUrl(collection.coverImage || BRAND_ICON));

    return {
      title: `${collection.name} Collection`,
      description: collection.description || `Explore the ${collection.name} collection from ZIBARASTUDIO.`,
      keywords: [
        collection.name,
        collection.season,
        'ZIBARASTUDIO',
        'Afro-futurism',
        'luxury fashion',
        'editorial fashion',
      ],
      openGraph: {
        type: 'website',
        url: collectionUrl,
        title: `${collection.name} Collection`,
        description: collection.description || `Explore the ${collection.name} collection`,
        images: [
          {
            url: collectionImage,
            width: 1200,
            height: 630,
            alt: `${collection.name} Collection`,
          },
        ],
        siteName: SITE_NAME,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${collection.name} Collection`,
        description: collection.description || `Explore the ${collection.name} collection`,
        images: [collectionImage],
      },
      alternates: {
        canonical: collectionUrl,
      },
    };
  } catch (error) {
    console.error('Error generating collection metadata:', error);
    return {
      title: 'Collection',
      description: 'Seasonal collections from ZIBARASTUDIO.',
    };
  }
}

export default async function CollectionLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug } = await params;
  let collectionJsonLd = null;

  try {
    await connectDB();
    const collection = await Collection.findOne({ slug, published: true }).lean();

    if (collection) {
      collectionJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${collection.name} Collection`,
        description: collection.description,
        url: `https://zibarastudio.com/collections/${slug}`,
        image: absoluteUrl(collection.coverImage || BRAND_ICON),
        isPartOf: {
          '@type': 'WebSite',
          name: SITE_NAME,
          url: 'https://zibarastudio.com',
        },
      };
    }
  } catch (error) {
    console.error('Error generating collection JSON-LD:', error);
  }

  return (
    <>
      {collectionJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
        />
      )}
      {children}
    </>
  );
}
