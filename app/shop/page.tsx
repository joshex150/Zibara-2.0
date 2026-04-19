'use client';

import React, { Suspense, useState } from 'react';
import { Link } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { useCurrency } from '@/context/CurrencyContext';
import AnimatedHeading from '@/components/AnimatedHeading';
import ProductImage, { pickTone } from '@/components/ProductImage';

function ShopContent() {
  const { products, productsLoading, categories } = useData();
  const { formatPrice } = useCurrency();
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const query = searchParams.get('q')?.trim() ?? '';
  const normalizedQuery = query.toLowerCase();

  const categoryNames = ['all', ...Array.from(new Set(products.map(p => p.category))).filter(Boolean)];

  const filteredProducts = products.filter((p) => {
    const matchesQuery = !normalizedQuery || (
      p.name.toLowerCase().includes(normalizedQuery) ||
      p.category.toLowerCase().includes(normalizedQuery) ||
      p.description.toLowerCase().includes(normalizedQuery)
    );
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  if (productsLoading) {
    return (
      <div className="fixed inset-0 bg-zibara-black flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-px h-12 bg-zibara-crimson animate-pulse" />
          <span className="text-[10px] tracking-[0.4em] font-mono text-zibara-cream/55 uppercase">Loading</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream pt-28 md:pt-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-8">

        {/* Page header */}
        <div className="mb-12 md:mb-16 border-b border-zibara-cream/5 pb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <AnimatedHeading
              tag="h1"
              className="font-display font-light text-[clamp(3rem,8vw,7rem)] leading-none tracking-tight uppercase text-zibara-cream"
              style={{ fontFamily: 'var(--font-cormorant), serif' } as React.CSSProperties}
            >
              The Collection
            </AnimatedHeading>
            <p className="text-[10px] tracking-[0.35em] font-mono text-zibara-cream/55 uppercase">
              {query
                ? `${filteredProducts.length} result${filteredProducts.length === 1 ? '' : 's'} for "${query}"`
                : `${filteredProducts.length} piece${filteredProducts.length === 1 ? '' : 's'}`}
            </p>
          </div>
        </div>

        {/* Category filter tabs */}
        {!query && categoryNames.length > 2 && (
          <div className="flex items-center gap-6 mb-10 overflow-x-auto scrollbar-hide pb-2">
            {categoryNames.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[10px] tracking-[0.35em] font-mono uppercase whitespace-nowrap transition-colors duration-300 pb-1 border-b ${
                  activeCategory === cat
                    ? 'text-zibara-cream border-zibara-cream/70'
                    : 'text-zibara-cream/55 border-transparent hover:text-zibara-cream'
                }`}
              >
                {cat === 'all' ? 'All Pieces' : cat}
              </button>
            ))}
          </div>
        )}

        {/* Product grid */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <p className="text-[11px] font-mono text-zibara-cream/65 tracking-widest uppercase">No pieces found</p>
            <button
              onClick={() => setActiveCategory('all')}
              className="text-[10px] tracking-widest font-mono text-zibara-cream/55 hover:text-zibara-cream transition-colors uppercase border-b border-current pb-0.5"
            >
              Clear filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 pb-24">
            {filteredProducts.map((product, i) => (
              <Link
                key={product._id}
                href={`/product/${product._id}`}
                className="group"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-zibara-espresso mb-3">
                  <ProductImage
                    src={product.images[0]}
                    name={product.name}
                    sublabel={product.category || 'THE COLLECTION'}
                    variant="default"
                    tone={pickTone(product._id)}
                    className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Second image reveal on hover (if available) */}
                  {product.images[1] && (
                    <ProductImage
                      src={product.images[1]}
                      name={product.name}
                      sublabel="SECOND LOOK"
                      variant="default"
                      tone="deep"
                      className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    />
                  )}

                  {/* Tag */}
                  {i < 4 && (
                    <span className="absolute top-3 left-3 text-[7px] tracking-[0.3em] font-mono bg-zibara-crimson text-zibara-cream px-1.5 py-0.5 uppercase">
                      New
                    </span>
                  )}

                  {!product.inStock && (
                    <span className="absolute top-3 right-3 text-[7px] tracking-[0.3em] font-mono bg-zibara-espresso/80 text-zibara-cream/60 px-1.5 py-0.5 uppercase">
                      Sold out
                    </span>
                  )}

                  {/* CTA overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out bg-gradient-to-t from-zibara-black to-transparent">
                    <span className="text-[9px] tracking-widest font-mono text-zibara-cream/70 uppercase">
                      View piece →
                    </span>
                  </div>
                </div>

                {/* Meta */}
                <div className="space-y-0.5">
                  <p className="text-[10px] md:text-[11px] uppercase tracking-wider font-mono text-zibara-cream/80">
                    {product.name}
                  </p>
                  {product.category && (
                    <p className="text-[9px] font-mono text-zibara-cream/50 uppercase tracking-wider">
                      {product.category}
                    </p>
                  )}
                  <p className="text-[11px] md:text-xs font-mono text-zibara-cream/90 pt-0.5">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="fixed inset-0 bg-zibara-black flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-px h-12 bg-zibara-crimson animate-pulse" />
        <span className="text-[10px] tracking-[0.4em] font-mono text-zibara-cream/55 uppercase">Loading</span>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ShopContent />
    </Suspense>
  );
}
