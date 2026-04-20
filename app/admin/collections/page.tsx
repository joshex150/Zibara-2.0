'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit2, Trash2, ArrowLeft, Eye, Calendar } from 'lucide-react';
import BrandLoader from '@/components/BrandLoader';
import toast from 'react-hot-toast';

interface Collection {
  _id: string;
  name: string;
  slug: string;
  season: string;
  year: number;
  description: string;
  coverImage: string;
  productIds: any[];
  featured: boolean;
  published: boolean;
}

export default function AdminCollectionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchCollections();
    }
  }, [status, router]);

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/admin/collections');
      const data = await res.json();
      
      if (data.success) {
        setCollections(data.data);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/collections/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setCollections(collections.filter(c => c._id !== id));
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast.error('Failed to delete collection');
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/collections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !currentStatus }),
      });

      if (res.ok) {
        fetchCollections();
      }
    } catch (error) {
      console.error('Error updating collection:', error);
      toast.error('Failed to update collection');
    }
  };

  if (status === 'loading' || loading) return <BrandLoader label="Collections" sublabel="ZIBARASTUDIO" tone="crimson" />;

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
                Collections
              </h1>
              <p className="text-gray-700 text-xs md:text-sm mt-1">
                Manage seasonal drops and curated collections
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/admin/collections/new')}
            className="flex items-center justify-center gap-2 bg-[#8b2b4d] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-[#6d1f3a] transition-colors text-sm md:text-base"
          >
            <Plus size={18} className="md:w-5 md:h-5" />
            New Collection
          </button>
        </div>

        {/* Collections Grid */}
        {collections.length === 0 ? (
          <div className="bg-[#8b2b4d] rounded-lg p-8 md:p-12 text-center flex-1 flex flex-col items-center justify-center">
            <p className="text-base md:text-lg text-white mb-3 md:mb-4">No collections yet</p>
            <p className="text-xs md:text-sm text-white/80 mb-4 md:mb-6">Create curated drops and seasonal stories for your customers</p>
            <button
              onClick={() => router.push('/admin/collections/new')}
              className="px-5 md:px-6 py-2 bg-white text-[#8b2b4d] rounded-full text-xs md:text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              Create Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {collections.map((collection) => (
              <div key={collection._id} className="bg-[#f5d5e5] rounded-lg shadow-md overflow-hidden flex flex-col">
                <div className="relative aspect-[16/10] bg-[#f5d5e5]">
                  <img
                    src={collection.coverImage || '/placeholder.png'}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                  {collection.featured && (
                    <div className="absolute top-1.5 md:top-2 right-1.5 md:right-2 bg-yellow-400 text-yellow-900 px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-bold">
                      FEATURED
                    </div>
                  )}
                  {!collection.published && (
                    <div className="absolute top-1.5 md:top-2 left-1.5 md:left-2 bg-gray-500 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-bold">
                      DRAFT
                    </div>
                  )}
                </div>
                <div className="p-3 md:p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-600 mb-1.5 md:mb-2">
                    <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    <span>{collection.season} {collection.year}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 uppercase tracking-wider text-xs md:text-base line-clamp-1">
                    {collection.name}
                  </h3>
                  <p className="text-[10px] md:text-sm text-gray-600 mb-1.5 md:mb-2 line-clamp-2">
                    {collection.description}
                  </p>
                  <p className="text-[10px] md:text-xs text-gray-500 mb-3 md:mb-4">
                    {collection.productIds?.length || 0} products
                  </p>
                  <div className="flex gap-1.5 md:gap-2 mt-auto">
                    <button
                      onClick={() => togglePublished(collection._id, collection.published)}
                      className={`flex-1 flex items-center justify-center gap-1 px-2 md:px-3 py-1.5 md:py-2 rounded text-[10px] md:text-xs font-semibold transition-colors ${
                        collection.published
                          ? 'bg-[#6d1f3a] text-white hover:bg-[#8b2b4d]'
                          : 'bg-[#8b2b4d] text-white hover:bg-[#6d1f3a]'
                      }`}
                    >
                      <Eye className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      <span className="hidden xs:inline">{collection.published ? 'Published' : 'Publish'}</span>
                    </button>
                    <button
                      onClick={() => router.push(`/admin/collections/${collection._id}`)}
                      className="flex items-center justify-center gap-1 bg-[#8b2b4d] text-white px-2 md:px-3 py-1.5 md:py-2 rounded text-[10px] md:text-xs font-semibold hover:bg-[#6d1f3a] transition-colors"
                    >
                      <Edit2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(collection._id)}
                      className="flex items-center justify-center gap-1 bg-[#8b2b4d] text-white px-2 md:px-3 py-1.5 md:py-2 rounded text-[10px] md:text-xs font-semibold hover:bg-[#6d1f3a] transition-colors"
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
