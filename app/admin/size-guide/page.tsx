'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, Ruler } from 'lucide-react';
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

const defaultProductMeasurement: ProductMeasurement = {
  size: '',
  bust: 0,
  waist: 0,
  hip: 0,
  length: 0,
  sleeve: 0,
  cuff: 0,
};

const defaultBodyMeasurement: BodyMeasurement = {
  size: '',
  height: '',
  bust: '',
  waist: '',
  hip: '',
};

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

  // Product Measurements handlers
  const addProductMeasurement = () => {
    setData(prev => ({
      ...prev,
      productMeasurements: [...prev.productMeasurements, { ...defaultProductMeasurement }],
    }));
  };

  const updateProductMeasurement = (index: number, field: keyof ProductMeasurement, value: string | number) => {
    setData(prev => ({
      ...prev,
      productMeasurements: prev.productMeasurements.map((m, i) => 
        i === index ? { ...m, [field]: value } : m
      ),
    }));
  };

  const removeProductMeasurement = (index: number) => {
    setData(prev => ({
      ...prev,
      productMeasurements: prev.productMeasurements.filter((_, i) => i !== index),
    }));
  };

  // Body Measurements handlers
  const addBodyMeasurement = () => {
    setData(prev => ({
      ...prev,
      bodyMeasurements: [...prev.bodyMeasurements, { ...defaultBodyMeasurement }],
    }));
  };

  const updateBodyMeasurement = (index: number, field: keyof BodyMeasurement, value: string) => {
    setData(prev => ({
      ...prev,
      bodyMeasurements: prev.bodyMeasurements.map((m, i) => 
        i === index ? { ...m, [field]: value } : m
      ),
    }));
  };

  const removeBodyMeasurement = (index: number) => {
    setData(prev => ({
      ...prev,
      bodyMeasurements: prev.bodyMeasurements.filter((_, i) => i !== index),
    }));
  };

  // Tips handlers
  const addTip = (type: 'measurementTips' | 'sizeTips') => {
    setData(prev => ({
      ...prev,
      [type]: [...prev[type], ''],
    }));
  };

  const updateTip = (type: 'measurementTips' | 'sizeTips', index: number, value: string) => {
    setData(prev => ({
      ...prev,
      [type]: prev[type].map((t, i) => i === index ? value : t),
    }));
  };

  const removeTip = (type: 'measurementTips' | 'sizeTips', index: number) => {
    setData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="fixed inset-0 bg-[#EBB0C9] flex items-center justify-center z-50">
        <div className="animate-pulse">
          <img src="/logo.jpeg" alt="Loading" className="w-32 h-32 md:w-48 md:h-48 object-contain" />
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#EBB0C9] scroll-mt-32">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/admin" className="p-2 bg-[#f5d5e5] rounded-lg hover:bg-[#d896b5]/30 transition-colors">
              <ArrowLeft size={18} className="md:w-5 md:h-5 text-[#8b2b4d]" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#8b2b4d] uppercase tracking-wider">
                Size Guide
              </h1>
              <p className="text-gray-700 text-xs md:text-sm mt-1">Manage size chart and measurements</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-[#8b2b4d] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-semibold hover:bg-[#6d1f3a] transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4 md:w-5 md:h-5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['product', 'body', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-[#8b2b4d] text-white'
                  : 'bg-[#f5d5e5] hover:bg-[#d896b5]/30'
              }`}
            >
              {tab === 'product' ? 'Product Measurements' : tab === 'body' ? 'Body Measurements' : 'Settings & Tips'}
            </button>
          ))}
        </div>

        {/* Product Measurements Tab */}
        {activeTab === 'product' && (
          <div className="bg-[#f5d5e5] rounded-lg p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm md:text-base font-bold text-[#8b2b4d]">Product Measurements (cm)</h2>
              <button
                onClick={addProductMeasurement}
                className="flex items-center gap-1 text-xs md:text-sm text-[#8b2b4d] hover:underline"
              >
                <Plus size={16} /> Add Size
              </button>
            </div>

            {data.productMeasurements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Ruler className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No product measurements yet. Click "Add Size" to start.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-[#8b2b4d]/20">
                      <th className="py-2 px-2 text-left">Size</th>
                      <th className="py-2 px-2 text-center">Bust</th>
                      <th className="py-2 px-2 text-center">Waist</th>
                      <th className="py-2 px-2 text-center">Hip</th>
                      <th className="py-2 px-2 text-center">Length</th>
                      <th className="py-2 px-2 text-center">Sleeve</th>
                      <th className="py-2 px-2 text-center">Cuff</th>
                      <th className="py-2 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.productMeasurements.map((m, idx) => (
                      <tr key={idx} className="border-b border-[#8b2b4d]/10">
                        <td className="py-2 px-1">
                          <input
                            type="text"
                            value={m.size}
                            onChange={(e) => updateProductMeasurement(idx, 'size', e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#8b2b4d]"
                            placeholder="XS"
                          />
                        </td>
                        {(['bust', 'waist', 'hip', 'length', 'sleeve', 'cuff'] as const).map((field) => (
                          <td key={field} className="py-2 px-1">
                            <input
                              type="number"
                              value={m[field] || ''}
                              onChange={(e) => updateProductMeasurement(idx, field, parseFloat(e.target.value) || 0)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#8b2b4d]"
                            />
                          </td>
                        ))}
                        <td className="py-2 px-1">
                          <button
                            onClick={() => removeProductMeasurement(idx)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={14} />
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
          <div className="bg-[#f5d5e5] rounded-lg p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm md:text-base font-bold text-[#8b2b4d]">Body Measurements (cm)</h2>
              <button
                onClick={addBodyMeasurement}
                className="flex items-center gap-1 text-xs md:text-sm text-[#8b2b4d] hover:underline"
              >
                <Plus size={16} /> Add Size
              </button>
            </div>

            {data.bodyMeasurements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Ruler className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No body measurements yet. Click "Add Size" to start.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-[#8b2b4d]/20">
                      <th className="py-2 px-2 text-left">Size</th>
                      <th className="py-2 px-2 text-center">Height</th>
                      <th className="py-2 px-2 text-center">Bust</th>
                      <th className="py-2 px-2 text-center">Waist</th>
                      <th className="py-2 px-2 text-center">Hip</th>
                      <th className="py-2 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bodyMeasurements.map((m, idx) => (
                      <tr key={idx} className="border-b border-[#8b2b4d]/10">
                        <td className="py-2 px-1">
                          <input
                            type="text"
                            value={m.size}
                            onChange={(e) => updateBodyMeasurement(idx, 'size', e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#8b2b4d]"
                            placeholder="XS"
                          />
                        </td>
                        {(['height', 'bust', 'waist', 'hip'] as const).map((field) => (
                          <td key={field} className="py-2 px-1">
                            <input
                              type="text"
                              value={m[field]}
                              onChange={(e) => updateBodyMeasurement(idx, field, e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#8b2b4d]"
                              placeholder={field === 'height' ? '160-165' : '82-86'}
                            />
                          </td>
                        ))}
                        <td className="py-2 px-1">
                          <button
                            onClick={() => removeBodyMeasurement(idx)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={14} />
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
            <div className="bg-[#f5d5e5] rounded-lg p-4 md:p-6">
              <h2 className="text-sm md:text-base font-bold text-[#8b2b4d] mb-4">Fit Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold mb-2">Fit Type</label>
                  <select
                    value={data.fitType}
                    onChange={(e) => setData(prev => ({ ...prev, fitType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-[#8b2b4d]/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent bg-[#f5d5e5] text-[#8b2b4d]"
                  >
                    <option value="skinny">Skinny</option>
                    <option value="regular">Regular</option>
                    <option value="oversized">Oversized</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold mb-2">Stretch</label>
                  <select
                    value={data.stretch}
                    onChange={(e) => setData(prev => ({ ...prev, stretch: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-[#8b2b4d]/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent bg-[#f5d5e5] text-[#8b2b4d]"
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
            <div className="bg-[#f5d5e5] rounded-lg p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm md:text-base font-bold text-[#8b2b4d]">How to Measure Tips</h2>
                <button
                  onClick={() => addTip('measurementTips')}
                  className="flex items-center gap-1 text-xs md:text-sm text-[#8b2b4d] hover:underline"
                >
                  <Plus size={16} /> Add Tip
                </button>
              </div>
              <div className="space-y-2">
                {data.measurementTips.map((tip, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="w-6 h-8 flex items-center justify-center bg-[#8b2b4d] text-white text-xs rounded shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={tip}
                      onChange={(e) => updateTip('measurementTips', idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#8b2b4d]"
                      placeholder="Enter measurement tip..."
                    />
                    <button
                      onClick={() => removeTip('measurementTips', idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Size Tips */}
            <div className="bg-[#f5d5e5] rounded-lg p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm md:text-base font-bold text-[#8b2b4d]">Size Tips</h2>
                <button
                  onClick={() => addTip('sizeTips')}
                  className="flex items-center gap-1 text-xs md:text-sm text-[#8b2b4d] hover:underline"
                >
                  <Plus size={16} /> Add Tip
                </button>
              </div>
              <div className="space-y-2">
                {data.sizeTips.map((tip, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="w-6 h-8 flex items-center justify-center bg-[#8b2b4d] text-white text-xs rounded shrink-0">
                      •
                    </span>
                    <input
                      type="text"
                      value={tip}
                      onChange={(e) => updateTip('sizeTips', idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#8b2b4d]"
                      placeholder="Enter size tip..."
                    />
                    <button
                      onClick={() => removeTip('sizeTips', idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
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
