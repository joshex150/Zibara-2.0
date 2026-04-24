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
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Failed to upload file');
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
      if (data.success) setCategories(data.data);
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
      setForm({ name: '', description: '', image: '', order: categories.length, isActive: true });
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
    if (!form.name.trim()) { setError('Category name is required'); return; }
    setSaving(true);
    setError('');
    try {
      const url = editingCategory ? `/api/admin/categories/${editingCategory._id}` : '/api/admin/categories';
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
      if (res.ok) fetchCategories();
    } catch (error) {
      console.error('Error toggling category:', error);
    }
  };

  const deleteCategory = async (category: Category) => {
    const count = productCounts[category.name] || 0;
    if (count > 0) {
      toast.error(`Cannot delete "${category.name}" — it has ${count} product(s). Reassign products first.`);
      return;
    }
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${category._id}`, { method: 'DELETE' });
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
                Categories
              </h1>
              <p className="text-[11px] font-mono text-zibara-cream/65 mt-2">
                {categories.length} {categories.length === 1 ? 'category' : 'categories'}
              </p>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-5 py-2 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-zibara-blood transition-colors shrink-0"
          >
            <Plus size={14} />
            Add Category
          </button>
        </div>

        {/* Categories List */}
        {categories.length === 0 ? (
          <div className="border border-zibara-cream/10 p-12 text-center">
            <FolderOpen className="w-8 h-8 mx-auto text-zibara-cream/20 mb-4" />
            <p className="text-[11px] font-mono text-zibara-cream/65 mb-6">No categories yet</p>
            <button
              onClick={() => openModal()}
              className="px-5 py-2 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-zibara-blood transition-colors"
            >
              Create Your First Category
            </button>
          </div>
        ) : (
          <div className="border border-zibara-cream/10 bg-zibara-deep">
            {categories.map((category, idx) => (
              <div
                key={category._id}
                className={`flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 ${
                  idx < categories.length - 1 ? 'border-b border-zibara-cream/8' : ''
                } ${!category.isActive ? 'opacity-50' : ''}`}
              >
                {/* Category Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="hidden sm:flex items-center justify-center w-6 text-zibara-cream/25">
                    <GripVertical size={16} />
                  </div>

                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-12 h-12 object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 border border-zibara-cream/10 flex items-center justify-center shrink-0">
                      <FolderOpen className="w-5 h-5 text-zibara-cream/25" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-zibara-cream text-[11px] font-mono uppercase tracking-[0.1em] truncate">
                        {category.name}
                      </h3>
                      {!category.isActive && (
                        <span className="text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 border border-zibara-cream/15 text-zibara-cream/40">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] font-mono text-zibara-cream/40 tracking-[0.3em] uppercase">
                      {productCounts[category.name] || 0} product{(productCounts[category.name] || 0) !== 1 ? 's' : ''}
                    </p>
                    {category.description && (
                      <p className="text-[11px] font-mono text-zibara-cream/55 mt-1 line-clamp-1 hidden md:block">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(category)}
                    className={`p-2 border transition-colors ${
                      category.isActive
                        ? 'border-zibara-cream/25 text-zibara-cream/65 hover:border-zibara-cream/50 hover:text-zibara-cream'
                        : 'border-zibara-crimson/50 text-zibara-crimson hover:bg-zibara-crimson hover:text-zibara-cream'
                    }`}
                    title={category.isActive ? 'Hide category' : 'Show category'}
                  >
                    {category.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => openModal(category)}
                    className="p-2 bg-zibara-crimson text-zibara-cream hover:bg-zibara-blood transition-colors"
                    title="Edit category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteCategory(category)}
                    className="p-2 border border-zibara-crimson/50 text-zibara-crimson hover:bg-zibara-crimson hover:text-zibara-cream transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-zibara-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zibara-deep border border-zibara-cream/10 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zibara-cream/8 flex justify-between items-center">
              <div>
                <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-1">
                  {editingCategory ? 'Editing' : 'New'}
                </p>
                <h2 className="font-cormorant text-2xl font-light uppercase tracking-[0.15em] text-zibara-cream">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-2 border border-zibara-cream/20 hover:border-zibara-cream/45 transition-colors text-zibara-cream/70 hover:text-zibara-cream text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-3 border border-red-500/30 text-red-400 text-[11px] font-mono">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-zibara-cream/35 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 focus:border-transparent bg-zibara-black/40 text-zibara-cream"
                  placeholder="e.g. Tops, Dresses"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55 mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-zibara-cream/35 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 focus:border-transparent bg-zibara-black/40 text-zibara-cream"
                  rows={2}
                  placeholder="Brief description of this category"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55 mb-2">
                  Category Image
                </label>
                <ImageUploading
                  multiple={false}
                  value={form.image ? [{ data_url: form.image }] : []}
                  onChange={(imageList) => {
                    if (imageList[0]?.file) uploadFile(imageList[0].file);
                  }}
                  maxNumber={1}
                  dataURLKey="data_url"
                >
                  {({ imageList, onImageUpload, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                    <div className="space-y-2">
                      {form.image && (
                        <div className="relative w-32 h-32 overflow-hidden border border-zibara-cream/25">
                          <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => onImageUpdate(0)}
                              className="px-3 py-1 border border-zibara-cream/25 text-[10px] font-mono uppercase tracking-[0.3em] text-zibara-cream/65 hover:border-zibara-cream/50 hover:text-zibara-cream transition-colors"
                            >
                              Update
                            </button>
                            <button
                              type="button"
                              onClick={() => { onImageRemove(0); setForm(prev => ({ ...prev, image: '' })); }}
                              className="px-3 py-1 border border-zibara-crimson/50 text-zibara-crimson text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-zibara-crimson hover:text-zibara-cream transition-colors"
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
                        className={`flex items-center gap-2 px-5 py-2 text-[10px] font-mono uppercase tracking-[0.3em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          isDragging
                            ? 'bg-zibara-crimson text-zibara-cream'
                            : 'border border-zibara-cream/25 text-zibara-cream/65 hover:border-zibara-cream/50 hover:text-zibara-cream'
                        }`}
                      >
                        <Upload size={14} />
                        {uploading ? 'Uploading...' : form.image ? 'Change Image' : 'Upload Image'}
                      </button>
                    </div>
                  )}
                </ImageUploading>
              </div>

              <div>
                <label className="block text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                  className="w-full border border-zibara-cream/35 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 focus:border-transparent bg-zibara-black/40 text-zibara-cream"
                  min="0"
                />
                <p className="text-[9px] font-mono text-zibara-cream/40 tracking-[0.2em] mt-1">Lower numbers appear first</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-[11px] font-mono text-zibara-cream/65">
                  Active (visible on site)
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 px-5 border border-zibara-cream/25 text-[10px] font-mono uppercase tracking-[0.3em] text-zibara-cream/65 hover:border-zibara-cream/50 hover:text-zibara-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 px-5 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-zibara-blood transition-colors disabled:opacity-50"
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
