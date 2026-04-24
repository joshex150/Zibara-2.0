'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Plus, X, Check, Upload } from 'lucide-react';
import ImageUploading from 'react-images-uploading';
import BrandLoader from '@/components/BrandLoader';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
}

interface CollectionForm {
  name: string;
  slug: string;
  season: string;
  year: number;
  description: string;
  writeUp: string;
  coverImage: string;
  images: string[];
  productIds: string[];
  featured: boolean;
  published: boolean;
}

const defaultForm: CollectionForm = {
  name: '',
  slug: '',
  season: '',
  year: new Date().getFullYear(),
  description: '',
  writeUp: '',
  coverImage: '',
  images: [''],
  productIds: [],
  featured: false,
  published: false,
};

const seasons = ['Spring', 'Summer', 'Fall', 'Winter', 'Holiday'];

export default function AdminCollectionEditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';

  const [form, setForm] = useState<CollectionForm>(defaultForm);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, isCoverImage: boolean = false, imageIndex?: number) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Failed to upload file');
      const data = await response.json();
      toast.success('Image uploaded successfully!');
      if (isCoverImage) {
        setForm(prev => ({ ...prev, coverImage: data.url }));
      } else if (imageIndex !== undefined) {
        setForm(prev => ({ ...prev, images: prev.images.map((img, i) => (i === imageIndex ? data.url : img)) }));
      } else {
        setForm(prev => ({ ...prev, images: [...prev.images.filter(img => img.trim()), data.url] }));
      }
      return data;
    } catch (error: any) {
      console.error('Error uploading file:', error.message);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchProducts();
      if (!isNew) fetchCollection();
    }
  }, [status, router, isNew]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCollection = async () => {
    try {
      const res = await fetch(`/api/admin/collections/${params.id}`);
      const data = await res.json();
      if (data.success) {
        const collection = data.data;
        setForm({
          name: collection.name || '',
          slug: collection.slug || '',
          season: collection.season || '',
          year: collection.year || new Date().getFullYear(),
          description: collection.description || '',
          writeUp: collection.writeUp || '',
          coverImage: collection.coverImage || '',
          images: collection.images?.length ? collection.images : [''],
          productIds: collection.productIds?.map((p: any) => typeof p === 'object' ? p._id : p) || [],
          featured: collection.featured ?? false,
          published: collection.published ?? false,
        });
      } else {
        setError('Collection not found');
      }
    } catch (error) {
      console.error('Error fetching collection:', error);
      setError('Failed to fetch collection');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleNameChange = (name: string) => {
    setForm(prev => ({ ...prev, name, slug: isNew ? generateSlug(name) : prev.slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    if (!form.name.trim()) { setError('Collection name is required'); setSaving(false); return; }
    if (!form.slug.trim()) { setError('Slug is required'); setSaving(false); return; }
    if (!form.season) { setError('Season is required'); setSaving(false); return; }
    if (!form.description.trim()) { setError('Description is required'); setSaving(false); return; }
    if (!form.writeUp.trim()) { setError('Write-up is required'); setSaving(false); return; }
    if (!form.coverImage.trim()) { setError('Cover image is required'); setSaving(false); return; }

    const cleanedForm = { ...form, images: form.images.filter(img => img.trim()) };

    try {
      const url = isNew ? '/api/admin/collections' : `/api/admin/collections/${params.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedForm),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/admin/collections');
      } else {
        setError(data.error || 'Failed to save collection');
      }
    } catch (error) {
      console.error('Error saving collection:', error);
      setError('Failed to save collection');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this collection?')) return;
    try {
      const res = await fetch(`/api/admin/collections/${params.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/admin/collections');
      } else {
        setError('Failed to delete collection');
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      setError('Failed to delete collection');
    }
  };

  const removeImageField = (index: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const toggleProduct = (productId: string) => {
    setForm(prev => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter(id => id !== productId)
        : [...prev.productIds, productId],
    }));
  };

  if (status === 'loading' || loading) return <BrandLoader label="Collection" sublabel="ZIBARASTUDIO" tone="crimson" />;

  if (!session) return null;

  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream">
      <div className="max-w-4xl mx-auto px-6 md:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-zibara-cream/5 pb-8 mb-10">
          <div className="flex items-start gap-4">
            <Link
              href="/admin/collections"
              className="p-2 border border-zibara-cream/20 hover:border-zibara-cream/45 transition-colors text-zibara-cream/70 hover:text-zibara-cream shrink-0 mt-1"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-2">
                {isNew ? 'New' : 'Editing'}
              </p>
              <h1 className="font-cormorant text-4xl md:text-5xl font-light uppercase tracking-[0.15em] text-zibara-cream">
                {isNew ? 'New Collection' : 'Edit Collection'}
              </h1>
              <p className="text-[11px] font-mono text-zibara-cream/65 mt-2">
                {isNew ? 'Create a new curated collection' : 'Update collection details'}
              </p>
            </div>
          </div>
          {!isNew && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-zibara-crimson/50 text-zibara-crimson text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-zibara-crimson hover:text-zibara-cream transition-colors shrink-0"
            >
              <Trash2 size={14} className="inline mr-1.5" />
              Delete
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="border border-red-500/30 bg-red-950/20 text-red-400 px-4 py-3 text-[11px] font-mono mb-8">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="border border-zibara-cream/10 bg-zibara-deep p-5 md:p-6 space-y-5">
            <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase">Basic Information</p>

            <div>
              <label className="block text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55 mb-2">
                Collection Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-3 border border-zibara-cream/35 focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 focus:border-transparent bg-zibara-black/40 text-zibara-cream"
                placeholder="e.g., Summer Paradise 2026"
              />
            </div>

            <div>
              <label className="block text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55 mb-2">
                URL Slug *
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-4 py-3 border border-zibara-cream/35 focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 focus:border-transparent bg-zibara-black/40 text-zibara-cream"
                placeholder="summer-paradise-2026"
              />
              <p className="text-[9px] font-mono text-zibara-cream/40 tracking-[0.2em] mt-1">
                URL: /collections/{form.slug || 'your-slug'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55 mb-2">
                  Season *
                </label>
                <select
                  value={form.season}
                  onChange={(e) => setForm(prev => ({ ...prev, season: e.target.value }))}
                  className="w-full px-4 py-3 border border-zibara-cream/35 focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 focus:border-transparent bg-zibara-black/40 text-zibara-cream"
                >
                  <option value="">Select a season</option>
                  {seasons.map(season => (
                    <option key={season} value={season}>{season}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                  className="w-full px-4 py-3 border border-zibara-cream/35 focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 focus:border-transparent bg-zibara-black/40 text-zibara-cream"
                  min="2020"
                  max="2030"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55 mb-2">
                Short Description *
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-zibara-cream/35 focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 focus:border-transparent bg-zibara-black/40 text-zibara-cream"
                rows={2}
                placeholder="A brief description for previews..."
              />
            </div>

            <div>
              <label className="block text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55 mb-2">
                Full Write-up *
              </label>
              <textarea
                value={form.writeUp}
                onChange={(e) => setForm(prev => ({ ...prev, writeUp: e.target.value }))}
                className="w-full px-4 py-3 border border-zibara-cream/35 focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 focus:border-transparent bg-zibara-black/40 text-zibara-cream"
                rows={6}
                placeholder="Tell the story of this collection..."
              />
            </div>
          </div>

          {/* Cover Image */}
          <div className="border border-zibara-cream/10 bg-zibara-deep p-5 md:p-6 space-y-4">
            <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase">Cover Image *</p>

            <ImageUploading
              multiple={false}
              value={form.coverImage ? [{ data_url: form.coverImage }] : []}
              onChange={(imageList) => {
                if (imageList[0]?.file) uploadFile(imageList[0].file, true);
              }}
              maxNumber={1}
              dataURLKey="data_url"
            >
              {({ imageList, onImageUpload, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                <div className="space-y-4">
                  {form.coverImage && (
                    <div className="aspect-video bg-zibara-deep overflow-hidden max-w-md border border-zibara-cream/25">
                      <img src={form.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={form.coverImage ? () => onImageUpdate(0) : onImageUpload}
                      {...dragProps}
                      disabled={uploading}
                      className={`flex items-center gap-2 px-5 py-2 text-[10px] font-mono uppercase tracking-[0.3em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDragging
                          ? 'bg-zibara-crimson text-zibara-cream'
                          : 'border border-zibara-cream/25 text-zibara-cream/65 hover:border-zibara-cream/50 hover:text-zibara-cream'
                      }`}
                    >
                      <Upload size={12} />
                      {uploading ? 'Uploading...' : form.coverImage ? 'Change Cover Image' : 'Upload Cover Image'}
                    </button>
                    {form.coverImage && (
                      <button
                        type="button"
                        onClick={() => { onImageRemove(0); setForm(prev => ({ ...prev, coverImage: '' })); }}
                        className="px-5 py-2 border border-zibara-crimson/50 text-zibara-crimson text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-zibara-crimson hover:text-zibara-cream transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )}
            </ImageUploading>
          </div>

          {/* Gallery Images */}
          <div className="border border-zibara-cream/10 bg-zibara-deep p-5 md:p-6 space-y-4">
            <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase">Gallery Images</p>

            <ImageUploading
              multiple
              value={form.images.filter(img => img.trim()).map(url => ({ data_url: url }))}
              onChange={(imageList, addUpdateIndex) => {
                const index = Array.isArray(addUpdateIndex) ? addUpdateIndex[0] : addUpdateIndex;
                if (index !== undefined && imageList[index]?.file) {
                  uploadFile(imageList[index].file, false, index);
                }
              }}
              maxNumber={20}
              dataURLKey="data_url"
            >
              {({ imageList, onImageUpload, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {imageList.map((image, index) => {
                      const imageUrl = typeof image.data_url === 'string' ? image.data_url : '';
                      return (
                        <div key={index} className="relative w-28 h-28 overflow-hidden border border-zibara-cream/25">
                          <img src={imageUrl} alt={`Gallery image ${index + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onImageUpdate(index)}
                              className="px-2 py-1 border border-zibara-cream/25 text-[9px] font-mono uppercase tracking-[0.2em] text-zibara-cream/65 hover:border-zibara-cream/50 hover:text-zibara-cream transition-colors"
                            >
                              Update
                            </button>
                            <button
                              type="button"
                              onClick={() => { onImageRemove(index); removeImageField(index); }}
                              className="px-2 py-1 border border-zibara-crimson/50 text-zibara-crimson text-[9px] font-mono uppercase tracking-[0.2em] hover:bg-zibara-crimson hover:text-zibara-cream transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={onImageUpload}
                    {...dragProps}
                    disabled={uploading}
                    className={`flex items-center gap-2 px-5 py-2 text-[10px] font-mono uppercase tracking-[0.3em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDragging
                        ? 'bg-zibara-crimson text-zibara-cream'
                        : 'border border-zibara-cream/25 text-zibara-cream/65 hover:border-zibara-cream/50 hover:text-zibara-cream'
                    }`}
                  >
                    <Upload size={12} />
                    {uploading ? 'Uploading...' : 'Upload Gallery Images'}
                  </button>
                </div>
              )}
            </ImageUploading>
          </div>

          {/* Products */}
          <div className="border border-zibara-cream/10 bg-zibara-deep p-5 md:p-6">
            <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-1">Products in Collection</p>
            <p className="text-[11px] font-mono text-zibara-cream/40 mb-4">{form.productIds.length} selected</p>

            {products.length === 0 ? (
              <p className="text-[11px] font-mono text-zibara-cream/40">No products available. Create products first.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zibara-cream/5 max-h-96 overflow-y-auto">
                {products.map(product => {
                  const isSelected = form.productIds.includes(product._id);
                  return (
                    <button
                      key={product._id}
                      type="button"
                      onClick={() => toggleProduct(product._id)}
                      className={`relative p-2 text-left bg-zibara-black transition-colors hover:bg-zibara-cream/5 ${
                        isSelected ? 'ring-1 ring-inset ring-zibara-crimson/60' : ''
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-zibara-crimson flex items-center justify-center">
                          <Check size={10} className="text-white" />
                        </div>
                      )}
                      <div className="aspect-square bg-zibara-deep overflow-hidden mb-2">
                        <img
                          src={product.images[0] || '/placeholder.png'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-[9px] font-mono uppercase tracking-[0.1em] text-zibara-cream truncate">{product.name}</p>
                      <p className="text-[9px] font-mono text-zibara-cream/40">${product.price}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="border border-zibara-cream/10 bg-zibara-deep p-5 md:p-6">
            <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-4">Status</p>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm(prev => ({ ...prev, published: e.target.checked }))}
                  className="w-4 h-4 border-zibara-cream/35 text-zibara-crimson focus:ring-zibara-gold/50"
                />
                <span className="text-[11px] font-mono text-zibara-cream/65">Published (visible to customers)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 border-zibara-cream/35 text-zibara-crimson focus:ring-zibara-gold/50"
                />
                <span className="text-[11px] font-mono text-zibara-cream/65">Featured Collection</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/admin/collections"
              className="px-5 py-2 border border-zibara-cream/25 text-[10px] font-mono uppercase tracking-[0.3em] text-zibara-cream/65 hover:border-zibara-cream/50 hover:text-zibara-cream transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-zibara-blood transition-colors disabled:opacity-50"
            >
              <Save size={12} />
              {saving ? 'Saving...' : isNew ? 'Create Collection' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
