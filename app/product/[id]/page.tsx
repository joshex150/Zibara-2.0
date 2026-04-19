'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Link } from 'next-view-transitions';
import { Minus, Plus, ChevronDown } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import AnimatedHeading from '@/components/AnimatedHeading';
import ZibaraPlaceholder from '@/components/ZibaraPlaceholder';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const { addToCart } = useCart();
  const { products, productsLoading } = useData();
  const { formatPrice } = useCurrency();

  const product = products.find((p) => p._id === params.id);
  const productColors = product?.colors?.length ? product.colors : [];

  const [selectedSize,       setSelectedSize]       = useState('');
  const [selectedColor,      setSelectedColor]      = useState(productColors[0]?.name ?? '');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity,           setQuantity]           = useState(1);
  const [detailsOpen,        setDetailsOpen]        = useState(true);
  const [careOpen,           setCareOpen]           = useState(false);
  const [addedToCart,        setAddedToCart]        = useState(false);

  useEffect(() => {
    if (productColors.length && (!selectedColor || !productColors.find(c => c.name === selectedColor))) {
      setSelectedColor(productColors[0].name);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes?.length && !selectedSize) {
      toast.error('Please select a size', { style: { background: '#0a0806', color: '#EFEFC9', border: '1px solid rgba(239,239,201,0.1)' } });
      return;
    }
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      image: product.images[0],
    });
    setAddedToCart(true);
    toast.success('Added to bag', { style: { background: '#0a0806', color: '#EFEFC9', border: '1px solid rgba(239,239,201,0.1)' } });
    setTimeout(() => setAddedToCart(false), 3000);
  };

  if (productsLoading) {
    return (
      <div className="fixed inset-0 bg-zibara-black flex items-center justify-center z-50">
        <div className="w-px h-12 bg-zibara-cream/50 animate-pulse" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-zibara-black flex flex-col items-center justify-center gap-4 pt-24">
        <p className="text-[11px] font-mono text-zibara-cream/70 tracking-widest uppercase">Piece not found</p>
        <Link href="/shop" className="text-[10px] font-mono text-zibara-cream/60 hover:text-zibara-cream transition-colors tracking-widest uppercase border-b border-current pb-0.5">
          Return to collection →
        </Link>
      </div>
    );
  }

  const relatedProducts = products.filter(p => p._id !== product._id && p.category === product.category).slice(0, 4);

  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream pt-20 md:pt-24">

      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-4">
        <div className="flex items-center gap-2 text-[9px] font-mono text-zibara-cream/60 tracking-widest uppercase">
          <Link href="/" className="hover:text-zibara-cream transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-zibara-cream transition-colors">Collection</Link>
          <span>/</span>
          <span className="text-zibara-cream">{product.name}</span>
        </div>
      </div>

      {/* Main product section */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 lg:gap-24">

          {/* ── LEFT: Image gallery ───────────── */}
          <div className="space-y-2">
            {/* Main image */}
            <div className="relative aspect-[3/4] overflow-hidden bg-zibara-espresso">
              <ZibaraPlaceholder
                label={product.name}
                sublabel={selectedColor || product.category || 'ZIBARASTUDIO'}
                variant="hero"
                tone={selectedImageIndex % 2 === 0 ? 'espresso' : 'crimson'}
                className="w-full h-full transition-opacity duration-400"
              />
              {!product.inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-zibara-black/50">
                  <span className="text-[11px] tracking-[0.4em] font-mono text-zibara-cream uppercase border border-zibara-cream/40 px-4 py-2">
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`relative flex-1 aspect-[3/4] overflow-hidden transition-all duration-300 ${
                      selectedImageIndex === i ? 'ring-1 ring-zibara-cream/60' : 'opacity-55 hover:opacity-90'
                    }`}
                  >
                    <ZibaraPlaceholder
                      label={`${product.name}`}
                      sublabel={`VIEW ${i + 1}`}
                      variant="compact"
                      tone={i % 2 === 0 ? 'deep' : 'olive'}
                      className="w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product info ───────────── */}
          <div className="md:sticky md:top-28 md:self-start space-y-8">
            {/* Category tag */}
            {product.category && (
              <p className="text-[9px] tracking-[0.4em] font-mono text-zibara-cream/60 uppercase">
                {product.category}
              </p>
            )}

            {/* Product name */}
            <AnimatedHeading
              tag="h1"
              className="font-display font-light text-[clamp(2rem,4vw,3.5rem)] leading-tight text-zibara-cream uppercase"
              style={{ fontFamily: 'var(--font-cormorant), serif' } as React.CSSProperties}
            >
              {product.name}
            </AnimatedHeading>

            {/* Price */}
            <p className="text-2xl font-mono text-zibara-cream">
              {formatPrice(product.price)}
            </p>

            {/* Description */}
            {product.description && (
              <p className="text-[11px] font-mono text-zibara-cream/75 leading-loose max-w-sm">
                {product.description}
              </p>
            )}

            {/* Color selector */}
            {productColors.length > 0 && (
              <div className="space-y-3">
                <p className="text-[9px] tracking-[0.35em] font-mono text-zibara-cream/60 uppercase">
                  Colour — <span className="text-zibara-cream">{selectedColor}</span>
                </p>
                <div className="flex gap-3 flex-wrap">
                  {productColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                      className={`w-7 h-7 rounded-full transition-all duration-200 ${
                        selectedColor === color.name
                          ? 'ring-1 ring-offset-2 ring-offset-zibara-black ring-zibara-cream/60'
                          : 'ring-1 ring-transparent hover:ring-zibara-cream/20'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {product.sizes?.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] tracking-[0.35em] font-mono text-zibara-cream/60 uppercase">Size</p>
                  <Link href="/size-guide" className="text-[9px] tracking-widest font-mono text-zibara-cream/55 hover:text-zibara-cream transition-colors uppercase border-b border-current pb-0">
                    Size guide
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[44px] px-3 py-2 text-[10px] tracking-widest font-mono uppercase transition-all duration-200 border ${
                        selectedSize === size
                          ? 'bg-zibara-cream text-zibara-black border-zibara-cream'
                          : 'bg-transparent text-zibara-cream/75 border-zibara-cream/20 hover:border-zibara-cream/55 hover:text-zibara-cream'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <p className="text-[9px] tracking-[0.35em] font-mono text-zibara-cream/60 uppercase">Quantity</p>
              <div className="inline-flex items-center border border-zibara-cream/25">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-zibara-cream/65 hover:text-zibara-cream transition-colors"
                >
                  <Minus size={12} />
                </button>
                <span className="w-10 text-center text-[11px] font-mono text-zibara-cream">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-zibara-cream/65 hover:text-zibara-cream transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            {/* Add to bag */}
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`w-full py-4 text-[10px] tracking-[0.4em] uppercase font-mono transition-all duration-300 ${
                !product.inStock
                  ? 'bg-zibara-espresso text-zibara-cream/50 cursor-not-allowed'
                  : addedToCart
                  ? 'bg-zibara-cream text-zibara-black'
                  : 'bg-zibara-crimson text-zibara-cream hover:bg-zibara-blood'
              }`}
            >
              {!product.inStock ? 'Sold Out' : addedToCart ? 'Added to Bag ✓' : 'Add to Bag'}
            </button>

            {/* Accordion: Details */}
            <div className="border-t border-zibara-cream/10">
              <button
                onClick={() => setDetailsOpen(o => !o)}
                className="w-full flex items-center justify-between py-4 text-[10px] tracking-[0.35em] font-mono text-zibara-cream/70 hover:text-zibara-cream transition-colors uppercase"
              >
                Details
                <ChevronDown size={14} className={`transition-transform duration-300 ${detailsOpen ? 'rotate-180' : ''}`} />
              </button>
              {detailsOpen && (
                <div className="pb-4 space-y-2 text-[10px] font-mono text-zibara-cream/70 leading-loose">
                  {product.material && <p>Material: {product.material}</p>}
                  {product.sizes?.length > 0 && <p>Available sizes: {product.sizes.join(', ')}</p>}
                  {product.description && <p>{product.description}</p>}
                </div>
              )}
            </div>

            {/* Accordion: Care */}
            {product.care?.length > 0 && (
              <div className="border-t border-zibara-cream/10">
                <button
                  onClick={() => setCareOpen(o => !o)}
                  className="w-full flex items-center justify-between py-4 text-[10px] tracking-[0.35em] font-mono text-zibara-cream/70 hover:text-zibara-cream transition-colors uppercase"
                >
                  Care Instructions
                  <ChevronDown size={14} className={`transition-transform duration-300 ${careOpen ? 'rotate-180' : ''}`} />
                </button>
                {careOpen && (
                  <ul className="pb-4 space-y-1">
                    {product.care.map((c: string, i: number) => (
                      <li key={i} className="text-[10px] font-mono text-zibara-cream/70">— {c}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="border-t border-zibara-cream/10 pt-4">
              <p className="text-[9px] font-mono text-zibara-cream/55 tracking-wider">
                Free returns within 14 days · Secure checkout
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-8 py-16 border-t border-zibara-cream/10">
          <div className="flex items-center justify-between mb-8">
            <p className="text-[10px] tracking-[0.4em] font-mono text-zibara-cream/60 uppercase">You may also consider</p>
            <Link href="/shop" className="text-[10px] tracking-widest font-mono text-zibara-cream/55 hover:text-zibara-cream transition-colors uppercase">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p, i) => (
              <Link key={p._id} href={`/product/${p._id}`} className="group">
                <div className="aspect-[3/4] overflow-hidden bg-zibara-espresso mb-3">
                  <ZibaraPlaceholder
                    label={p.name}
                    sublabel={p.category || 'RELATED'}
                    variant="compact"
                    tone={(['espresso','crimson','deep','olive'] as const)[i % 4]}
                    className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="text-[9px] uppercase tracking-wider font-mono text-zibara-cream/80 mb-0.5">{p.name}</p>
                <p className="text-[10px] font-mono text-zibara-cream">{formatPrice(p.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
