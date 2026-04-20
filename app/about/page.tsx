'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import { Link } from 'next-view-transitions';
import AnimatedHeading from '@/components/AnimatedHeading';
import AnimatedText from '@/components/AnimatedText';
import ParallaxImage from '@/components/ParallaxImage';
import BrandLoader from '@/components/BrandLoader';

export default function AboutPage() {
  const { getContentValue, siteContentLoading } = useData();

  if (siteContentLoading) return <BrandLoader label="About" sublabel="ZIBARASTUDIO" tone="deep" />;

  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream">

      {/* Hero */}
      <section className="relative w-full h-screen overflow-hidden">
        <ParallaxImage
          alt="ZIBARASTUDIO — About"
          sublabel="THE STUDIO"
          tone="deep"
          variant="hero"
          className="absolute inset-0 w-full h-full"
          speed={0.25}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zibara-black/40 via-zibara-black/10 to-zibara-black" />

        <div className="absolute bottom-12 left-6 md:left-12 right-6 md:right-auto max-w-[min(90vw,720px)]">
          <AnimatedHeading
            tag="h1"
            delay={0.3}
            className="font-display font-light text-[clamp(2.6rem,6.5vw,7rem)] leading-none tracking-tight uppercase text-zibara-cream"
            style={{ fontFamily: 'var(--font-cormorant), serif' } as React.CSSProperties}
          >
            The Studio
          </AnimatedHeading>
        </div>
      </section>

      {/* Brand statement */}
      <section className="max-w-[900px] mx-auto px-6 md:px-8 py-24 md:py-32 text-center">
        <AnimatedHeading
          tag="h2"
          onScroll
          className="font-display font-light italic text-[clamp(1.5rem,3.5vw,3rem)] leading-relaxed text-zibara-cream/80"
          style={{ fontFamily: 'var(--font-cormorant), serif' } as React.CSSProperties}
        >
          {getContentValue('about_story_title', 'We do not make clothing. We make the version of you the world sees.')}
        </AnimatedHeading>
      </section>

      {/* Story — two column */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-8 mb-24 md:mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
          <div className="relative aspect-[3/4] overflow-hidden bg-zibara-espresso">
            <ParallaxImage
              alt="ZIBARASTUDIO workspace"
              sublabel="WORKSPACE"
              tone="espresso"
              variant="default"
              className="w-full h-full"
              speed={0.18}
            />
          </div>

          <div className="space-y-8">
            <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase">Origin</p>
            <AnimatedHeading
              tag="h2"
              onScroll
              className="font-display font-light text-[clamp(2rem,3vw,2.8rem)] leading-tight text-zibara-cream uppercase"
              style={{ fontFamily: 'var(--font-cormorant), serif' } as React.CSSProperties}
            >
              {getContentValue('about_headline', 'Born at the intersection of African identity and future thinking.')}
            </AnimatedHeading>

            <AnimatedText
              onScroll
              className="text-[11px] font-mono text-zibara-cream/70 leading-loose"
            >
              {getContentValue('about_story_text', 'ZIBARASTUDIO was built for the woman who moves through spaces where taste is the currency. Afro-futurism, not through the lens of tradition, but through silhouette, intention, and the architecture of the woman wearing it. Shape over pattern. Form over graphics. The African story pushed ahead of time.')}
            </AnimatedText>

            <div className="border-l-2 border-zibara-cream/20 pl-6 mt-6 space-y-2">
              {[
                '(African Influence)',
                '+ (Future Thinking)',
                '+ (Intentional Design)',
                '− (Noise)',
              ].map((line) => (
                <p key={line}
                  className="font-display font-light italic text-[clamp(1rem,1.6vw,1.35rem)] text-zibara-cream/70 leading-tight"
                  style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy — 3 pillars */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-8 mb-24 md:mb-32">
        <div className="border-t border-zibara-cream/5 pt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              number: '01',
              title: 'The Ruler',
              body: 'Power. Control. Status. The Zibara woman commands her space — not by announcement, but by presence.',
            },
            {
              number: '02',
              title: 'The Creator',
              body: 'Innovation. Expression. Artistic intelligence. Every piece is a statement that transcends season.',
            },
            {
              number: '03',
              title: 'The Mystic',
              body: 'Depth. Mystery. Spiritual undertone. Fashion becomes armor and poetry simultaneously.',
            },
          ].map((pillar) => (
            <div key={pillar.number} className="space-y-4">
              <p className="text-[8px] tracking-[0.4em] font-mono text-zibara-cream/60 uppercase">{pillar.number}</p>
              <AnimatedHeading
                tag="h3"
                onScroll
                className="font-display font-light text-2xl text-zibara-cream uppercase"
                style={{ fontFamily: 'var(--font-cormorant), serif' } as React.CSSProperties}
              >
                {pillar.title}
              </AnimatedHeading>
              <p className="text-[11px] font-mono text-zibara-cream/65 leading-loose">{pillar.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Full-width editorial image */}
      <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden mb-24">
        <ParallaxImage
          alt="ZIBARASTUDIO editorial"
          sublabel="EDITORIAL"
          tone="crimson"
          variant="hero"
          className="w-full h-full"
          speed={0.2}
        />
        <div className="absolute inset-0 bg-zibara-black/40 flex items-center justify-center">
          <p
            className="font-display font-light text-[clamp(1.5rem,4vw,4rem)] text-zibara-cream/80 text-center uppercase px-8"
            style={{ fontFamily: 'var(--font-cormorant), serif' }}
          >
            &ldquo;You belong in rooms where taste is understood.&rdquo;
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center text-center pb-24 gap-6 px-6">
        <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase">Explore</p>
        <AnimatedHeading
          tag="h2"
          onScroll
          className="font-display font-light text-[clamp(2rem,5vw,4rem)] text-zibara-cream uppercase"
          style={{ fontFamily: 'var(--font-cormorant), serif' } as React.CSSProperties}
        >
          For nights that matter.
        </AnimatedHeading>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Link
            href="/shop"
            className="px-10 py-4 border border-zibara-cream/35 text-[10px] tracking-[0.4em] font-mono text-zibara-cream/80 uppercase hover:bg-zibara-cream hover:text-zibara-black transition-all duration-300"
          >
            Shop Collection
          </Link>
          <Link
            href="/contact"
            className="px-10 py-4 text-[10px] tracking-[0.4em] font-mono text-zibara-cream/60 uppercase hover:text-zibara-cream transition-colors duration-300"
          >
            Get in touch →
          </Link>
        </div>
      </section>
    </div>
  );
}
