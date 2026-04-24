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
    if (!confirm('Are you sure you want to delete this collection?')) return;
    try {
      const res = await fetch(`/api/admin/collections/${id}`, { method: 'DELETE' });
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
      if (res.ok) fetchCollections();
    } catch (error) {
      console.error('Error updating collection:', error);
      toast.error('Failed to update collection');
    }
  };

  if (status === 'loading' || loading) return <BrandLoader label="Collections" sublabel="ZIBARASTUDIO" tone="crimson" />;

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
              <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-2">Archive</p>
              <h1 className="font-cormorant text-4xl md:text-5xl font-light uppercase tracking-[0.15em] text-zibara-cream">
                Collections
              </h1>
              <p className="text-[11px] font-mono text-zibara-cream/65 mt-2">
                Seasonal drops and curated stories
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/admin/collections/new')}
            className="flex items-center gap-2 px-5 py-2 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-zibara-blood transition-colors shrink-0"
          >
            <Plus size={14} />
            New Collection
          </button>
        </div>

        {/* Collections Grid */}
        {collections.length === 0 ? (
          <div className="border border-zibara-cream/10 p-12 text-center">
            <p className="text-[11px] font-mono text-zibara-cream/65 mb-2">No collections yet</p>
            <p className="text-[11px] font-mono text-zibara-cream/40 mb-6">Create curated drops and seasonal stories</p>
            <button
              onClick={() => router.push('/admin/collections/new')}
              className="px-5 py-2 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-zibara-blood transition-colors"
            >
              Create Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-zibara-cream/5 border border-zibara-cream/5">
            {collections.map((collection) => (
              <div key={collection._id} className="bg-zibara-black flex flex-col">
                <div className="relative aspect-[16/10] bg-zibara-deep">
                  <img
                    src={collection.coverImage || '/placeholder.png'}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                  {collection.featured && (
                    <div className="absolute top-2 right-2 bg-zibara-gold/20 border border-zibara-gold/40 text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 text-zibara-gold">
                      Featured
                    </div>
                  )}
                  {!collection.published && (
                    <div className="absolute top-2 left-2 border border-zibara-cream/30 text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 text-zibara-cream/60">
                      Draft
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1 border-t border-zibara-cream/5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Calendar className="w-3 h-3 text-zibara-cream/40" />
                    <span className="text-[9px] font-mono text-zibara-cream/55 tracking-[0.3em] uppercase">{collection.season} {collection.year}</span>
                  </div>
                  <h3 className="text-zibara-cream uppercase tracking-[0.1em] text-sm mb-1 line-clamp-1">
                    {collection.name}
                  </h3>
                  <p className="text-[11px] font-mono text-zibara-cream/65 mb-1 line-clamp-2">
                    {collection.description}
                  </p>
                  <p className="text-[9px] font-mono text-zibara-cream/40 tracking-[0.3em] uppercase mb-4">
                    {collection.productIds?.length || 0} products
                  </p>
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => togglePublished(collection._id, collection.published)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.3em] transition-colors ${
                        collection.published
                          ? 'border border-zibara-cream/25 text-zibara-cream/65 hover:border-zibara-cream/50 hover:text-zibara-cream'
                          : 'bg-zibara-crimson text-zibara-cream hover:bg-zibara-blood'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      {collection.published ? 'Published' : 'Publish'}
                    </button>
                    <button
                      onClick={() => router.push(`/admin/collections/${collection._id}`)}
                      className="flex items-center justify-center px-3 py-1.5 bg-zibara-crimson text-zibara-cream text-[10px] font-mono hover:bg-zibara-blood transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(collection._id)}
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
