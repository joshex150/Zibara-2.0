'use client';

import { useParams } from 'next/navigation';
import { Link } from 'next-view-transitions';
import { Calendar, ArrowLeft } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { useData, Product } from '@/context/DataContext';
import ZibaraPlaceholder from '@/components/ZibaraPlaceholder';
import BrandLoader from '@/components/BrandLoader';

export default function CollectionDetailPage() {
  const params = useParams();
  const { formatPrice } = useCurrency();
  const { getCollection, collectionsLoading } = useData();
  const slug = typeof params.slug === 'string'
    ? params.slug
    : Array.isArray(params.slug)
      ? params.slug[0]
      : '';
  const collection = slug ? getCollection(slug) : undefined;
  const collectionProducts = Array.isArray(collection?.productIds)
    ? collection.productIds.filter((product): product is Product => typeof product === 'object' && product !== null && '_id' in product)
    : [];


  if (collectionsLoading && !collection) return <BrandLoader label="Collection" sublabel="ZIBARASTUDIO" tone="deep" variant="compact" />;

  if (!collection) {
    return (
      <div className="min-h-screen bg-zibara-black text-zibara-cream flex items-center justify-center scroll-mt-32">
        <div className="text-center">
          <p className="text-zibara-cream/72 text-lg mb-4 uppercase tracking-[0.25em] font-mono">Collection not found</p>
          <Link href="/collections" className="text-sm underline text-zibara-cream/65 hover:text-zibara-cream">
            Back to Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream scroll-mt-32">
      {/* Hero Section */}
      <div className="relative w-full h-[60vh] md:h-[70vh]">
        <ZibaraPlaceholder
          label={collection.name}
          sublabel={`${collection.season} ${collection.year}`}
          tone="crimson"
          variant="hero"
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Back Button */}
        <Link
          href="/collections"
          className="absolute top-8 left-8 flex items-center gap-2 bg-zibara-deep/90 backdrop-blur-sm px-4 py-2 rounded-full text-zibara-cream/75 hover:text-zibara-cream transition-all border border-zibara-cream/10"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-semibold uppercase tracking-wider">Back</span>
        </Link>

        {/* Collection Title */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Calendar size={18} className="text-white" />
              <span className="text-white text-sm font-semibold uppercase tracking-wider">
                {collection.season} {collection.year}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-[0.15em] uppercase text-white mb-4">
              {collection.name}
            </h1>
            <p className="text-white/95 text-base md:text-lg max-w-2xl">
              {collection.description}
            </p>
          </div>
        </div>
      </div>

      {/* Write-up Section */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-16 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg">
            <p className="text-base md:text-lg leading-relaxed whitespace-pre-line">
              {collection.writeUp}
            </p>
          </div>
        </div>
      </div>

      {/* Collection Images */}
      {collection.images && collection.images.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-4 md:px-16 pb-16 md:pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {collection.images.map((image, index) => (
              <div key={index} className="relative aspect-[3/4] bg-zibara-espresso rounded-sm overflow-hidden">
                <ZibaraPlaceholder
                  label={collection.name}
                  sublabel={`FRAME ${index + 1}`}
                  variant="default"
                  tone={index % 2 === 0 ? 'espresso' : 'deep'}
                  className="w-full h-full"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products from Collection */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-16 pb-16 md:pb-24">
        <h2 className="text-2xl md:text-3xl font-bold tracking-[0.2em] uppercase mb-8 md:mb-12 pb-6 border-b border-zibara-cream/10">
          PIECES FROM THIS COLLECTION
        </h2>

        {collectionProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {collectionProducts.map((product) => (
              <Link
                key={product._id}
                href={`/product/${product._id}`}
                className="group cursor-pointer [view-transition-name:none]"
              >
                <div className="relative aspect-[3/4] bg-zibara-espresso mb-4 overflow-hidden rounded-sm">
                  <ZibaraPlaceholder
                    label={product.name}
                    sublabel={product.category || 'COLLECTION'}
                    variant="default"
                    tone="olive"
                    className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium">
                    {product.name}
                  </p>
                  <p className="text-xs md:text-sm font-semibold">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-zibara-cream/60">No products in this collection yet</p>
          </div>
        )}
      </div>

      {/* Explore More */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-16 pb-24">
        <div className="text-center border-t border-zibara-cream/10 pt-12">
          <Link
            href="/collections"
            className="inline-block text-sm uppercase tracking-wider font-semibold text-zibara-cream/70 hover:opacity-100 transition-opacity underline underline-offset-4"
          >
            Explore More Collections →
          </Link>
        </div>
      </div>

      {/* JSON-LD Structured Data for SEO */}
      {collection && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: collection.name,
              description: collection.description,
              image: collection.coverImage,
              url: `https://zibarastudio.com/collections/${collection.slug}`,
              mainEntity: {
                '@type': 'ItemList',
                name: collection.name,
                description: collection.description,
              },
            }),
          }}
        />
      )}
    </div>
  );
}
