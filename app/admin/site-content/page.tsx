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
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Failed to upload file');
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
      if (data.success) setContents(data.data);
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
  const filteredContents = filter === 'all' ? contents : contents.filter(c => c.section === filter);

  if (status === 'loading' || loading) return <BrandLoader label="Site Content" sublabel="ZIBARASTUDIO" tone="crimson" />;

  if (!session) return null;

  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream">
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-zibara-cream/5 pb-8 mb-10">
          <Link
            href="/admin"
            className="p-2 border border-zibara-cream/20 hover:border-zibara-cream/45 transition-colors text-zibara-cream/70 hover:text-zibara-cream shrink-0 mt-1"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-2">Editorial</p>
            <h1 className="font-cormorant text-4xl md:text-5xl font-light uppercase tracking-[0.15em] text-zibara-cream">
              Site Content
            </h1>
            <p className="text-[11px] font-mono text-zibara-cream/65 mt-2">
              Edit text, images, and content across the site
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={filter === 'all'
              ? 'px-3 py-1.5 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em]'
              : 'px-3 py-1.5 border border-zibara-cream/20 text-[10px] font-mono uppercase tracking-[0.3em] text-zibara-cream/60 hover:border-zibara-cream/40 hover:text-zibara-cream/80 transition-colors'
            }
          >
            All ({contents.length})
          </button>
          {sections.map(section => (
            <button
              key={section}
              onClick={() => setFilter(section)}
              className={filter === section
                ? 'px-3 py-1.5 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em]'
                : 'px-3 py-1.5 border border-zibara-cream/20 text-[10px] font-mono uppercase tracking-[0.3em] text-zibara-cream/60 hover:border-zibara-cream/40 hover:text-zibara-cream/80 transition-colors'
              }
            >
              {section} ({contents.filter(c => c.section === section).length})
            </button>
          ))}
        </div>

        {/* Content Grid */}
        {filteredContents.length === 0 ? (
          <div className="border border-zibara-cream/10 p-12 text-center">
            <p className="text-[11px] font-mono text-zibara-cream/65 mb-2">No content found</p>
            <p className="text-[11px] font-mono text-zibara-cream/40">Run the seed script to populate site content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-zibara-cream/5 border border-zibara-cream/5">
            {filteredContents.map((content) => (
              <div key={content._id} className="bg-zibara-black p-5 flex flex-col">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zibara-cream break-all">{content.key}</h3>
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 border border-zibara-cream/20 text-zibara-cream/55 shrink-0">
                      {content.type}
                    </span>
                  </div>
                  <p className="text-[9px] font-mono text-zibara-cream/40 tracking-[0.2em] uppercase mb-3">{content.description}</p>

                  {content.type === 'image' ? (
                    <div className="aspect-video bg-zibara-deep overflow-hidden">
                      <img
                        src={content.value}
                        alt={content.key}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <p className="text-[11px] font-mono text-zibara-cream/65 line-clamp-3 leading-relaxed">
                      {typeof content.value === 'string' ? content.value : JSON.stringify(content.value)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setEditingContent(content)}
                  className="w-full mt-4 px-5 py-2 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-zibara-blood transition-colors"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editingContent && (
          <div className="fixed inset-0 bg-zibara-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-zibara-deep border border-zibara-cream/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-zibara-cream/8">
                <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-1">Editing</p>
                <h2 className="font-cormorant text-2xl font-light uppercase tracking-[0.15em] text-zibara-cream mb-1">
                  Content Block
                </h2>
                <p className="text-[11px] font-mono text-zibara-cream/55">{editingContent.description}</p>
              </div>

              <div className="p-6 space-y-4">
                {/* Read-only info */}
                <div className="border border-zibara-cream/8 p-4 space-y-2 bg-zibara-black/20">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55">Key:</span>
                    <span className="text-[11px] font-mono text-zibara-cream/80 break-all">{editingContent.key}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55">Section:</span>
                    <span className="text-[11px] font-mono text-zibara-cream/80 capitalize">{editingContent.section}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55">Type:</span>
                    <span className="text-[11px] font-mono text-zibara-cream/80 capitalize">{editingContent.type}</span>
                  </div>
                </div>

                {/* Value input */}
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55 mb-2">
                    Value
                  </label>
                  {editingContent.type === 'richtext' || editingContent.type === 'text' ? (
                    <textarea
                      value={editingContent.value}
                      onChange={(e) => setEditingContent({ ...editingContent, value: e.target.value })}
                      className="w-full px-4 py-3 border border-zibara-cream/35 focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 focus:border-transparent min-h-[150px] text-sm bg-zibara-black/40 text-zibara-cream"
                      placeholder="Enter content..."
                    />
                  ) : editingContent.type === 'image' ? (
                    <div className="space-y-3">
                      <ImageUploading
                        multiple={false}
                        value={editingContent.value ? [{ data_url: editingContent.value }] : []}
                        onChange={(imageList) => {
                          if (imageList[0]?.file) uploadFile(imageList[0].file);
                        }}
                        maxNumber={1}
                        dataURLKey="data_url"
                      >
                        {({ imageList, onImageUpload, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                          <div className="space-y-3">
                            {editingContent.value && (
                              <div className="relative aspect-video bg-zibara-deep overflow-hidden border border-zibara-cream/25">
                                <img src={editingContent.value} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => onImageUpdate(0)}
                                    className="px-4 py-2 border border-zibara-cream/25 text-[10px] font-mono uppercase tracking-[0.3em] text-zibara-cream/65 hover:border-zibara-cream/50 hover:text-zibara-cream transition-colors"
                                  >
                                    Update
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onImageRemove(0);
                                      setEditingContent(prev => prev ? { ...prev, value: '' } : null);
                                    }}
                                    className="px-4 py-2 border border-zibara-crimson/50 text-zibara-crimson text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-zibara-crimson hover:text-zibara-cream transition-colors"
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
                              className={`flex items-center gap-2 px-5 py-2 text-[10px] font-mono uppercase tracking-[0.3em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                isDragging
                                  ? 'bg-zibara-crimson text-zibara-cream'
                                  : 'border border-zibara-cream/25 text-zibara-cream/65 hover:border-zibara-cream/50 hover:text-zibara-cream'
                              }`}
                            >
                              <Upload size={14} />
                              {uploading ? 'Uploading...' : editingContent.value ? 'Change Image' : 'Upload Image'}
                            </button>

                            <input
                              type="url"
                              value={editingContent.value}
                              onChange={(e) => setEditingContent({ ...editingContent, value: e.target.value })}
                              className="w-full px-4 py-3 border border-zibara-cream/35 focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 focus:border-transparent text-sm bg-zibara-black/40 text-zibara-cream"
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
                      onChange={(e) => setEditingContent({ ...editingContent, value: e.target.value })}
                      className="w-full px-4 py-3 border border-zibara-cream/35 focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 focus:border-transparent text-sm bg-zibara-black/40 text-zibara-cream"
                      placeholder="Value"
                    />
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-zibara-cream/8 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setEditingContent(null)}
                  className="px-5 py-2 border border-zibara-cream/25 text-[10px] font-mono uppercase tracking-[0.3em] text-zibara-cream/65 hover:border-zibara-cream/50 hover:text-zibara-cream transition-colors order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(editingContent)}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-5 py-2 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-zibara-blood transition-colors disabled:opacity-50 order-1 sm:order-2"
                >
                  <Save size={12} />
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
