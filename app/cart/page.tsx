'use client';

import React from 'react';
import { Link } from 'next-view-transitions';
import { Minus, Plus, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import ZibaraPlaceholder from '@/components/ZibaraPlaceholder';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { formatPrice } = useCurrency();

  const shippingUSD = cartTotal > 500 ? 0 : 15;
  const totalUSD    = cartTotal + shippingUSD;

  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream pt-24 md:pt-28">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 pb-24">

        {/* Header */}
        <div className="mb-12 border-b border-zibara-cream/5 pb-8">
          <h1
            className="font-display font-light text-[clamp(2.5rem,7vw,6rem)] leading-none uppercase text-zibara-cream"
            style={{ fontFamily: 'var(--font-cormorant), serif' }}
          >
            Your Bag
          </h1>
          <p className="mt-3 text-[10px] tracking-[0.4em] font-mono text-zibara-cream/65 uppercase">
            {cart.length} {cart.length === 1 ? 'piece' : 'pieces'}
          </p>
        </div>

        {/* Empty state */}
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <p className="text-[11px] font-mono text-zibara-cream/75 tracking-widest uppercase">Your bag is empty</p>
            <Link href="/shop" className="text-[10px] tracking-[0.35em] font-mono text-zibara-cream/65 hover:text-zibara-cream transition-colors uppercase border-b border-current pb-0.5">
              Explore the collection →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

            {/* Cart items */}
            <div className="lg:col-span-2 space-y-0">
              {cart.map((item, i) => (
                <div
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="flex gap-5 py-6 border-b border-zibara-cream/10"
                >
                  {/* Image */}
                  <div className="w-24 md:w-32 flex-shrink-0 aspect-[3/4] overflow-hidden bg-zibara-espresso">
                    <ZibaraPlaceholder
                      label={item.name}
                      sublabel={item.color || item.size || 'BAG ITEM'}
                      variant="compact"
                      tone="espresso"
                      className="w-full h-full"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-wider font-mono text-zibara-cream/80">{item.name}</p>
                          <div className="flex gap-3 mt-1">
                            {item.size  && <p className="text-[9px] font-mono text-zibara-cream/70 uppercase">{item.size}</p>}
                            {item.color && <p className="text-[9px] font-mono text-zibara-cream/70 uppercase">{item.color}</p>}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id, item.size, item.color)}
                          className="text-zibara-cream/55 hover:text-zibara-cream transition-colors mt-0.5"
                          aria-label="Remove"
                        >
                          <X size={14} strokeWidth={1.2} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity */}
                      <div className="inline-flex items-center border border-zibara-cream/25">
                        <button
                          onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1), item.color)}
                          className="w-8 h-8 flex items-center justify-center text-zibara-cream/65 hover:text-zibara-cream transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="w-8 text-center text-[10px] font-mono text-zibara-cream">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.quantity + 1, item.color)}
                          className="w-8 h-8 flex items-center justify-center text-zibara-cream/65 hover:text-zibara-cream transition-colors"
                        >
                          <Plus size={10} />
                        </button>
                      </div>

                      {/* Price */}
                      <p className="text-[11px] font-mono text-zibara-cream">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="space-y-4 pt-0">
                <p className="text-[9px] tracking-[0.4em] font-mono text-zibara-cream/65 uppercase border-t border-zibara-cream/10 pt-6 pb-2">Order Summary</p>

                <div className="flex justify-between text-[10px] font-mono text-zibara-cream/75">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>

                <div className="flex justify-between text-[10px] font-mono text-zibara-cream/75">
                  <span>Shipping</span>
                  <span>{shippingUSD === 0 ? 'Free' : formatPrice(shippingUSD)}</span>
                </div>

                {shippingUSD > 0 && (
                  <p className="text-[9px] font-mono text-zibara-cream/65">
                    Free shipping on orders over {formatPrice(500)}
                  </p>
                )}

                <div className="border-t border-zibara-cream/10 pt-4 flex justify-between text-[11px] font-mono text-zibara-cream">
                  <span className="uppercase tracking-wider">Total</span>
                  <span>{formatPrice(totalUSD)}</span>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full mt-6 py-4 border border-zibara-cream/35 text-[10px] tracking-[0.4em] uppercase font-mono text-zibara-cream/80 text-center hover:bg-zibara-cream hover:text-zibara-black hover:border-zibara-cream transition-all duration-300"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/shop"
                  className="block w-full text-center py-2 text-[9px] tracking-widest font-mono text-zibara-cream/65 hover:text-zibara-cream transition-colors uppercase"
                >
                  Continue shopping
                </Link>
              </div>

              {/* Assurances */}
              <div className="mt-6 space-y-2">
                {[
                  'Secure payment',
                  'Free returns within 14 days',
                  'Crafted with intention',
                ].map((line) => (
                  <p key={line} className="text-[9px] font-mono text-zibara-cream/60 tracking-wider">— {line}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
