'use client';

import { useData } from '@/context/DataContext';
import { Link } from 'next-view-transitions';
import AnimatedHeading from '@/components/AnimatedHeading';
import AnimatedText from '@/components/AnimatedText';
import ParallaxImage from '@/components/ParallaxImage';
import ZibaraPlaceholder from '@/components/ZibaraPlaceholder';
import BrandLoader from '@/components/BrandLoader';

export default function CollectionsPage() {
  const { collections, collectionsLoading } = useData();

  const featured   = collections.filter(c => c.featured);
  const remaining  = collections.filter(c => !c.featured);

  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream pt-24 md:pt-28">
      <div className="max-w-[1400px] mx-auto px-6 md:px-8">

        {/* Page header */}
        <div className="mb-16 border-b border-zibara-cream/5 pb-10">
          <AnimatedHeading
            tag="h1"
            className="font-display font-light text-[clamp(3rem,9vw,8rem)] leading-none tracking-tight uppercase text-zibara-cream"
            style={{ fontFamily: 'var(--font-cormorant), serif' } as React.CSSProperties}
          >
            Collections
          </AnimatedHeading>
          <AnimatedText
            delay={0.2}
            className="mt-4 text-[10px] tracking-[0.4em] font-mono text-zibara-cream/55 uppercase"
            onScroll={false}
          >
            Seasonal drops for rooms where taste is understood.
          </AnimatedText>
        </div>

        {collectionsLoading && collections.length === 0 && (
          <div className="flex justify-center py-16 md:py-24">
            <BrandLoader
              fullScreen={false}
              label="Collections"
              sublabel="ZIBARASTUDIO"
              tone="deep"
              variant="compact"
              className="w-44 md:w-56"
            />
          </div>
        )}

        {/* Empty state */}
        {!collectionsLoading && collections.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <p className="text-[11px] font-mono text-zibara-cream/65 tracking-widest uppercase">
              Collections forthcoming
            </p>
            <Link href="/shop" className="text-[10px] font-mono text-zibara-cream/65 hover:text-zibara-cream transition-colors uppercase border-b border-current pb-0.5">
              Browse the full collection →
            </Link>
          </div>
        )}

        {/* Featured collections — large format */}
        {!collectionsLoading && featured.length > 0 && (
          <div className="space-y-2 mb-4">
            {featured.map((col, i) => (
              <Link key={col._id} href={`/collections/${col.slug}`} className="group block relative overflow-hidden [view-transition-name:none]">
                <div className={`relative overflow-hidden ${i === 0 ? 'aspect-[16/9] md:aspect-[21/8]' : 'aspect-[16/7] md:aspect-[21/6]'}`}>
                  <ParallaxImage
                    alt={col.name}
                    sublabel={`${col.season} ${col.year}`}
                    tone={i === 0 ? 'crimson' : 'deep'}
                    variant="hero"
                    className="w-full h-full"
                    speed={0.15}
                  />
                  <div className={`absolute inset-0 transition-all duration-500 ${
                    i === 0
                      ? 'bg-gradient-to-r from-zibara-black/65 to-zibara-black/10 group-hover:from-zibara-black/50'
                      : 'bg-gradient-to-b from-transparent via-zibara-black/20 to-zibara-black/80 group-hover:to-zibara-black/60'
                  }`} />
                  <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                    <p className="text-[9px] tracking-[0.4em] font-mono text-zibara-cream/70 uppercase mb-2">
                      {col.season} {col.year}
                    </p>
                    <h2
                      className="font-display font-light text-[clamp(2rem,5vw,5rem)] text-zibara-cream uppercase leading-tight group-hover:translate-x-2 transition-transform duration-400"
                      style={{ fontFamily: 'var(--font-cormorant), serif' }}
                    >
                      {col.name}
                    </h2>
                    {col.description && (
                      <p className="mt-2 text-[10px] font-mono text-zibara-cream/75 max-w-md line-clamp-2">
                        {col.description}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-2 text-[9px] tracking-widest font-mono text-zibara-cream/75 uppercase border-b border-zibara-cream/40 pb-0.5 w-fit">
                      {col.productIds?.length ?? 0} pieces · Explore →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Grid for remaining collections */}
        {!collectionsLoading && remaining.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 mb-24">
            {remaining.map((col) => (
              <Link key={col._id} href={`/collections/${col.slug}`} className="group [view-transition-name:none]">
                <div className="relative overflow-hidden aspect-[4/3]">
                  {col.coverImage ? (
                    <ZibaraPlaceholder label={col.name} sublabel={`${col.season} ${col.year}`} variant="default" tone="crimson" className="w-full h-full group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <ZibaraPlaceholder label={col.name} sublabel={`${col.season} ${col.year}`} variant="default" tone="espresso" className="w-full h-full group-hover:scale-105 transition-transform duration-700" />
                  )}
                  <div className="absolute inset-0 bg-zibara-black/30 group-hover:bg-zibara-black/15 transition-all duration-400" />
                </div>
                <div className="pt-4 pb-2">
                  <p className="text-[8px] tracking-[0.4em] font-mono text-zibara-cream/45 uppercase mb-1.5">
                    {col.season} {col.year}
                  </p>
                  <h2 className="font-display font-light text-xl text-zibara-cream uppercase leading-tight"
                    style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                    {col.name}
                  </h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[8px] tracking-widest font-mono text-zibara-cream/50 uppercase">
                      {col.productIds?.length ?? 0} pieces
                    </span>
                    <span className="text-zibara-cream/20 text-[8px]">·</span>
                    <span className="text-[8px] tracking-widest font-mono text-zibara-cream/50 uppercase group-hover:text-zibara-cream/75 transition-colors">
                      Explore →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA — if all collections shown */}
        {!collectionsLoading && collections.length > 0 && (
          <div className="flex justify-center pb-24 border-t border-zibara-cream/5 pt-12">
            <Link
              href="/shop"
              className="text-[10px] tracking-[0.4em] uppercase font-mono text-zibara-cream/65 hover:text-zibara-cream transition-colors border-b border-current pb-0.5"
            >
              Browse all pieces →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
