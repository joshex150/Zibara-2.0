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

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      toast.success('Image uploaded successfully!');
      
      if (isCoverImage) {
        setForm(prev => ({ ...prev, coverImage: data.url }));
      } else if (imageIndex !== undefined) {
        setForm(prev => ({
          ...prev,
          images: prev.images.map((img, i) => (i === imageIndex ? data.url : img)),
        }));
      } else {
        setForm(prev => ({
          ...prev,
          images: [...prev.images.filter(img => img.trim()), data.url],
        }));
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
      if (!isNew) {
        fetchCollection();
      }
    }
  }, [status, router, isNew]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setForm(prev => ({
      ...prev,
      name,
      slug: isNew ? generateSlug(name) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    // Validation
    if (!form.name.trim()) {
      setError('Collection name is required');
      setSaving(false);
      return;
    }
    if (!form.slug.trim()) {
      setError('Slug is required');
      setSaving(false);
      return;
    }
    if (!form.season) {
      setError('Season is required');
      setSaving(false);
      return;
    }
    if (!form.description.trim()) {
      setError('Description is required');
      setSaving(false);
      return;
    }
    if (!form.writeUp.trim()) {
      setError('Write-up is required');
      setSaving(false);
      return;
    }
    if (!form.coverImage.trim()) {
      setError('Cover image is required');
      setSaving(false);
      return;
    }

    // Filter out empty values
    const cleanedForm = {
      ...form,
      images: form.images.filter(img => img.trim()),
    };

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
    if (!confirm('Are you sure you want to delete this collection?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/collections/${params.id}`, {
        method: 'DELETE',
      });

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
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
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

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-900 scroll-mt-32">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/collections"
              className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <ArrowLeft size={20} className="text-zibara-cream" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-zibara-cream uppercase tracking-wider">
                {isNew ? 'New Collection' : 'Edit Collection'}
              </h1>
              <p className="text-zinc-300 text-sm mt-1">
                {isNew ? 'Create a new curated collection' : 'Update collection details'}
              </p>
            </div>
          </div>
          {!isNew && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
            >
              <Trash2 size={18} />
              Delete
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-950/50 border border-red-500/30 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-zinc-800 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-zibara-cream mb-4">Basic Information</h2>

            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">
                Collection Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent bg-white"
                placeholder="e.g., Summer Paradise 2026"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">
                URL Slug *
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent bg-white"
                placeholder="summer-paradise-2026"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Used in URL: /collections/{form.slug || 'your-slug'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">
                  Season *
                </label>
                <select
                  value={form.season}
                  onChange={(e) => setForm(prev => ({ ...prev, season: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent bg-zinc-800 text-zibara-cream"
                >
                  <option value="">Select a season</option>
                  {seasons.map(season => (
                    <option key={season} value={season}>{season}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent bg-white"
                  min="2020"
                  max="2030"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">
                Short Description *
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent bg-white"
                rows={2}
                placeholder="A brief description for previews..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">
                Full Write-up *
              </label>
              <textarea
                value={form.writeUp}
                onChange={(e) => setForm(prev => ({ ...prev, writeUp: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent bg-white"
                rows={6}
                placeholder="Tell the story of this collection..."
              />
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-zinc-800 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-zibara-cream mb-4">Cover Image *</h2>
            
            <ImageUploading
              multiple={false}
              value={form.coverImage ? [{ data_url: form.coverImage }] : []}
              onChange={(imageList) => {
                if (imageList[0]?.file) {
                  uploadFile(imageList[0].file, true);
                }
              }}
              maxNumber={1}
              dataURLKey="data_url"
            >
              {({
                imageList,
                onImageUpload,
                onImageUpdate,
                onImageRemove,
                isDragging,
                dragProps,
              }) => (
                <div className="space-y-4">
                  {form.coverImage && (
                    <div className="aspect-video bg-white rounded-lg overflow-hidden max-w-md border-2 border-gray-300">
                      <img src={form.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={form.coverImage ? () => onImageUpdate(0) : onImageUpload}
                    {...dragProps}
                    disabled={uploading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                      isDragging
                        ? 'bg-zibara-crimson text-white'
                        : 'bg-zinc-700 text-zinc-200 border border-zinc-600 hover:bg-zinc-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Upload size={18} />
                    {uploading ? 'Uploading...' : form.coverImage ? 'Change Cover Image' : 'Upload Cover Image'}
                  </button>
                  
                  {form.coverImage && (
                    <button
                      type="button"
                      onClick={() => {
                        onImageRemove(0);
                        setForm(prev => ({ ...prev, coverImage: '' }));
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                    >
                      Remove Cover Image
                    </button>
                  )}
                </div>
              )}
            </ImageUploading>
          </div>

          {/* Gallery Images */}
          <div className="bg-zinc-800 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-zibara-cream">Gallery Images</h2>
            
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
              {({
                imageList,
                onImageUpload,
                onImageUpdate,
                onImageRemove,
                isDragging,
                dragProps,
              }) => (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {imageList.map((image, index) => {
                      const imageUrl = typeof image.data_url === 'string' ? image.data_url : '';
                      return (
                        <div key={index} className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-300">
                          <img
                            src={imageUrl}
                            alt={`Gallery image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => onImageUpdate(index)}
                              className="px-3 py-1 bg-white text-zinc-300 rounded text-xs font-semibold hover:bg-zinc-700"
                            >
                              Update
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onImageRemove(index);
                                removeImageField(index);
                              }}
                              className="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600"
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                      isDragging
                        ? 'bg-zibara-crimson text-white'
                        : 'bg-zinc-700 text-zinc-200 border border-zinc-600 hover:bg-zinc-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Upload size={18} />
                    {uploading ? 'Uploading...' : 'Upload Gallery Images'}
                  </button>
                </div>
              )}
            </ImageUploading>
          </div>

          {/* Products */}
          <div className="bg-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-bold text-zibara-cream mb-4">
              Products in Collection ({form.productIds.length} selected)
            </h2>

            {products.length === 0 ? (
              <p className="text-zinc-400 text-sm">No products available. Create products first.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {products.map(product => {
                  const isSelected = form.productIds.includes(product._id);
                  return (
                    <button
                      key={product._id}
                      type="button"
                      onClick={() => toggleProduct(product._id)}
                      className={`relative p-2 rounded-lg border-2 transition-colors text-left ${
                        isSelected
                          ? 'border-zinc-600 bg-zinc-700/40'
                          : 'border-transparent bg-white hover:border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-zibara-crimson rounded-full flex items-center justify-center">
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                      <div className="aspect-square bg-zinc-700 rounded overflow-hidden mb-2">
                        <img
                          src={product.images[0] || '/placeholder.png'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs font-medium text-zinc-100 truncate">{product.name}</p>
                      <p className="text-xs text-zinc-500">${product.price}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="bg-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-bold text-zibara-cream mb-4">Status</h2>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm(prev => ({ ...prev, published: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 text-zibara-cream focus:ring-zinc-400"
                />
                <span className="text-sm font-medium text-zinc-300">Published (visible to customers)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 text-zibara-cream focus:ring-zinc-400"
                />
                <span className="text-sm font-medium text-zinc-300">Featured Collection</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/admin/collections"
              className="px-6 py-3 bg-gray-200 text-zinc-300 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-zibara-crimson text-white rounded-lg font-semibold hover:bg-zibara-blood transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Saving...' : isNew ? 'Create Collection' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
