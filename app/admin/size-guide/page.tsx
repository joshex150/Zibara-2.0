'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, Ruler } from 'lucide-react';
import BrandLoader from '@/components/BrandLoader';
import toast from 'react-hot-toast';

interface ProductMeasurement {
  size: string;
  bust: number;
  waist: number;
  hip: number;
  length: number;
  sleeve: number;
  cuff: number;
}

interface BodyMeasurement {
  size: string;
  height: string;
  bust: string;
  waist: string;
  hip: string;
}

interface SizeGuideData {
  _id?: string;
  productMeasurements: ProductMeasurement[];
  bodyMeasurements: BodyMeasurement[];
  fitType: 'skinny' | 'regular' | 'oversized';
  stretch: 'none' | 'slight' | 'medium' | 'high';
  measurementTips: string[];
  sizeTips: string[];
}

const defaultProductMeasurement: ProductMeasurement = { size: '', bust: 0, waist: 0, hip: 0, length: 0, sleeve: 0, cuff: 0 };
const defaultBodyMeasurement: BodyMeasurement = { size: '', height: '', bust: '', waist: '', hip: '' };

export default function AdminSizeGuidePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'product' | 'body' | 'settings'>('product');
  const [data, setData] = useState<SizeGuideData>({
    productMeasurements: [],
    bodyMeasurements: [],
    fitType: 'regular',
    stretch: 'slight',
    measurementTips: [''],
    sizeTips: [''],
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchSizeGuide();
    }
  }, [status, router]);

  const fetchSizeGuide = async () => {
    try {
      const res = await fetch('/api/admin/size-guide');
      const result = await res.json();
      if (result.success && result.data) {
        setData({
          ...result.data,
          measurementTips: result.data.measurementTips?.length ? result.data.measurementTips : [''],
          sizeTips: result.data.sizeTips?.length ? result.data.sizeTips : [''],
        });
      }
    } catch (error) {
      console.error('Error fetching size guide:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const cleanedData = {
        ...data,
        measurementTips: data.measurementTips.filter(t => t.trim()),
        sizeTips: data.sizeTips.filter(t => t.trim()),
      };
      const res = await fetch('/api/admin/size-guide', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });
      if (res.ok) {
        toast.success('Size guide saved successfully!');
      } else {
        toast.error('Failed to save size guide');
      }
    } catch (error) {
      console.error('Error saving size guide:', error);
      toast.error('Failed to save size guide');
    } finally {
      setSaving(false);
    }
  };

  const addProductMeasurement = () => {
    setData(prev => ({ ...prev, productMeasurements: [...prev.productMeasurements, { ...defaultProductMeasurement }] }));
  };

  const updateProductMeasurement = (index: number, field: keyof ProductMeasurement, value: string | number) => {
    setData(prev => ({
      ...prev,
      productMeasurements: prev.productMeasurements.map((m, i) => i === index ? { ...m, [field]: value } : m),
    }));
  };

  const removeProductMeasurement = (index: number) => {
    setData(prev => ({ ...prev, productMeasurements: prev.productMeasurements.filter((_, i) => i !== index) }));
  };

  const addBodyMeasurement = () => {
    setData(prev => ({ ...prev, bodyMeasurements: [...prev.bodyMeasurements, { ...defaultBodyMeasurement }] }));
  };

  const updateBodyMeasurement = (index: number, field: keyof BodyMeasurement, value: string) => {
    setData(prev => ({
      ...prev,
      bodyMeasurements: prev.bodyMeasurements.map((m, i) => i === index ? { ...m, [field]: value } : m),
    }));
  };

  const removeBodyMeasurement = (index: number) => {
    setData(prev => ({ ...prev, bodyMeasurements: prev.bodyMeasurements.filter((_, i) => i !== index) }));
  };

  const addTip = (type: 'measurementTips' | 'sizeTips') => {
    setData(prev => ({ ...prev, [type]: [...prev[type], ''] }));
  };

  const updateTip = (type: 'measurementTips' | 'sizeTips', index: number, value: string) => {
    setData(prev => ({ ...prev, [type]: prev[type].map((t, i) => i === index ? value : t) }));
  };

  const removeTip = (type: 'measurementTips' | 'sizeTips', index: number) => {
    setData(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) }));
  };

  if (status === 'loading' || loading) return <BrandLoader label="Size Guide" sublabel="ZIBARASTUDIO" tone="crimson" />;

  if (!session) return null;

  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream">
      <div className="max-w-6xl mx-auto px-6 md:px-8 pt-24 pb-16">
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
              <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-2">Fit Guide</p>
              <h1 className="font-cormorant text-4xl md:text-5xl font-light uppercase tracking-[0.15em] text-zibara-cream">
                Size Guide
              </h1>
              <p className="text-[11px] font-mono text-zibara-cream/65 mt-2">Manage size charts and measurements</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-zibara-blood transition-colors disabled:opacity-50 shrink-0"
          >
            <Save size={12} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {(['product', 'body', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-[10px] font-mono uppercase tracking-[0.3em] whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-zibara-crimson text-zibara-cream'
                  : 'border border-zibara-cream/20 text-zibara-cream/60 hover:border-zibara-cream/40 hover:text-zibara-cream/80'
              }`}
            >
              {tab === 'product' ? 'Product Measurements' : tab === 'body' ? 'Body Measurements' : 'Settings & Tips'}
            </button>
          ))}
        </div>

        {/* Product Measurements Tab */}
        {activeTab === 'product' && (
          <div className="border border-zibara-cream/10 bg-zibara-deep p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase">Product Measurements (cm)</p>
              <button
                onClick={addProductMeasurement}
                className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.3em] text-zibara-cream/60 hover:text-zibara-cream transition-colors"
              >
                <Plus size={12} /> Add Size
              </button>
            </div>

            {data.productMeasurements.length === 0 ? (
              <div className="text-center py-8">
                <Ruler className="w-8 h-8 mx-auto mb-3 text-zibara-cream/20" />
                <p className="text-[11px] font-mono text-zibara-cream/40">No product measurements yet. Click "Add Size" to start.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zibara-cream/8">
                      <th className="py-2 px-2 text-left text-[9px] font-mono uppercase tracking-[0.3em] text-zibara-cream/55">Size</th>
                      <th className="py-2 px-2 text-center text-[9px] font-mono uppercase tracking-[0.3em] text-zibara-cream/55">Bust</th>
                      <th className="py-2 px-2 text-center text-[9px] font-mono uppercase tracking-[0.3em] text-zibara-cream/55">Waist</th>
                      <th className="py-2 px-2 text-center text-[9px] font-mono uppercase tracking-[0.3em] text-zibara-cream/55">Hip</th>
                      <th className="py-2 px-2 text-center text-[9px] font-mono uppercase tracking-[0.3em] text-zibara-cream/55">Length</th>
                      <th className="py-2 px-2 text-center text-[9px] font-mono uppercase tracking-[0.3em] text-zibara-cream/55">Sleeve</th>
                      <th className="py-2 px-2 text-center text-[9px] font-mono uppercase tracking-[0.3em] text-zibara-cream/55">Cuff</th>
                      <th className="py-2 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.productMeasurements.map((m, idx) => (
                      <tr key={idx} className="border-b border-zibara-cream/5">
                        <td className="py-2 px-1">
                          <input
                            type="text"
                            value={m.size}
                            onChange={(e) => updateProductMeasurement(idx, 'size', e.target.value)}
                            className="w-16 px-2 py-1 border border-zibara-cream/35 text-xs focus:outline-none focus:ring-1 focus:ring-zibara-gold/50 bg-zibara-black/40 text-zibara-cream"
                            placeholder="XS"
                          />
                        </td>
                        {(['bust', 'waist', 'hip', 'length', 'sleeve', 'cuff'] as const).map((field) => (
                          <td key={field} className="py-2 px-1">
                            <input
                              type="number"
                              value={m[field] || ''}
                              onChange={(e) => updateProductMeasurement(idx, field, parseFloat(e.target.value) || 0)}
                              className="w-16 px-2 py-1 border border-zibara-cream/35 text-xs text-center focus:outline-none focus:ring-1 focus:ring-zibara-gold/50 bg-zibara-black/40 text-zibara-cream"
                            />
                          </td>
                        ))}
                        <td className="py-2 px-1">
                          <button
                            onClick={() => removeProductMeasurement(idx)}
                            className="p-1 border border-zibara-crimson/40 text-zibara-crimson hover:bg-zibara-crimson hover:text-zibara-cream transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Body Measurements Tab */}
        {activeTab === 'body' && (
          <div className="border border-zibara-cream/10 bg-zibara-deep p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase">Body Measurements (cm)</p>
              <button
                onClick={addBodyMeasurement}
                className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.3em] text-zibara-cream/60 hover:text-zibara-cream transition-colors"
              >
                <Plus size={12} /> Add Size
              </button>
            </div>

            {data.bodyMeasurements.length === 0 ? (
              <div className="text-center py-8">
                <Ruler className="w-8 h-8 mx-auto mb-3 text-zibara-cream/20" />
                <p className="text-[11px] font-mono text-zibara-cream/40">No body measurements yet. Click "Add Size" to start.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zibara-cream/8">
                      <th className="py-2 px-2 text-left text-[9px] font-mono uppercase tracking-[0.3em] text-zibara-cream/55">Size</th>
                      <th className="py-2 px-2 text-center text-[9px] font-mono uppercase tracking-[0.3em] text-zibara-cream/55">Height</th>
                      <th className="py-2 px-2 text-center text-[9px] font-mono uppercase tracking-[0.3em] text-zibara-cream/55">Bust</th>
                      <th className="py-2 px-2 text-center text-[9px] font-mono uppercase tracking-[0.3em] text-zibara-cream/55">Waist</th>
                      <th className="py-2 px-2 text-center text-[9px] font-mono uppercase tracking-[0.3em] text-zibara-cream/55">Hip</th>
                      <th className="py-2 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bodyMeasurements.map((m, idx) => (
                      <tr key={idx} className="border-b border-zibara-cream/5">
                        <td className="py-2 px-1">
                          <input
                            type="text"
                            value={m.size}
                            onChange={(e) => updateBodyMeasurement(idx, 'size', e.target.value)}
                            className="w-16 px-2 py-1 border border-zibara-cream/35 text-xs focus:outline-none focus:ring-1 focus:ring-zibara-gold/50 bg-zibara-black/40 text-zibara-cream"
                            placeholder="XS"
                          />
                        </td>
                        {(['height', 'bust', 'waist', 'hip'] as const).map((field) => (
                          <td key={field} className="py-2 px-1">
                            <input
                              type="text"
                              value={m[field]}
                              onChange={(e) => updateBodyMeasurement(idx, field, e.target.value)}
                              className="w-20 px-2 py-1 border border-zibara-cream/35 text-xs text-center focus:outline-none focus:ring-1 focus:ring-zibara-gold/50 bg-zibara-black/40 text-zibara-cream"
                              placeholder={field === 'height' ? '160-165' : '82-86'}
                            />
                          </td>
                        ))}
                        <td className="py-2 px-1">
                          <button
                            onClick={() => removeBodyMeasurement(idx)}
                            className="p-1 border border-zibara-crimson/40 text-zibara-crimson hover:bg-zibara-crimson hover:text-zibara-cream transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Fit & Stretch */}
            <div className="border border-zibara-cream/10 bg-zibara-deep p-5 md:p-6">
              <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-5">Fit Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55 mb-2">Fit Type</label>
                  <select
                    value={data.fitType}
                    onChange={(e) => setData(prev => ({ ...prev, fitType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-zibara-cream/35 bg-zibara-black/40 text-zibara-cream text-sm focus:outline-none focus:ring-2 focus:ring-zibara-gold/50"
                  >
                    <option value="skinny">Skinny</option>
                    <option value="regular">Regular</option>
                    <option value="oversized">Oversized</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55 mb-2">Stretch</label>
                  <select
                    value={data.stretch}
                    onChange={(e) => setData(prev => ({ ...prev, stretch: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-zibara-cream/35 bg-zibara-black/40 text-zibara-cream text-sm focus:outline-none focus:ring-2 focus:ring-zibara-gold/50"
                  >
                    <option value="none">None</option>
                    <option value="slight">Slight</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Measurement Tips */}
            <div className="border border-zibara-cream/10 bg-zibara-deep p-5 md:p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase">How to Measure Tips</p>
                <button
                  onClick={() => addTip('measurementTips')}
                  className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.3em] text-zibara-cream/60 hover:text-zibara-cream transition-colors"
                >
                  <Plus size={12} /> Add Tip
                </button>
              </div>
              <div className="space-y-2">
                {data.measurementTips.map((tip, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="w-6 h-8 flex items-center justify-center bg-zibara-crimson text-zibara-cream text-[10px] font-mono shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={tip}
                      onChange={(e) => updateTip('measurementTips', idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-zibara-cream/35 text-sm focus:outline-none focus:ring-1 focus:ring-zibara-gold/50 bg-zibara-black/40 text-zibara-cream"
                      placeholder="Enter measurement tip..."
                    />
                    <button
                      onClick={() => removeTip('measurementTips', idx)}
                      className="p-1.5 border border-zibara-crimson/40 text-zibara-crimson hover:bg-zibara-crimson hover:text-zibara-cream transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Size Tips */}
            <div className="border border-zibara-cream/10 bg-zibara-deep p-5 md:p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase">Size Tips</p>
                <button
                  onClick={() => addTip('sizeTips')}
                  className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.3em] text-zibara-cream/60 hover:text-zibara-cream transition-colors"
                >
                  <Plus size={12} /> Add Tip
                </button>
              </div>
              <div className="space-y-2">
                {data.sizeTips.map((tip, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="w-6 h-8 flex items-center justify-center bg-zibara-crimson text-zibara-cream text-[10px] font-mono shrink-0">
                      ·
                    </span>
                    <input
                      type="text"
                      value={tip}
                      onChange={(e) => updateTip('sizeTips', idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-zibara-cream/35 text-sm focus:outline-none focus:ring-1 focus:ring-zibara-gold/50 bg-zibara-black/40 text-zibara-cream"
                      placeholder="Enter size tip..."
                    />
                    <button
                      onClick={() => removeTip('sizeTips', idx)}
                      className="p-1.5 border border-zibara-crimson/40 text-zibara-crimson hover:bg-zibara-crimson hover:text-zibara-cream transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
