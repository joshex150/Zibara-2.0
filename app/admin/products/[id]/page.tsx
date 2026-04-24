'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Plus, X, Upload } from 'lucide-react';
import { useData } from '@/context/DataContext';
import ImageUploading from 'react-images-uploading';
import BrandLoader from '@/components/BrandLoader';
import toast from 'react-hot-toast';

interface ColorOption {
  name: string;
  hex: string;
}

interface ProductForm {
  name: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  sizes: string[];
  colors: ColorOption[];
  material: string;
  care: string[];
  inStock: boolean;
  featured: boolean;
}

const defaultForm: ProductForm = {
  name: '',
  price: 0,
  description: '',
  images: [''],
  category: '',
  sizes: [],
  colors: [],
  material: '',
  care: [''],
  inStock: true,
  featured: false,
};

const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function AdminProductEditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';
  const { categories, categoriesLoading, getCategoryNames } = useData();

  const [form, setForm] = useState<ProductForm>(defaultForm);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const categoryNames = getCategoryNames();

  const uploadFile = async (file: File, imageIndex?: number) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Failed to upload file');
      const data = await response.json();
      toast.success('Image uploaded successfully!');
      if (imageIndex !== undefined) {
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
    } else if (status === 'authenticated' && !isNew) {
      fetchProduct();
    }
  }, [status, router, isNew]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/admin/products/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setForm({
          name: data.data.name || '',
          price: data.data.price || 0,
          description: data.data.description || '',
          images: data.data.images?.length ? data.data.images : [''],
          category: data.data.category || '',
          sizes: data.data.sizes || [],
          colors: data.data.colors || [],
          material: data.data.material || '',
          care: Array.isArray(data.data.care) ? data.data.care : data.data.care ? [data.data.care] : [''],
          inStock: data.data.inStock ?? true,
          featured: data.data.featured ?? false,
        });
      } else {
        setError('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    if (!form.name.trim()) { setError('Product name is required'); setSaving(false); return; }
    if (form.price <= 0) { setError('Price must be greater than 0'); setSaving(false); return; }
    if (!form.category.trim()) { setError('Category is required'); setSaving(false); return; }

    const cleanedForm = {
      ...form,
      images: form.images.filter(img => img.trim()),
      care: form.care.filter(c => c.trim()),
    };

    try {
      const url = isNew ? '/api/admin/products' : `/api/admin/products/${params.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedForm),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/admin/products');
      } else {
        setError(data.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products/${params.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/admin/products');
      } else {
        setError('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product');
    }
  };

  const removeImageField = (index: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const addCareField = () => setForm(prev => ({ ...prev, care: [...prev.care, ''] }));
  const removeCareField = (index: number) => setForm(prev => ({ ...prev, care: prev.care.filter((_, i) => i !== index) }));
  const updateCare = (index: number, value: string) => setForm(prev => ({ ...prev, care: prev.care.map((c, i) => (i === index ? value : c)) }));

  const addColorField = () => setForm(prev => ({ ...prev, colors: [...prev.colors, { name: '', hex: '#000000' }] }));
  const removeColorField = (index: number) => setForm(prev => ({ ...prev, colors: prev.colors.filter((_, i) => i !== index) }));
  const updateColor = (index: number, field: 'name' | 'hex', value: string) => {
    setForm(prev => ({ ...prev, colors: prev.colors.map((color, i) => i === index ? { ...color, [field]: value } : color) }));
  };

  const toggleSize = (size: string) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size],
    }));
  };

  if (status === 'loading' || loading) return <BrandLoader label="Product" sublabel="ZIBARASTUDIO" tone="crimson" />;

  if (!session) return null;

  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream">
      <div className="max-w-4xl mx-auto px-6 md:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-zibara-cream/5 pb-8 mb-10">
          <div className="flex items-start gap-4">
            <Link
              href="/admin/products"
              className="p-2 border border-zibara-cream/20 hover:border-zibara-cream/45 transition-colors text-zibara-cream/70 hover:text-zibara-cream shrink-0 mt-1"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-2">
                {isNew ? 'New' : 'Editing'}
              </p>
              <h1 className="font-cormorant text-4xl md:text-5xl font-light uppercase tracking-[0.15em] text-zibara-cream">
                {isNew ? 'Add Product' : 'Edit Product'}
              </h1>
              <p className="text-[11px] font-mono text-zibara-cream/65 mt-2">
                {isNew ? 'Create a new product' : 'Update product details'}
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
                Product Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-zibara-cream/35 focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 focus:border-transparent bg-zibara-black/40 text-zibara-cream"
                placeholder="e.g., CROCHET LACE ROMPER"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-zibara-cream/35 focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 focus:border-transparent bg-zibara-black/40 text-zibara-cream"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55 mb-2">
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-zibara-cream/35 focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 focus:border-transparent bg-zibara-black/40 text-zibara-cream"
                  disabled={categoriesLoading}
                >
                  <option value="">
                    {categoriesLoading ? 'Loading categories...' : 'Select a category'}
                  </option>
                  {categoryNames.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {categoryNames.length === 0 && !categoriesLoading && (
                  <p className="text-[9px] font-mono text-zibara-crimson/80 tracking-[0.2em] mt-1">
                    No categories found. <Link href="/admin/categories" className="underline">Create categories first</Link>
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55 mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-zibara-cream/35 focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 focus:border-transparent bg-zibara-black/40 text-zibara-cream"
                rows={4}
                placeholder="Describe your product..."
              />
            </div>

            <div>
              <label className="block text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55 mb-2">
                Material
              </label>
              <input
                type="text"
                value={form.material}
                onChange={(e) => setForm(prev => ({ ...prev, material: e.target.value }))}
                className="w-full px-4 py-3 border border-zibara-cream/35 focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 focus:border-transparent bg-zibara-black/40 text-zibara-cream"
                placeholder="e.g., 100% Premium Cotton Yarn"
              />
            </div>
          </div>

          {/* Images */}
          <div className="border border-zibara-cream/10 bg-zibara-deep p-5 md:p-6 space-y-4">
            <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase">Images</p>

            <ImageUploading
              multiple
              value={form.images.filter(img => img.trim()).map(url => ({ data_url: url }))}
              onChange={(imageList, addUpdateIndex) => {
                const index = Array.isArray(addUpdateIndex) ? addUpdateIndex[0] : addUpdateIndex;
                if (index !== undefined && imageList[index]?.file) {
                  uploadFile(imageList[index].file, index);
                }
              }}
              maxNumber={10}
              dataURLKey="data_url"
            >
              {({ imageList, onImageUpload, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {imageList.map((image, index) => {
                      const imageUrl = typeof image.data_url === 'string' ? image.data_url : '';
                      return (
                        <div key={index} className="relative w-28 h-28 overflow-hidden border border-zibara-cream/25">
                          <img
                            src={imageUrl}
                            alt={`Product image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
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
                    {uploading ? 'Uploading...' : 'Upload Images'}
                  </button>
                </div>
              )}
            </ImageUploading>
          </div>

          {/* Sizes */}
          <div className="border border-zibara-cream/10 bg-zibara-deep p-5 md:p-6">
            <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-4">Available Sizes</p>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-5 py-2 text-[10px] font-mono uppercase tracking-[0.3em] transition-colors ${
                    form.sizes.includes(size)
                      ? 'bg-zibara-crimson text-zibara-cream'
                      : 'border border-zibara-cream/20 text-zibara-cream/60 hover:border-zibara-cream/40 hover:text-zibara-cream/80'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="border border-zibara-cream/10 bg-zibara-deep p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase">Product Colors</p>
              <button
                type="button"
                onClick={addColorField}
                className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.3em] text-zibara-cream/60 hover:text-zibara-cream transition-colors"
              >
                <Plus size={12} />
                Add Color
              </button>
            </div>

            {form.colors.length === 0 ? (
              <p className="text-[11px] font-mono text-zibara-cream/40">No colors added yet. Click "Add Color" to add one.</p>
            ) : (
              <div className="space-y-2">
                {form.colors.map((color, index) => (
                  <div key={index} className="flex items-center gap-3 border border-zibara-cream/8 p-3">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="color"
                        value={color.hex}
                        onChange={(e) => updateColor(index, 'hex', e.target.value)}
                        className="w-10 h-10 border border-zibara-cream/25 cursor-pointer bg-transparent"
                        title="Select color"
                      />
                      <input
                        type="text"
                        value={color.name}
                        onChange={(e) => updateColor(index, 'name', e.target.value)}
                        className="flex-1 px-4 py-2 border border-zibara-cream/35 focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 focus:border-transparent bg-zibara-black/40 text-zibara-cream text-sm"
                        placeholder="Color name (e.g., Berry Red)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeColorField(index)}
                      className="p-2 border border-zibara-crimson/50 text-zibara-crimson hover:bg-zibara-crimson hover:text-zibara-cream transition-colors"
                      title="Remove color"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Care Instructions */}
          <div className="border border-zibara-cream/10 bg-zibara-deep p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase">Care Instructions</p>
              <button
                type="button"
                onClick={addCareField}
                className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.3em] text-zibara-cream/60 hover:text-zibara-cream transition-colors"
              >
                <Plus size={12} />
                Add Instruction
              </button>
            </div>

            {form.care.map((care, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={care}
                  onChange={(e) => updateCare(index, e.target.value)}
                  className="flex-1 px-4 py-3 border border-zibara-cream/35 focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 focus:border-transparent bg-zibara-black/40 text-zibara-cream"
                  placeholder="e.g., Hand wash cold"
                />
                {form.care.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCareField(index)}
                    className="p-2 border border-zibara-crimson/50 text-zibara-crimson hover:bg-zibara-crimson hover:text-zibara-cream transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="border border-zibara-cream/10 bg-zibara-deep p-5 md:p-6">
            <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-4">Status</p>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.inStock}
                  onChange={(e) => setForm(prev => ({ ...prev, inStock: e.target.checked }))}
                  className="w-4 h-4 border-zibara-cream/35 text-zibara-crimson focus:ring-zibara-gold/50"
                />
                <span className="text-[11px] font-mono text-zibara-cream/65">In Stock</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 border-zibara-cream/35 text-zibara-crimson focus:ring-zibara-gold/50"
                />
                <span className="text-[11px] font-mono text-zibara-cream/65">Featured Product</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/admin/products"
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
              {saving ? 'Saving...' : isNew ? 'Create Product' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
