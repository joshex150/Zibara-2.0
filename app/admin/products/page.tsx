'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { useData } from '@/context/DataContext';
import BrandLoader from '@/components/BrandLoader';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  inStock: boolean;
  featured: boolean;
}

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { getCategoryNames } = useData();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchProducts();
    }
  }, [status, router]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter(p => p._id !== id));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true;
    if (filter === 'featured') return product.featured;
    return product.category === filter;
  });

  const categoryNames = getCategoryNames();

  if (status === 'loading' || loading) return <BrandLoader label="Products" sublabel="ZIBARASTUDIO" tone="crimson" />;

  if (!session) return null;

  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream">
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 border-b border-zibara-cream/5 pb-8 mb-10">
          <div className="flex items-start gap-4">
            <Link
              href="/admin"
              className="p-2 border border-zibara-cream/20 hover:border-zibara-cream/45 transition-colors text-zibara-cream/70 hover:text-zibara-cream shrink-0 mt-1"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-2">Catalog</p>
              <h1 className="font-cormorant text-4xl md:text-5xl font-light uppercase tracking-[0.15em] text-zibara-cream">
                Products
              </h1>
              <p className="text-[11px] font-mono text-zibara-cream/65 mt-2">
                {products.length} item{products.length !== 1 ? 's' : ''} in catalog
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/admin/products/new')}
            className="flex items-center gap-2 px-5 py-2 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-zibara-blood transition-colors shrink-0"
          >
            <Plus size={14} />
            Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={filter === 'all'
              ? 'px-3 py-1.5 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em]'
              : 'px-3 py-1.5 border border-zibara-cream/20 text-[10px] font-mono uppercase tracking-[0.3em] text-zibara-cream/60 hover:border-zibara-cream/40 hover:text-zibara-cream/80 transition-colors'
            }
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setFilter('featured')}
            className={filter === 'featured'
              ? 'px-3 py-1.5 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em]'
              : 'px-3 py-1.5 border border-zibara-cream/20 text-[10px] font-mono uppercase tracking-[0.3em] text-zibara-cream/60 hover:border-zibara-cream/40 hover:text-zibara-cream/80 transition-colors'
            }
          >
            Featured
          </button>
          {categoryNames.map(category => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={filter === category
                ? 'px-3 py-1.5 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em]'
                : 'px-3 py-1.5 border border-zibara-cream/20 text-[10px] font-mono uppercase tracking-[0.3em] text-zibara-cream/60 hover:border-zibara-cream/40 hover:text-zibara-cream/80 transition-colors'
              }
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="border border-zibara-cream/10 p-12 text-center">
            <p className="text-[11px] font-mono text-zibara-cream/65 mb-4">No products found</p>
            <button
              onClick={() => router.push('/admin/products/new')}
              className="px-5 py-2 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-zibara-blood transition-colors"
            >
              Add Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-zibara-cream/5 border border-zibara-cream/5">
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-zibara-black flex flex-col">
                <div className="relative aspect-[3/4] bg-zibara-deep">
                  <img
                    src={product.images[0] || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.featured && (
                    <div className="absolute top-2 right-2 bg-zibara-gold/20 border border-zibara-gold/40 text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 text-zibara-gold">
                      Featured
                    </div>
                  )}
                  {!product.inStock && (
                    <div className="absolute top-2 left-2 border border-zibara-crimson/50 text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 text-zibara-crimson">
                      Out of Stock
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1 border-t border-zibara-cream/5">
                  <p className="text-[9px] tracking-[0.4em] font-mono text-zibara-cream/55 uppercase mb-1">{product.category}</p>
                  <h3 className="text-zibara-cream text-xs uppercase tracking-[0.1em] mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-[11px] font-mono text-zibara-cream/65 mb-4">
                    ${product.price.toFixed(2)}
                  </p>
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => router.push(`/admin/products/${product._id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-zibara-blood transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex items-center justify-center px-3 py-1.5 border border-zibara-crimson/50 text-zibara-crimson text-[10px] font-mono hover:bg-zibara-crimson hover:text-zibara-cream transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
