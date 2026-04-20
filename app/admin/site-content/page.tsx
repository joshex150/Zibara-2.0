'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import BrandLoader from '@/components/BrandLoader';
import toast from 'react-hot-toast';
import ImageUploading from 'react-images-uploading';

interface SiteContent {
  _id: string;
  key: string;
  type: 'text' | 'image' | 'richtext' | 'array';
  value: any;
  section: string;
  description: string;
}

export default function AdminSiteContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contents, setContents] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  const [editingContent, setEditingContent] = useState<SiteContent | null>(null);
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
      setEditingContent(prev => prev ? { ...prev, value: data.url } : null);
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
      fetchContent();
    }
  }, [status, router]);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/admin/site-content');
      const data = await res.json();
      
      if (data.success) {
        setContents(data.data);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (content: SiteContent) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/site-content/${content._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: content.value }),
      });

      if (res.ok) {
        fetchContent();
        setEditingContent(null);
        toast.success('Content updated successfully!');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const sections = [...new Set(contents.map(c => c.section))];
  const filteredContents = filter === 'all' 
    ? contents 
    : contents.filter(c => c.section === filter);

  if (status === 'loading' || loading) return <BrandLoader label="Site Content" sublabel="ZIBARASTUDIO" tone="crimson" />;

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-900 scroll-mt-32 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
          <Link 
            href="/admin"
            className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors shrink-0"
          >
            <ArrowLeft size={18} className="md:w-5 md:h-5 text-zibara-cream" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zibara-cream uppercase tracking-wider">
              Site Content
            </h1>
            <p className="text-zinc-300 text-xs md:text-sm mt-1">
              Edit text, images, and content across the site
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 md:mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm ${
              filter === 'all'
                ? 'bg-zibara-crimson text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            All ({contents.length})
          </button>
          {sections.map(section => (
            <button
              key={section}
              onClick={() => setFilter(section)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium capitalize text-xs md:text-sm ${
                filter === section
                  ? 'bg-zibara-crimson text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {section} ({contents.filter(c => c.section === section).length})
            </button>
          ))}
        </div>

        {/* Content Grid */}
        {filteredContents.length === 0 ? (
          <div className="bg-zibara-crimson rounded-lg p-8 md:p-12 text-center flex-1 flex flex-col items-center justify-center">
            <p className="text-base md:text-lg text-white mb-3 md:mb-4">No content found</p>
            <p className="text-xs md:text-sm text-white/80">
              Run the seed script to populate site content.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredContents.map((content) => (
              <div key={content._id} className="bg-zinc-800 rounded-lg shadow-md p-4 md:p-6 flex flex-col">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-zinc-100 text-xs md:text-sm break-all">{content.key}</h3>
                    <span className="text-[10px] md:text-xs bg-zibara-crimson text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded shrink-0">
                      {content.type}
                    </span>
                  </div>
                  <p className="text-[10px] md:text-xs text-zinc-400 mb-2 md:mb-3">{content.description}</p>
                  
                  {content.type === 'image' ? (
                    <div className="aspect-video bg-zinc-700 rounded overflow-hidden">
                      <img 
                        src={content.value} 
                        alt={content.key}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <p className="text-xs md:text-sm text-gray-800 line-clamp-3">
                      {typeof content.value === 'string' 
                        ? content.value 
                        : JSON.stringify(content.value)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setEditingContent(content)}
                  className="w-full bg-zibara-crimson text-white px-4 py-2 rounded text-xs md:text-sm font-semibold hover:bg-zibara-blood transition-colors mt-3 md:mt-4"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editingContent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
            <div className="bg-zinc-800 rounded-lg max-w-2xl w-full max-h-[95vh] overflow-y-auto">
              <div className="p-4 md:p-6 border-b">
                <h2 className="text-lg md:text-2xl font-bold text-zinc-100">
                  Edit Content
                </h2>
                <p className="text-xs md:text-sm text-zinc-400 mt-1">{editingContent.description}</p>
              </div>
              
              <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                {/* Read-only info */}
                <div className="bg-white/50 rounded-lg p-3 md:p-4 space-y-1.5 md:space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] md:text-xs font-semibold text-zinc-500 uppercase">Key:</span>
                    <span className="text-xs md:text-sm text-zinc-100 break-all">{editingContent.key}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] md:text-xs font-semibold text-zinc-500 uppercase">Section:</span>
                    <span className="text-xs md:text-sm text-zinc-100 capitalize">{editingContent.section}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] md:text-xs font-semibold text-zinc-500 uppercase">Type:</span>
                    <span className="text-xs md:text-sm text-zinc-100 capitalize">{editingContent.type}</span>
                  </div>
                </div>

                {/* Value input */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-zinc-300 mb-1.5 md:mb-2">
                    Value
                  </label>
                  {editingContent.type === 'richtext' || editingContent.type === 'text' ? (
                    <textarea
                      value={editingContent.value}
                      onChange={(e) => setEditingContent({
                        ...editingContent,
                        value: e.target.value,
                      })}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent min-h-[120px] md:min-h-[150px] text-sm bg-white"
                      placeholder="Enter content..."
                    />
                  ) : editingContent.type === 'image' ? (
                    <div className="space-y-2 md:space-y-3">
                      <ImageUploading
                        multiple={false}
                        value={editingContent.value ? [{ data_url: editingContent.value }] : []}
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
                          <div className="space-y-3">
                            {editingContent.value && (
                              <div className="relative aspect-video bg-zinc-700 rounded-lg overflow-hidden border-2 border-gray-300">
                                <img 
                                  src={editingContent.value} 
                                  alt="Preview" 
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => onImageUpdate(0)}
                                    className="px-4 py-2 bg-white text-zinc-300 rounded text-sm font-semibold hover:bg-zinc-700"
                                  >
                                    Update
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onImageRemove(0);
                                      setEditingContent(prev => prev ? { ...prev, value: '' } : null);
                                    }}
                                    className="px-4 py-2 bg-red-500 text-white rounded text-sm font-semibold hover:bg-red-600"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            <button
                              type="button"
                              onClick={editingContent.value ? () => onImageUpdate(0) : onImageUpload}
                              {...dragProps}
                              disabled={uploading}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                                isDragging
                                  ? 'bg-zibara-crimson text-white'
                                  : 'bg-zinc-700 text-zinc-200 border border-zinc-600 hover:bg-zinc-600'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              <Upload size={16} />
                              {uploading ? 'Uploading...' : editingContent.value ? 'Change Image' : 'Upload Image'}
                            </button>
                            
                            <input
                              type="url"
                              value={editingContent.value}
                              onChange={(e) => setEditingContent({
                                ...editingContent,
                                value: e.target.value,
                              })}
                              className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent text-sm bg-white"
                              placeholder="Or paste image URL here"
                            />
                          </div>
                        )}
                      </ImageUploading>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={editingContent.value}
                      onChange={(e) => setEditingContent({
                        ...editingContent,
                        value: e.target.value,
                      })}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent text-sm bg-white"
                      placeholder="Value"
                    />
                  )}
                </div>
              </div>

              <div className="p-4 md:p-6 border-t flex flex-col sm:flex-row justify-end gap-2 md:gap-4">
                <button
                  onClick={() => setEditingContent(null)}
                  className="px-4 md:px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-zinc-800/60 transition-colors text-sm order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(editingContent)}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 bg-zibara-crimson text-white px-4 md:px-6 py-2 rounded-lg font-semibold hover:bg-zibara-blood transition-colors disabled:opacity-50 text-sm order-1 sm:order-2"
                >
                  <Save size={14} className="md:w-4 md:h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
