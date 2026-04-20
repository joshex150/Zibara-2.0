import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import Collection from '@/models/Collection';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    await connectDB();
    const collection = await Collection.findOne({ slug, published: true }).lean();

    if (!collection) {
      return {
        title: 'Collection Not Found',
        description: 'The collection you are looking for does not exist.',
      };
    }

    const collectionUrl = `https://zibarastudio.com/collections/${slug}`;
    const collectionImage = collection.coverImage || 'https://zibarastudio.com/android-chrome-512x512.png';

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
        siteName: 'ZIBARASTUDIO',
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

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
