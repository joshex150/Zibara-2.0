'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, FolderOpen, GripVertical, Eye, EyeOff, Upload } from 'lucide-react';
import BrandLoader from '@/components/BrandLoader';
import toast from 'react-hot-toast';
import ImageUploading from 'react-images-uploading';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    image: '',
    order: 0,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File) => {
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
      setForm(prev => ({ ...prev, image: data.url }));
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
      fetchCategories();
      fetchProductCounts();
    }
  }, [status, router]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductCounts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      
      if (data.success) {
        const counts: Record<string, number> = {};
        data.data.forEach((product: { category: string }) => {
          counts[product.category] = (counts[product.category] || 0) + 1;
        });
        setProductCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching product counts:', error);
    }
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setForm({
        name: category.name,
        description: category.description,
        image: category.image,
        order: category.order,
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setForm({
        name: '',
        description: '',
        image: '',
        order: categories.length,
        isActive: true,
      });
    }
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Category name is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory._id}`
        : '/api/admin/categories';
      
      const res = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        fetchCategories();
        fetchProductCounts();
        closeModal();
      } else {
        setError(data.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (category: Category) => {
    try {
      const res = await fetch(`/api/admin/categories/${category._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !category.isActive }),
      });

      if (res.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error toggling category:', error);
    }
  };

  const deleteCategory = async (category: Category) => {
    const count = productCounts[category.name] || 0;
    if (count > 0) {
      toast.error(`Cannot delete "${category.name}" because it has ${count} product(s). Reassign the products to another category first.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${category._id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Category deleted successfully!');
        fetchCategories();
      } else {
        toast.error(data.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  if (status === 'loading' || loading) return <BrandLoader label="Categories" sublabel="ZIBARASTUDIO" tone="crimson" />;

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col scroll-mt-32">
      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <Link 
              href="/admin"
              className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors shrink-0"
            >
              <ArrowLeft size={18} className="md:w-5 md:h-5 text-zibara-cream" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zibara-cream uppercase tracking-wider">
                Categories
              </h1>
              <p className="text-zinc-300 text-xs md:text-sm mt-1">
                {categories.length} {categories.length === 1 ? 'category' : 'categories'}
              </p>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 bg-zibara-crimson text-white px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-semibold hover:bg-zibara-blood transition-colors"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            Add Category
          </button>
        </div>

        {/* Categories List */}
        {categories.length === 0 ? (
          <div className="bg-zibara-crimson rounded-lg p-8 md:p-12 text-center flex-1 flex flex-col items-center justify-center">
            <FolderOpen className="w-10 h-10 md:w-12 md:h-12 mx-auto text-white/60 mb-3 md:mb-4" />
            <p className="text-base md:text-lg text-white mb-3 md:mb-4">No categories yet</p>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 bg-white text-zibara-cream px-4 md:px-6 py-2 md:py-3 rounded-lg text-xs md:text-sm font-semibold hover:bg-zinc-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Your First Category
            </button>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {categories.map((category) => (
              <div 
                key={category._id} 
                className={`bg-zinc-800 rounded-lg shadow-md p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${
                  !category.isActive ? 'opacity-60' : ''
                }`}
              >
                {/* Category Info */}
                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                  <div className="hidden sm:flex items-center justify-center w-8 h-8 text-zinc-500">
                    <GripVertical size={20} />
                  </div>
                  
                  {category.image ? (
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-zinc-700/40 rounded-lg flex items-center justify-center shrink-0">
                      <FolderOpen className="w-5 h-5 md:w-6 md:h-6 text-zibara-cream/50" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-zinc-100 text-sm md:text-base truncate">
                        {category.name}
                      </h3>
                      {!category.isActive && (
                        <span className="text-[10px] md:text-xs bg-zinc-800/600 text-white px-2 py-0.5 rounded">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] md:text-xs text-zinc-400">
                      {productCounts[category.name] || 0} product{(productCounts[category.name] || 0) !== 1 ? 's' : ''}
                    </p>
                    {category.description && (
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-1 hidden md:block">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-auto sm:mt-0">
                  <button
                    onClick={() => toggleActive(category)}
                    className={`p-2 rounded-lg transition-colors ${
                      category.isActive 
                        ? 'bg-zibara-crimson text-white hover:bg-zibara-blood' 
                        : 'bg-gray-200 text-zinc-400 hover:bg-gray-300'
                    }`}
                    title={category.isActive ? 'Hide category' : 'Show category'}
                  >
                    {category.isActive ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openModal(category)}
                    className="p-2 bg-zibara-crimson text-white rounded-lg hover:bg-zibara-blood transition-colors"
                    title="Edit category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCategory(category)}
                    className="p-2 bg-zibara-crimson text-white rounded-lg hover:bg-zibara-blood transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-zinc-700">
              <div className="flex justify-between items-center">
                <h2 className="text-lg md:text-xl font-bold text-zinc-100">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-zinc-500 hover:text-zinc-400 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-950/50 border border-red-500/30 text-red-300 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent bg-white"
                  placeholder="e.g. Tops, Dresses"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent bg-white"
                  rows={2}
                  placeholder="Brief description of this category"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                  Category Image
                </label>
                <ImageUploading
                  multiple={false}
                  value={form.image ? [{ data_url: form.image }] : []}
                  onChange={(imageList) => {
                    if (imageList[0]?.file) {
                      uploadFile(imageList[0].file);
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
                    <div className="space-y-2">
                      {form.image && (
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-300">
                          <img 
                            src={form.image} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => onImageUpdate(0)}
                              className="px-3 py-1 bg-white text-zinc-300 rounded text-xs font-semibold hover:bg-zinc-700"
                            >
                              Update
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onImageRemove(0);
                                setForm(prev => ({ ...prev, image: '' }));
                              }}
                              className="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={form.image ? () => onImageUpdate(0) : onImageUpload}
                        {...dragProps}
                        disabled={uploading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                          isDragging
                            ? 'bg-zibara-crimson text-white'
                            : 'bg-zinc-700 text-zinc-200 border border-zinc-600 hover:bg-zinc-600'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <Upload size={16} />
                        {uploading ? 'Uploading...' : form.image ? 'Change Image' : 'Upload Image'}
                      </button>
                    </div>
                  )}
                </ImageUploading>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent bg-white"
                  min="0"
                />
                <p className="text-xs text-zinc-500 mt-1">Lower numbers appear first</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm">
                  Active (visible on site)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 border border-zinc-700 rounded-lg text-sm font-semibold hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-zibara-crimson text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-zibara-blood transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
