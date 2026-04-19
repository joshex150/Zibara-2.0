'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Plus, X, Upload } from 'lucide-react';
import { useData } from '@/context/DataContext';
import ImageUploading from 'react-images-uploading';
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

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      toast.success('Image uploaded successfully!');
      
      if (imageIndex !== undefined) {
        // Update specific image
        setForm(prev => ({
          ...prev,
          images: prev.images.map((img, i) => (i === imageIndex ? data.url : img)),
        }));
      } else {
        // Add new image
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

    // Validation
    if (!form.name.trim()) {
      setError('Product name is required');
      setSaving(false);
      return;
    }
    if (form.price <= 0) {
      setError('Price must be greater than 0');
      setSaving(false);
      return;
    }
    if (!form.category.trim()) {
      setError('Category is required');
      setSaving(false);
      return;
    }

    // Filter out empty values
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
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${params.id}`, {
        method: 'DELETE',
      });

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
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const addCareField = () => {
    setForm(prev => ({ ...prev, care: [...prev.care, ''] }));
  };

  const removeCareField = (index: number) => {
    setForm(prev => ({
      ...prev,
      care: prev.care.filter((_, i) => i !== index),
    }));
  };

  const updateCare = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      care: prev.care.map((c, i) => (i === index ? value : c)),
    }));
  };

  const addColorField = () => {
    setForm(prev => ({ ...prev, colors: [...prev.colors, { name: '', hex: '#000000' }] }));
  };

  const removeColorField = (index: number) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const updateColor = (index: number, field: 'name' | 'hex', value: string) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.map((color, i) => 
        i === index ? { ...color, [field]: value } : color
      ),
    }));
  };

  const toggleSize = (size: string) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size],
    }));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="fixed inset-0 bg-[#EBB0C9] flex items-center justify-center z-50">
        <div className="animate-pulse">
          <img 
            src="/logo.jpeg" 
            alt="Loading" 
            className="w-32 h-32 md:w-48 md:h-48 object-contain"
          />
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#EBB0C9] scroll-mt-32">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/products"
              className="p-2 bg-[#f5d5e5] rounded-lg hover:bg-[#d896b5]/30 transition-colors"
            >
              <ArrowLeft size={20} className="text-[#8b2b4d]" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[#8b2b4d] uppercase tracking-wider">
                {isNew ? 'Add Product' : 'Edit Product'}
              </h1>
              <p className="text-gray-700 text-sm mt-1">
                {isNew ? 'Create a new product' : 'Update product details'}
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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-[#f5d5e5] rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#8b2b4d] mb-4">Basic Information</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent bg-white"
                placeholder="e.g., CROCHET LACE ROMPER"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent bg-white"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-[#8b2b4d]/20 focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent bg-[#f5d5e5] text-[#8b2b4d]"
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
                  <p className="text-xs text-red-600 mt-1">
                    No categories found. <Link href="/admin/categories" className="underline">Create categories first</Link>
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent bg-white"
                rows={4}
                placeholder="Describe your product..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Material
              </label>
              <input
                type="text"
                value={form.material}
                onChange={(e) => setForm(prev => ({ ...prev, material: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent bg-white"
                placeholder="e.g., 100% Premium Cotton Yarn"
              />
            </div>
          </div>

          {/* Images */}
          <div className="bg-[#f5d5e5] rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#8b2b4d]">Images</h2>
            
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
                            alt={`Product image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => onImageUpdate(index)}
                              className="px-3 py-1 bg-white text-gray-700 rounded text-xs font-semibold hover:bg-gray-100"
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
                        ? 'bg-[#8b2b4d] text-white'
                        : 'bg-white text-[#8b2b4d] border-2 border-[#8b2b4d] hover:bg-[#8b2b4d] hover:text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Upload size={18} />
                    {uploading ? 'Uploading...' : 'Upload Images'}
                  </button>
                </div>
              )}
            </ImageUploading>
          </div>

          {/* Sizes */}
          <div className="bg-[#f5d5e5] rounded-lg p-6">
            <h2 className="text-lg font-bold text-[#8b2b4d] mb-4">Available Sizes</h2>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-6 py-3 rounded-full font-semibold transition-colors ${
                    form.sizes.includes(size)
                      ? 'bg-[#8b2b4d] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="bg-[#f5d5e5] rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#8b2b4d]">Product Colors</h2>
              <button
                type="button"
                onClick={addColorField}
                className="flex items-center gap-1 text-sm text-[#8b2b4d] hover:underline"
              >
                <Plus size={16} />
                Add Color
              </button>
            </div>

            {form.colors.length === 0 ? (
              <p className="text-sm text-gray-600 italic">No colors added yet. Click "Add Color" to add one.</p>
            ) : (
              <div className="space-y-3">
                {form.colors.map((color, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="color"
                        value={color.hex}
                        onChange={(e) => updateColor(index, 'hex', e.target.value)}
                        className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                        title="Select color"
                      />
                      <input
                        type="text"
                        value={color.name}
                        onChange={(e) => updateColor(index, 'name', e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent bg-white"
                        placeholder="Color name (e.g., Berry Red)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeColorField(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove color"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Care Instructions */}
          <div className="bg-[#f5d5e5] rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#8b2b4d]">Care Instructions</h2>
              <button
                type="button"
                onClick={addCareField}
                className="flex items-center gap-1 text-sm text-[#8b2b4d] hover:underline"
              >
                <Plus size={16} />
                Add Instruction
              </button>
            </div>

            {form.care.map((care, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={care}
                  onChange={(e) => updateCare(index, e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent bg-white"
                  placeholder="e.g., Hand wash cold"
                />
                {form.care.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCareField(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="bg-[#f5d5e5] rounded-lg p-6">
            <h2 className="text-lg font-bold text-[#8b2b4d] mb-4">Status</h2>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.inStock}
                  onChange={(e) => setForm(prev => ({ ...prev, inStock: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 text-[#8b2b4d] focus:ring-[#8b2b4d]"
                />
                <span className="text-sm font-medium text-gray-700">In Stock</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 text-[#8b2b4d] focus:ring-[#8b2b4d]"
                />
                <span className="text-sm font-medium text-gray-700">Featured Product</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/admin/products"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-[#8b2b4d] text-white rounded-lg font-semibold hover:bg-[#6d1f3a] transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Saving...' : isNew ? 'Create Product' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
