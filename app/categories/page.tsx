'use client';

import React from 'react';
import { Link } from 'next-view-transitions';
import { useData } from '@/context/DataContext';
import { useCurrency } from '@/context/CurrencyContext';
import AnimatedHeading from '@/components/AnimatedHeading';
import ZibaraPlaceholder from '@/components/ZibaraPlaceholder';

export default function CategoryPage() {
  const { products, productsLoading, categories, categoriesLoading } = useData();
  const { formatPrice } = useCurrency();

  const groupedProducts = categories
    .filter(cat => cat.isActive)
    .map(category => ({
      category,
      products: products.filter(p => p.category === category.name),
    }))
    .filter(group => group.products.length > 0);

  if (productsLoading || categoriesLoading) {
    return (
      <div className="fixed inset-0 bg-zibara-black flex items-center justify-center z-50">
        <div className="w-px h-12 bg-zibara-cream/55 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream pt-24 md:pt-28">
      <div className="max-w-[1400px] mx-auto px-6 md:px-8">

        {/* Header */}
        <div className="mb-16 border-b border-zibara-cream/5 pb-10">
          <AnimatedHeading
            tag="h1"
            className="font-display font-light text-[clamp(3rem,9vw,8rem)] leading-none tracking-tight uppercase text-zibara-cream"
            style={{ fontFamily: 'var(--font-cormorant), serif' } as React.CSSProperties}
          >
            Categories
          </AnimatedHeading>
        </div>

        {/* Empty state */}
        {groupedProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <p className="text-[11px] font-mono text-zibara-cream/65 tracking-widest uppercase">No categories yet</p>
            <Link href="/shop" className="text-[10px] font-mono text-zibara-cream/65 hover:text-zibara-cream transition-colors uppercase border-b border-current pb-0.5">
              Browse all pieces →
            </Link>
          </div>
        )}

        {/* Categories */}
        {groupedProducts.map(({ category, products: catProducts }) => (
          <section key={category._id} id={category.slug} className="mb-20 scroll-mt-24">
            <div className="flex items-baseline justify-between mb-8 border-b border-zibara-cream/5 pb-4">
              <h2
                className="font-display font-light text-[clamp(1.5rem,3vw,2.5rem)] uppercase text-zibara-cream"
                style={{ fontFamily: 'var(--font-cormorant), serif' }}
              >
                {category.name}
              </h2>
              <span className="text-[9px] tracking-widest font-mono text-zibara-cream/55 uppercase">
                {catProducts.length} piece{catProducts.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {catProducts.map((product, i) => (
                <Link key={product._id} href={`/product/${product._id}`} className="group">
                  <div className="relative aspect-[3/4] overflow-hidden bg-zibara-espresso mb-3">
                    <ZibaraPlaceholder
                      label={product.name}
                      sublabel={category.name}
                      variant="default"
                      tone={i % 2 === 0 ? 'olive' : 'espresso'}
                      className="w-full h-full group-hover:scale-105 transition-transform duration-700"
                    />
                    {i === 0 && (
                      <span className="absolute top-3 left-3 text-[7px] tracking-[0.3em] font-mono bg-zibara-crimson text-zibara-cream px-1.5 py-0.5 uppercase">
                        New
                      </span>
                    )}
                    <div className="absolute bottom-0 inset-x-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-gradient-to-t from-zibara-black to-transparent">
                      <span className="text-[9px] tracking-widest font-mono text-zibara-cream/80 uppercase">View →</span>
                    </div>
                  </div>
                  <p className="text-[10px] uppercase tracking-wider font-mono text-zibara-cream/80 mb-0.5">{product.name}</p>
                  <p className="text-[11px] font-mono text-zibara-cream">{formatPrice(product.price)}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <div className="pb-16" />
      </div>
    </div>
  );
}
