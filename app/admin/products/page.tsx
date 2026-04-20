'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit2, Trash2, ArrowLeft, Eye } from 'lucide-react';
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
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

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

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#EBB0C9] scroll-mt-32 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <Link 
              href="/admin"
              className="p-2 bg-[#f5d5e5] rounded-lg hover:bg-[#d896b5]/30 transition-colors shrink-0"
            >
              <ArrowLeft size={18} className="md:w-5 md:h-5 text-[#8b2b4d]" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#8b2b4d] uppercase tracking-wider">
                Products
              </h1>
              <p className="text-gray-700 text-xs md:text-sm mt-1">
                Manage your product catalog
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/admin/products/new')}
            className="flex items-center justify-center gap-2 bg-[#8b2b4d] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-[#6d1f3a] transition-colors text-sm md:text-base"
          >
            <Plus size={18} className="md:w-5 md:h-5" />
            Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 md:mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm ${
              filter === 'all'
                ? 'bg-[#8b2b4d] text-white'
                : 'bg-[#f5d5e5] text-gray-700 hover:bg-[#d896b5]/30'
            }`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setFilter('featured')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm ${
              filter === 'featured'
                ? 'bg-[#8b2b4d] text-white'
                : 'bg-[#f5d5e5] text-gray-700 hover:bg-[#d896b5]/30'
            }`}
          >
            Featured
          </button>
          {categoryNames.map(category => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm ${
                filter === category
                  ? 'bg-[#8b2b4d] text-white'
                  : 'bg-[#f5d5e5] text-gray-700 hover:bg-[#d896b5]/30'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-[#8b2b4d] rounded-lg p-8 md:p-12 text-center flex-1 flex flex-col items-center justify-center">
            <p className="text-base md:text-lg text-white mb-3 md:mb-4">No products found</p>
            <p className="text-xs md:text-sm text-white/80 mb-4 md:mb-6">Start building your catalog by adding your first product</p>
            <button
              onClick={() => router.push('/admin/products/new')}
              className="px-5 md:px-6 py-2 bg-white text-[#8b2b4d] rounded-full text-xs md:text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              Add Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-[#f5d5e5] rounded-lg shadow-md overflow-hidden flex flex-col">
                <div className="relative aspect-[3/4] bg-[#f5d5e5]">
                  <img
                    src={product.images[0] || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.featured && (
                    <div className="absolute top-1 md:top-2 right-1 md:right-2 bg-yellow-400 text-yellow-900 px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-bold">
                      FEATURED
                    </div>
                  )}
                  {!product.inStock && (
                    <div className="absolute top-1 md:top-2 left-1 md:left-2 bg-red-500 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-bold">
                      OUT OF STOCK
                    </div>
                  )}
                </div>
                <div className="p-3 md:p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 mb-1 text-xs md:text-base line-clamp-1">{product.name}</h3>
                  <p className="text-[10px] md:text-sm text-gray-600 mb-1 md:mb-2">{product.category}</p>
                  <p className="text-sm md:text-lg font-bold text-[#8b2b4d] mb-3 md:mb-4">
                    ${product.price.toFixed(2)}
                  </p>
                  <div className="flex gap-1.5 md:gap-2 mt-auto">
                    <button
                      onClick={() => router.push(`/admin/products/${product._id}`)}
                      className="flex-1 flex items-center justify-center gap-1 bg-[#8b2b4d] text-white px-2 md:px-3 py-1.5 md:py-2 rounded text-[10px] md:text-sm font-semibold hover:bg-[#6d1f3a] transition-colors"
                    >
                      <Edit2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex items-center justify-center gap-1 bg-[#8b2b4d] text-white px-2 md:px-3 py-1.5 md:py-2 rounded text-[10px] md:text-sm font-semibold hover:bg-[#6d1f3a] transition-colors"
                    >
                      <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
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
