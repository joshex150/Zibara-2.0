import type { Product } from '@/context/DataContext';
import ProductImage, { pickTone } from './ProductImage';

type Tone = 'espresso' | 'crimson' | 'olive' | 'deep';
type Variant = 'hero' | 'default' | 'compact';

interface ProductCardMediaProps {
  product: Pick<Product, '_id' | 'name' | 'images' | 'category' | 'inStock'>;
  sublabel?: string;
  tone?: Tone;
  variant?: Variant;
  className?: string;
  imageClassName?: string;
  showNew?: boolean;
  showCta?: boolean;
}

export default function ProductCardMedia({
  product,
  sublabel,
  tone,
  variant = 'default',
  className = '',
  imageClassName = '',
  showNew = false,
  showCta = true,
}: ProductCardMediaProps) {
  return (
    <div className={`relative overflow-hidden bg-zibara-espresso ${className}`}>
      <ProductImage
        src={product.images[0]}
        name={product.name}
        sublabel={sublabel ?? product.category ?? 'THE COLLECTION'}
        variant={variant}
        tone={tone ?? pickTone(product._id)}
        className={`w-full h-full transition-transform duration-700 ease-out group-hover:scale-105 ${imageClassName}`}
      />

      {product.images[1] && (
        <ProductImage
          src={product.images[1]}
          name={product.name}
          sublabel="SECOND LOOK"
          variant={variant}
          tone="deep"
          className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />
      )}

      {showNew && (
        <span className="absolute top-3 left-3 text-[7px] tracking-[0.3em] font-mono border border-zibara-cream/40 text-zibara-cream/80 px-1.5 py-0.5 uppercase">
          New
        </span>
      )}

      {!product.inStock && (
        <span className="absolute top-3 right-3 text-[7px] tracking-[0.3em] font-mono bg-zibara-espresso/80 text-zibara-cream/70 px-1.5 py-0.5 uppercase">
          Sold out
        </span>
      )}

      {showCta && (
        <div className="absolute bottom-0 inset-x-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out bg-gradient-to-t from-zibara-black to-transparent">
          <span className="text-[9px] tracking-widest font-mono text-zibara-cream/70 uppercase">
            View piece →
          </span>
        </div>
      )}
    </div>
  );
}
