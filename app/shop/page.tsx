'use client';

import React, { Suspense, useState } from 'react';
import { Link } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { useCurrency } from '@/context/CurrencyContext';
import AnimatedHeading from '@/components/AnimatedHeading';
import ProductImage, { pickTone } from '@/components/ProductImage';
import BrandLoader from '@/components/BrandLoader';

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

  if (productsLoading) return <BrandLoader label="Collection" sublabel="ZIBARASTUDIO" tone="crimson" />;

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

        <div className="flex gap-12 items-start">
          <aside className="hidden lg:block w-36 flex-shrink-0 pt-1">
            <p className="text-[8px] tracking-[0.5em] font-mono text-zibara-cream/45 uppercase mb-5">Filter</p>
            <div className="space-y-1">
              {!query && categoryNames.length > 2 && categoryNames.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`block w-full text-left text-[10px] tracking-[0.25em] font-mono uppercase py-1.5 transition-colors duration-200 ${
                    activeCategory === cat
                      ? 'text-zibara-cream'
                      : 'text-zibara-cream/40 hover:text-zibara-cream/75'
                  }`}
                >
                  {cat === 'all' ? 'All Pieces' : cat}
                </button>
              ))}
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {/* Category filter tabs — mobile */}
            {!query && categoryNames.length > 2 && (
              <div className="lg:hidden flex items-center gap-6 mb-10 overflow-x-auto scrollbar-hide pb-2">
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
                <p className="font-display font-light italic text-[1.5rem] text-zibara-cream/25 mb-1" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                  Nothing here tonight.
                </p>
                <p className="text-[10px] font-mono text-zibara-cream/45 tracking-widest uppercase">No pieces found</p>
                <button
                  onClick={() => setActiveCategory('all')}
                  className="mt-2 text-[9px] tracking-widest font-mono text-zibara-cream/45 hover:text-zibara-cream transition-colors uppercase border-b border-current pb-0.5"
                >
                  Clear filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 pb-24">
                {filteredProducts.map((product, i) => (
                  <React.Fragment key={product._id}>
                    <Link
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
                          <span className="absolute top-3 left-3 text-[7px] tracking-[0.3em] font-mono border border-zibara-cream/40 text-zibara-cream/80 px-1.5 py-0.5 uppercase">
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
                    {(i + 1) % 6 === 0 && i < filteredProducts.length - 1 && (
                      <div className="col-span-2 md:col-span-3 lg:col-span-4 py-10 border-t border-b border-zibara-cream/5 my-2">
                        <p className="text-center font-display font-light italic text-[clamp(1.1rem,2.2vw,1.8rem)] text-zibara-cream/30 tracking-wide"
                          style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                          Silhouette over decoration. Form over noise.
                        </p>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return <BrandLoader label="Collection" sublabel="ZIBARASTUDIO" tone="crimson" />;
}

export default function ShopPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ShopContent />
    </Suspense>
  );
}
