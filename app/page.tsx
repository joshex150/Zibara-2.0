"use client";

import React, { useState, useEffect } from "react";
import { Link } from "next-view-transitions";
import { useData } from "@/context/DataContext";
import { useCurrency } from "@/context/CurrencyContext";
import Preloader from "@/components/Preloader";
import AnimatedHeading from "@/components/AnimatedHeading";
import AnimatedText from "@/components/AnimatedText";
import ParallaxImage from "@/components/ParallaxImage";
import ZibaraPlaceholder from "@/components/ZibaraPlaceholder";

export default function Home() {
  const {
    products,
    productsLoading,
    siteContentLoading,
    categories,
    categoriesLoading,
  } = useData();
  const { formatPrice } = useCurrency();
  const [shouldShowPreloader, setShouldShowPreloader] = useState(true);
  const [preloaderDone, setPreloaderDone] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("zibara_loaded") === "1") {
      setShouldShowPreloader(false);
      setPreloaderDone(true);
    }
  }, []);

  const handlePreloaderComplete = () => {
    sessionStorage.setItem("zibara_loaded", "1");
    setPreloaderDone(true);
    setShouldShowPreloader(false);
  };

  const isLoading = productsLoading || siteContentLoading || categoriesLoading;
  const featuredProducts = products.slice(0, 4);
  const editorialProducts = products.slice(4, 8);

  const categoryCards = categories
    .filter((cat) => cat.isActive)
    .map((category) => {
      const count = products.filter((p) => p.category === category.name).length;
      const categoryProduct = products.find(
        (p) => p.category === category.name,
      );
      const image = category.image || categoryProduct?.images[0] || "";
      return { name: category.name, slug: category.slug, image, count };
    })
    .filter((c) => c.count > 0);

  return (
    <>
      {shouldShowPreloader && !preloaderDone && (
        <Preloader onComplete={handlePreloaderComplete} />
      )}

      <div
        className="min-h-screen bg-zibara-black text-zibara-cream"
        style={{
          opacity: !shouldShowPreloader || preloaderDone ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      >
        {/* ── HERO ─────────────────────────────────────── */}
        <section className="relative w-full h-screen overflow-hidden">
          <ParallaxImage
            alt="ZIBARASTUDIO hero"
            sublabel="SEASON III"
            tone="crimson"
            variant="hero"
            className="absolute inset-0 w-full h-full"
            speed={0.25}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zibara-black/30 via-transparent to-zibara-black/80" />

          <div className="absolute bottom-12 left-6 md:left-12 max-w-xl">
            <AnimatedHeading
              tag="h1"
              delay={preloaderDone || !shouldShowPreloader ? 0.1 : 2.8}
              className="font-display font-light text-zibara-cream text-[clamp(3rem,10vw,8rem)] leading-[0.9] tracking-tight uppercase"
              style={
                {
                  fontFamily: "var(--font-cormorant), serif",
                } as React.CSSProperties
              }
            >
              For nights that matter.
            </AnimatedHeading>

            <AnimatedText
              delay={preloaderDone || !shouldShowPreloader ? 0.4 : 3.2}
              className="mt-6 text-[12px] tracking-[0.3em] font-mono text-zibara-cream/70 uppercase"
              onScroll={false}
            >
              Silhouette over decoration. Form over noise.
            </AnimatedText>

            <div className="mt-8 flex items-center gap-6">
              <Link
                href="/shop"
                className="inline-flex items-center gap-3 text-[11px] tracking-[0.35em] uppercase font-mono text-zibara-cream/80 hover:text-zibara-cream border-b border-zibara-cream/40 hover:border-zibara-cream pb-0.5 transition-all duration-300"
              >
                Explore the collection <span className="text-base">→</span>
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          {/* <div className="absolute bottom-12 right-6 md:right-12 flex flex-col items-center gap-2">
            <div className="w-px h-12 bg-gradient-to-b from-transparent to-zibara-cream/50" />
            <span className="text-[9px] tracking-[0.3em] font-mono text-zibara-cream/50 uppercase rotate-90 origin-center mt-2">
              Scroll
            </span>
          </div> */}
        </section>

        {/* ── BRAND STATEMENT ──────────────────────────── */}
        <section className="max-w-[900px] mx-auto px-6 md:px-8 py-24 md:py-32">
          <AnimatedHeading
            tag="h2"
            onScroll
            className="font-display font-light text-[clamp(1.8rem,4vw,3.5rem)] leading-tight text-zibara-cream text-center"
            style={
              {
                fontFamily: "var(--font-cormorant), serif",
              } as React.CSSProperties
            }
          >
            Afro-futurism built on the architecture of the African woman.
          </AnimatedHeading>
          <AnimatedText
            onScroll
            className="mt-6 text-[12px] tracking-widest font-mono text-zibara-cream/55 text-center uppercase"
          >
            Shape over pattern. Form over graphics. Presence over noise.
          </AnimatedText>
        </section>

        {/* ── FEATURED PRODUCTS ────────────────────────── */}
        {!isLoading && featuredProducts.length > 0 && (
          <section className="px-6 md:px-8 mb-24 max-w-[1400px] mx-auto">
            <div className="flex items-baseline justify-between mb-10">
              <span className="text-[11px] tracking-[0.4em] font-mono text-zibara-cream/55 uppercase">
                New Season
              </span>
              <Link
                href="/shop"
                className="text-[11px] tracking-[0.3em] font-mono text-zibara-cream/55 hover:text-zibara-cream transition-colors uppercase"
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {featuredProducts.map((product, i) => (
                <Link
                  key={product._id}
                  href={`/product/${product._id}`}
                  className="group"
                >
                  <div className="relative overflow-hidden aspect-[3/4] bg-zibara-espresso mb-3">
                    <ZibaraPlaceholder
                      label={product.name}
                      sublabel={product.category || "NEW SEASON"}
                      variant="default"
                      tone={i % 2 === 0 ? "espresso" : "crimson"}
                      className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-zibara-black/0 group-hover:bg-zibara-black/40 transition-all duration-500 flex items-end p-5">
                      <span className="text-[10px] tracking-widest font-mono text-zibara-cream opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase">
                        View piece →
                      </span>
                    </div>
                    {i === 0 && (
                      <span className="absolute top-3 left-3 text-[8px] tracking-[0.3em] font-mono bg-zibara-crimson text-zibara-cream px-2 py-1 uppercase">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] md:text-[11px] uppercase tracking-wider font-mono text-zibara-cream/70 mb-1">
                    {product.name}
                  </p>
                  <p className="text-[12px] md:text-sm font-mono text-zibara-cream">
                    {formatPrice(product.price)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── EDITORIAL SPLIT ──────────────────────────── */}
        <section className="w-full mb-24 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left — large image */}
            <div className="relative aspect-[4/5] md:aspect-auto md:h-[80vh] overflow-hidden">
              <ParallaxImage
                alt="ZIBARASTUDIO editorial"
                sublabel="MINUTES BEFORE MIDNIGHT"
                tone="espresso"
                variant="hero"
                className="w-full h-full"
                speed={0.2}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zibara-black/70 to-transparent" />
              <div className="absolute bottom-8 left-8">
                <p className="text-[10px] tracking-[0.4em] font-mono text-zibara-cream/60 uppercase mb-2">
                  Season III
                </p>
                <p
                  className="text-3xl md:text-5xl font-light text-zibara-cream uppercase"
                  style={{ fontFamily: "var(--font-cormorant), serif" }}
                >
                  Minutes Before
                  <br />
                  Midnight
                </p>
              </div>
            </div>

            {/* Right — text + product grid */}
            <div className="bg-zibara-deep flex flex-col justify-between p-10 md:p-16">
              <div>
                <AnimatedHeading
                  tag="h2"
                  onScroll
                  className="font-display font-light text-[clamp(1.5rem,3vw,2.5rem)] leading-tight text-zibara-cream mb-6"
                  style={
                    {
                      fontFamily: "var(--font-cormorant), serif",
                    } as React.CSSProperties
                  }
                >
                  She looks in the mirror and evaluates.
                </AnimatedHeading>
                <AnimatedText
                  onScroll
                  className="text-[12px] font-mono text-zibara-cream/65 leading-loose tracking-wide"
                >
                  Is this the version of me I want the world to see tonight?
                  That exact moment — composed, poised, certain — is where
                  ZIBARASTUDIO lives.
                </AnimatedText>
                <Link
                  href="/collections"
                  className="inline-flex items-center gap-2 mt-8 text-[11px] tracking-[0.3em] uppercase font-mono text-zibara-cream/70 hover:text-zibara-cream border-b border-zibara-cream/30 hover:border-zibara-cream pb-0.5 transition-all duration-300"
                >
                  Explore Collections →
                </Link>
              </div>

              {editorialProducts.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-12">
                  {editorialProducts.slice(0, 2).map((product) => (
                    <Link
                      key={product._id}
                      href={`/product/${product._id}`}
                      className="group"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-zibara-espresso mb-2">
                        <ZibaraPlaceholder
                          label={product.name}
                          sublabel={product.category || "EDITORIAL"}
                          variant="compact"
                          tone="deep"
                          className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <p className="text-[10px] uppercase tracking-wider font-mono text-zibara-cream/60">
                        {product.name}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── CATEGORIES ───────────────────────────────── */}
        {!isLoading && categoryCards.length > 0 && (
          <section className="px-6 md:px-8 mb-24 max-w-[1400px] mx-auto">
            <div className="flex items-baseline justify-between mb-10">
              <p className="text-[11px] tracking-[0.4em] font-mono text-zibara-cream/55 uppercase">
                Shop by Category
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {categoryCards.slice(0, 4).map((cat) => (
                <Link
                  key={cat.name}
                  href={`/categories#${cat.slug}`}
                  className="group"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-zibara-espresso mb-3">
                    {cat.image ? (
                      <ZibaraPlaceholder
                        label={cat.name}
                        sublabel="CATEGORY"
                        variant="default"
                        tone="espresso"
                        className="w-full h-full group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <ZibaraPlaceholder
                        label={cat.name}
                        sublabel="CATEGORY"
                        variant="default"
                        tone="olive"
                        className="w-full h-full"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zibara-black/80 via-transparent to-transparent flex items-end p-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider font-mono text-zibara-cream mb-0.5">
                          {cat.name}
                        </p>
                        <p className="text-[10px] font-mono text-zibara-cream/60">
                          {cat.count} pieces
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── CUSTOM ORDER BANNER ──────────────────────── */}
        <section className="relative w-full mb-24 overflow-hidden">
          <div className="relative h-[420px] md:h-auto md:aspect-[21/7]">
            <ParallaxImage
              alt="Zibara Custom Order"
              sublabel="BESPOKE"
              tone="deep"
              variant="hero"
              className="absolute inset-0 w-full h-full"
              speed={0.2}
            />
            <div className="absolute inset-0 bg-zibara-black/55" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
              <p className="text-[11px] tracking-[0.5em] font-mono text-zibara-cream/60 uppercase mb-4">
                Bespoke
              </p>
              <AnimatedHeading
                tag="h2"
                onScroll
                className="font-display font-light text-[clamp(2rem,5vw,4rem)] text-zibara-cream uppercase leading-tight mb-8 max-w-[20ch]"
                style={
                  {
                    fontFamily: "var(--font-cormorant), serif",
                  } as React.CSSProperties
                }
              >
                Made for your exact silhouette.
              </AnimatedHeading>
              <Link
                href="/custom-order"
                className="inline-flex items-center gap-3 text-[10px] tracking-[0.35em] uppercase font-mono border border-zibara-cream/50 text-zibara-cream/90 px-6 md:px-8 py-3 hover:bg-zibara-cream hover:text-zibara-black transition-all duration-300"
              >
                Start your custom order
              </Link>
            </div>
          </div>
        </section>

        {/* ── ASYMMETRIC EDITORIAL GRID ────────────────── */}
        {!isLoading && products.length >= 5 && (
          <section className="px-6 md:px-8 mb-24 max-w-[1400px] mx-auto">
            <div className="flex items-baseline justify-between mb-10">
              <span className="text-[11px] tracking-[0.4em] font-mono text-zibara-cream/55 uppercase">
                Curated for you
              </span>
            </div>

            {/* Desktop asymmetric 3-col grid */}
            <div
              className="hidden md:grid grid-cols-3 gap-4"
              style={{ gridTemplateRows: "auto auto" }}
            >
              <Link
                href={`/product/${products[0]._id}`}
                className="row-span-2 relative overflow-hidden group bg-zibara-espresso"
                style={{ minHeight: "600px" }}
              >
                <ZibaraPlaceholder
                  label={products[0].name}
                  sublabel={products[0].category || "CURATED"}
                  variant="hero"
                  tone="crimson"
                  className="w-full h-full group-hover:scale-105 transition-transform duration-700 absolute inset-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zibara-black/85 via-zibara-black/10 to-transparent flex items-end p-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider font-mono text-zibara-cream mb-1">
                      {products[0].name}
                    </p>
                    <p className="text-sm font-mono text-zibara-cream/70">
                      {formatPrice(products[0].price)}
                    </p>
                  </div>
                </div>
              </Link>

              {[products[1], products[2], products[3], products[4]].map((p) => (
                <Link
                  key={p._id}
                  href={`/product/${p._id}`}
                  className="relative overflow-hidden group bg-zibara-espresso aspect-[4/3]"
                >
                  <ZibaraPlaceholder
                    label={p.name}
                    sublabel={p.category || "CURATED"}
                    variant="compact"
                    tone="espresso"
                    className="w-full h-full group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-zibara-black/0 group-hover:bg-zibara-black/50 transition-all duration-500 flex items-end p-4">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-[10px] uppercase tracking-wider font-mono text-zibara-cream">
                        {p.name}
                      </p>
                      <p className="text-[11px] font-mono text-zibara-cream/70">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile 2-col grid */}
            <div className="md:hidden grid grid-cols-2 gap-3">
              {products.slice(0, 6).map((p) => (
                <Link key={p._id} href={`/product/${p._id}`} className="group">
                  <div className="relative aspect-[3/4] overflow-hidden bg-zibara-espresso mb-2">
                    <ZibaraPlaceholder
                      label={p.name}
                      sublabel={p.category || "CURATED"}
                      variant="compact"
                      tone="deep"
                      className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <p className="text-[10px] uppercase tracking-wider font-mono text-zibara-cream/65">
                    {p.name}
                  </p>
                  <p className="text-[11px] font-mono text-zibara-cream/90">
                    {formatPrice(p.price)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── MARQUEE ──────────────────────────────────── */}
        <section className="overflow-hidden border-y border-zibara-cream/10 py-5 mb-24">
          <div className="marquee-track">
            {Array(8)
              .fill(
                "ZIBARASTUDIO · AFRO-FUTURISM · LAGOS · ABUJA · LONDON · FOR THE WOMAN WHO ARRIVES COMPOSED · ",
              )
              .map((t, i) => (
                <span
                  key={i}
                  className="text-[11px] tracking-[0.5em] uppercase font-mono text-zibara-cream/72 mr-8 whitespace-nowrap"
                >
                  {t}
                </span>
              ))}
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              name: "ZIBARASTUDIO",
              description:
                "Afro-futurist fashion for the woman who arrives composed.",
              url: "https://zibarastudio.com",
              address: { "@type": "PostalAddress", addressCountry: "NG" },
            }),
          }}
        />
      </div>
    </>
  );
}
