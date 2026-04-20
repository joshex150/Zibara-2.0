'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Ruler, Info } from 'lucide-react';
import { useData } from '@/context/DataContext';
import BrandLoader from '@/components/BrandLoader';

export default function SizeGuidePage() {
  const router = useRouter();
  const { sizeGuide, sizeGuideLoading } = useData();
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const [activeTab, setActiveTab] = useState<'product' | 'body'>('product');

  // Conversion helper for single numbers
  const convert = (cm: number) => {
    if (unit === 'in') {
      return (cm / 2.54).toFixed(1);
    }
    return cm.toFixed(1);
  };

  // Conversion helper for range strings like "160-165"
  const convertRange = (rangeStr: string) => {
    if (unit === 'cm') return rangeStr;
    
    // Parse range like "160-165" or single value like "165"
    const parts = rangeStr.split('-').map(s => s.trim());
    const converted = parts.map(p => {
      const num = parseFloat(p);
      if (isNaN(num)) return p;
      return (num / 2.54).toFixed(1);
    });
    return converted.join('-');
  };

  // Get fit type position for visual indicator
  const getFitPosition = () => {
    switch (sizeGuide?.fitType) {
      case 'skinny': return 'left-[10%]';
      case 'regular': return 'left-1/2';
      case 'oversized': return 'left-[90%]';
      default: return 'left-1/2';
    }
  };

  // Get stretch position for visual indicator
  const getStretchPosition = () => {
    switch (sizeGuide?.stretch) {
      case 'none': return 'left-[10%]';
      case 'slight': return 'left-[35%]';
      case 'medium': return 'left-[65%]';
      case 'high': return 'left-[90%]';
      default: return 'left-[35%]';
    }
  };

  if (sizeGuideLoading) {
    return <BrandLoader label="Size Guide" sublabel="ZIBARASTUDIO" tone="olive" />;
  }

  const productMeasurements = sizeGuide?.productMeasurements || [];
  const bodyMeasurements = sizeGuide?.bodyMeasurements || [];
  const measurementTips = sizeGuide?.measurementTips || [];
  const sizeTips = sizeGuide?.sizeTips || [];

  return (
    <div className="min-h-screen bg-[#EBB0C9] text-[#8b2b4d] scroll-mt-32">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="p-2 bg-[#f5d5e5] rounded-lg hover:bg-[#d896b5]/30 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-[0.15em] uppercase">
              Size Guide
            </h1>
            <p className="text-xs md:text-sm opacity-70 mt-1">
              Find your perfect fit
            </p>
          </div>
        </div>

        {/* Unit Toggle */}
        <div className="flex items-center justify-end gap-2 mb-6">
          <span className="text-xs uppercase tracking-wider font-semibold">Unit:</span>
          <div className="flex bg-[#f5d5e5] rounded-lg overflow-hidden">
            <button
              onClick={() => setUnit('cm')}
              className={`px-4 py-2 text-xs font-semibold transition-colors ${
                unit === 'cm' ? 'bg-[#8b2b4d] text-white' : 'hover:bg-[#d896b5]/30'
              }`}
            >
              CM
            </button>
            <button
              onClick={() => setUnit('in')}
              className={`px-4 py-2 text-xs font-semibold transition-colors ${
                unit === 'in' ? 'bg-[#8b2b4d] text-white' : 'hover:bg-[#d896b5]/30'
              }`}
            >
              INCHES
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('product')}
            className={`flex-1 py-3 px-4 rounded-lg text-xs md:text-sm font-semibold uppercase tracking-wider transition-colors ${
              activeTab === 'product'
                ? 'bg-[#8b2b4d] text-white'
                : 'bg-[#f5d5e5] hover:bg-[#d896b5]/30'
            }`}
          >
            Product Measurements
          </button>
          <button
            onClick={() => setActiveTab('body')}
            className={`flex-1 py-3 px-4 rounded-lg text-xs md:text-sm font-semibold uppercase tracking-wider transition-colors ${
              activeTab === 'body'
                ? 'bg-[#8b2b4d] text-white'
                : 'bg-[#f5d5e5] hover:bg-[#d896b5]/30'
            }`}
          >
            Body Measurements
          </button>
        </div>

        {/* Size Table */}
        <div className="bg-[#f5d5e5] rounded-lg overflow-hidden mb-8">
          <div className="overflow-x-auto">
            {activeTab === 'product' ? (
              productMeasurements.length > 0 ? (
                <table className="w-full text-xs md:text-sm">
                  <thead>
                    <tr className="bg-[#8b2b4d] text-white">
                      <th className="py-3 px-3 md:px-4 text-left font-semibold">Size</th>
                      <th className="py-3 px-3 md:px-4 text-center font-semibold">Bust</th>
                      <th className="py-3 px-3 md:px-4 text-center font-semibold">Waist</th>
                      <th className="py-3 px-3 md:px-4 text-center font-semibold">Hip</th>
                      <th className="py-3 px-3 md:px-4 text-center font-semibold">Length</th>
                      <th className="py-3 px-3 md:px-4 text-center font-semibold hidden md:table-cell">Sleeve</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productMeasurements.map((row, idx) => (
                      <tr 
                        key={row.size}
                        className={idx % 2 === 0 ? 'bg-white/50' : 'bg-white/30'}
                      >
                        <td className="py-3 px-3 md:px-4 font-bold">{row.size}</td>
                        <td className="py-3 px-3 md:px-4 text-center">{convert(row.bust)}</td>
                        <td className="py-3 px-3 md:px-4 text-center">{convert(row.waist)}</td>
                        <td className="py-3 px-3 md:px-4 text-center">{convert(row.hip)}</td>
                        <td className="py-3 px-3 md:px-4 text-center">{convert(row.length)}</td>
                        <td className="py-3 px-3 md:px-4 text-center hidden md:table-cell">{convert(row.sleeve)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Ruler className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No product measurements available yet.</p>
                </div>
              )
            ) : (
              bodyMeasurements.length > 0 ? (
                <table className="w-full text-xs md:text-sm">
                  <thead>
                    <tr className="bg-[#8b2b4d] text-white">
                      <th className="py-3 px-3 md:px-4 text-left font-semibold">Size</th>
                      <th className="py-3 px-3 md:px-4 text-center font-semibold">Height</th>
                      <th className="py-3 px-3 md:px-4 text-center font-semibold">Bust</th>
                      <th className="py-3 px-3 md:px-4 text-center font-semibold">Waist</th>
                      <th className="py-3 px-3 md:px-4 text-center font-semibold">Hip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bodyMeasurements.map((row, idx) => (
                      <tr 
                        key={row.size}
                        className={idx % 2 === 0 ? 'bg-white/50' : 'bg-white/30'}
                      >
                        <td className="py-3 px-3 md:px-4 font-bold">{row.size}</td>
                        <td className="py-3 px-3 md:px-4 text-center">{convertRange(row.height)}</td>
                        <td className="py-3 px-3 md:px-4 text-center">{convertRange(row.bust)}</td>
                        <td className="py-3 px-3 md:px-4 text-center">{convertRange(row.waist)}</td>
                        <td className="py-3 px-3 md:px-4 text-center">{convertRange(row.hip)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Ruler className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No body measurements available yet.</p>
                </div>
              )
            )}
          </div>
          <div className="p-3 md:p-4 border-t border-[#8b2b4d]/10 text-[10px] md:text-xs text-gray-600">
            <Info size={12} className="inline mr-1" />
            {activeTab === 'product' 
              ? 'Measurements are taken from the garment laid flat. Allow 1-2 cm variance due to manual measuring.'
              : 'These are recommended body measurements for each size. For a relaxed fit, size up.'}
          </div>
        </div>

        {/* Fit Type */}
        {sizeGuide && (
          <div className="bg-[#f5d5e5] rounded-lg p-4 md:p-6 mb-6">
            <h2 className="text-sm md:text-base font-bold uppercase tracking-wider mb-4">
              Fit Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold mb-2">Fit Type</p>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] md:text-xs">Skinny</span>
                  <div className="flex-1 h-2 bg-white/50 rounded-full mx-2 relative">
                    <div className={`absolute ${getFitPosition()} top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#8b2b4d] rounded-full`}></div>
                  </div>
                  <span className="text-[10px] md:text-xs">Oversized</span>
                </div>
                <p className="text-xs text-center mt-1 font-semibold capitalize">{sizeGuide.fitType} Fit</p>
              </div>
              
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold mb-2">Stretch</p>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] md:text-xs">None</span>
                  <div className="flex-1 h-2 bg-white/50 rounded-full mx-2 relative">
                    <div className={`absolute ${getStretchPosition()} top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#8b2b4d] rounded-full`}></div>
                  </div>
                  <span className="text-[10px] md:text-xs">High</span>
                </div>
                <p className="text-xs text-center mt-1 font-semibold capitalize">{sizeGuide.stretch} Stretch</p>
              </div>
            </div>
          </div>
        )}

        {/* How to Measure */}
        {measurementTips.length > 0 && (
          <div className="bg-[#f5d5e5] rounded-lg p-4 md:p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Ruler size={20} />
              <h2 className="text-sm md:text-base font-bold uppercase tracking-wider">
                How to Measure
              </h2>
            </div>
            
            <div className="space-y-4">
              {measurementTips.map((tip, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-6 h-6 bg-[#8b2b4d] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-xs md:text-sm text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {sizeTips.length > 0 && (
          <div className="bg-[#8b2b4d] text-white rounded-lg p-4 md:p-6">
            <h2 className="text-sm md:text-base font-bold uppercase tracking-wider mb-3">
              Size Tips
            </h2>
            <ul className="space-y-2 text-xs md:text-sm">
              {sizeTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#d896b5]">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}
