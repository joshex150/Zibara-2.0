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
    <div className="min-h-screen bg-zibara-black text-zibara-cream scroll-mt-32 pt-24 md:pt-28">
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-10 md:py-14">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="p-2 border border-zibara-cream/15 bg-zibara-deep rounded-lg hover:border-zibara-cream/35 hover:bg-zibara-espresso transition-colors"
          >
            <ArrowLeft size={20} className="text-zibara-cream/80" />
          </button>
          <div>
            <h1
              className="text-2xl md:text-4xl font-light tracking-[0.2em] uppercase text-zibara-cream"
              style={{ fontFamily: 'var(--font-cormorant), serif' }}
            >
              Size Guide
            </h1>
            <p className="text-[10px] md:text-xs uppercase tracking-[0.35em] font-mono text-zibara-cream/55 mt-2">
              Find your perfect fit
            </p>
          </div>
        </div>

        {/* Unit Toggle */}
        <div className="flex items-center justify-end gap-2 mb-6">
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-zibara-cream/60">Unit</span>
          <div className="flex bg-zibara-deep border border-zibara-cream/10 rounded-lg overflow-hidden">
            <button
              onClick={() => setUnit('cm')}
              className={`px-4 py-2 text-[10px] tracking-[0.25em] uppercase font-mono transition-colors ${
                unit === 'cm' ? 'bg-zibara-crimson text-zibara-cream' : 'text-zibara-cream/60 hover:bg-zibara-espresso hover:text-zibara-cream'
              }`}
            >
              CM
            </button>
            <button
              onClick={() => setUnit('in')}
              className={`px-4 py-2 text-[10px] tracking-[0.25em] uppercase font-mono transition-colors ${
                unit === 'in' ? 'bg-zibara-crimson text-zibara-cream' : 'text-zibara-cream/60 hover:bg-zibara-espresso hover:text-zibara-cream'
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
            className={`flex-1 py-3 px-4 rounded-lg text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] transition-colors border ${
              activeTab === 'product'
                ? 'bg-zibara-crimson border-zibara-crimson text-zibara-cream'
                : 'bg-zibara-deep border-zibara-cream/10 text-zibara-cream/65 hover:bg-zibara-espresso hover:text-zibara-cream'
            }`}
          >
            Product Measurements
          </button>
          <button
            onClick={() => setActiveTab('body')}
            className={`flex-1 py-3 px-4 rounded-lg text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] transition-colors border ${
              activeTab === 'body'
                ? 'bg-zibara-crimson border-zibara-crimson text-zibara-cream'
                : 'bg-zibara-deep border-zibara-cream/10 text-zibara-cream/65 hover:bg-zibara-espresso hover:text-zibara-cream'
            }`}
          >
            Body Measurements
          </button>
        </div>

        {/* Size Table */}
        <div className="bg-zibara-deep border border-zibara-cream/10 rounded-lg overflow-hidden mb-8">
          <div className="overflow-x-auto">
            {activeTab === 'product' ? (
              productMeasurements.length > 0 ? (
                <table className="w-full text-xs md:text-sm">
                  <thead>
                    <tr className="bg-zibara-crimson text-zibara-cream">
                      <th className="py-3 px-3 md:px-4 text-left font-mono text-[10px] uppercase tracking-[0.25em]">Size</th>
                      <th className="py-3 px-3 md:px-4 text-center font-mono text-[10px] uppercase tracking-[0.25em]">Bust</th>
                      <th className="py-3 px-3 md:px-4 text-center font-mono text-[10px] uppercase tracking-[0.25em]">Waist</th>
                      <th className="py-3 px-3 md:px-4 text-center font-mono text-[10px] uppercase tracking-[0.25em]">Hip</th>
                      <th className="py-3 px-3 md:px-4 text-center font-mono text-[10px] uppercase tracking-[0.25em]">Length</th>
                      <th className="py-3 px-3 md:px-4 text-center font-mono text-[10px] uppercase tracking-[0.25em] hidden md:table-cell">Sleeve</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productMeasurements.map((row, idx) => (
                      <tr 
                        key={row.size}
                        className={idx % 2 === 0 ? 'bg-zibara-black/30' : 'bg-zibara-espresso/35'}
                      >
                        <td className="py-3 px-3 md:px-4 font-mono font-bold text-zibara-cream">{row.size}</td>
                        <td className="py-3 px-3 md:px-4 text-center text-zibara-cream/78">{convert(row.bust)}</td>
                        <td className="py-3 px-3 md:px-4 text-center text-zibara-cream/78">{convert(row.waist)}</td>
                        <td className="py-3 px-3 md:px-4 text-center text-zibara-cream/78">{convert(row.hip)}</td>
                        <td className="py-3 px-3 md:px-4 text-center text-zibara-cream/78">{convert(row.length)}</td>
                        <td className="py-3 px-3 md:px-4 text-center text-zibara-cream/78 hidden md:table-cell">{convert(row.sleeve)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-zibara-cream/45">
                  <Ruler className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No product measurements available yet.</p>
                </div>
              )
            ) : (
              bodyMeasurements.length > 0 ? (
                <table className="w-full text-xs md:text-sm">
                  <thead>
                    <tr className="bg-zibara-crimson text-zibara-cream">
                      <th className="py-3 px-3 md:px-4 text-left font-mono text-[10px] uppercase tracking-[0.25em]">Size</th>
                      <th className="py-3 px-3 md:px-4 text-center font-mono text-[10px] uppercase tracking-[0.25em]">Height</th>
                      <th className="py-3 px-3 md:px-4 text-center font-mono text-[10px] uppercase tracking-[0.25em]">Bust</th>
                      <th className="py-3 px-3 md:px-4 text-center font-mono text-[10px] uppercase tracking-[0.25em]">Waist</th>
                      <th className="py-3 px-3 md:px-4 text-center font-mono text-[10px] uppercase tracking-[0.25em]">Hip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bodyMeasurements.map((row, idx) => (
                      <tr 
                        key={row.size}
                        className={idx % 2 === 0 ? 'bg-zibara-black/30' : 'bg-zibara-espresso/35'}
                      >
                        <td className="py-3 px-3 md:px-4 font-mono font-bold text-zibara-cream">{row.size}</td>
                        <td className="py-3 px-3 md:px-4 text-center text-zibara-cream/78">{convertRange(row.height)}</td>
                        <td className="py-3 px-3 md:px-4 text-center text-zibara-cream/78">{convertRange(row.bust)}</td>
                        <td className="py-3 px-3 md:px-4 text-center text-zibara-cream/78">{convertRange(row.waist)}</td>
                        <td className="py-3 px-3 md:px-4 text-center text-zibara-cream/78">{convertRange(row.hip)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-zibara-cream/45">
                  <Ruler className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No body measurements available yet.</p>
                </div>
              )
            )}
          </div>
          <div className="p-3 md:p-4 border-t border-zibara-cream/10 text-[10px] md:text-xs text-zibara-cream/55 font-mono">
            <Info size={12} className="inline mr-1" />
            {activeTab === 'product' 
              ? 'Measurements are taken from the garment laid flat. Allow 1-2 cm variance due to manual measuring.'
              : 'These are recommended body measurements for each size. For a relaxed fit, size up.'}
          </div>
        </div>

        {/* Fit Type */}
        {sizeGuide && (
          <div className="bg-zibara-deep border border-zibara-cream/10 rounded-lg p-4 md:p-6 mb-6">
            <h2 className="text-sm md:text-base font-light uppercase tracking-[0.25em] mb-4 text-zibara-cream" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
              Fit Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-mono text-zibara-cream/60 mb-2">Fit Type</p>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] md:text-xs text-zibara-cream/55">Skinny</span>
                  <div className="flex-1 h-2 bg-zibara-black/45 rounded-full mx-2 relative">
                    <div className={`absolute ${getFitPosition()} top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-zibara-crimson rounded-full`}></div>
                  </div>
                  <span className="text-[10px] md:text-xs text-zibara-cream/55">Oversized</span>
                </div>
                <p className="text-xs text-center mt-1 font-mono text-zibara-cream/72 capitalize">{sizeGuide.fitType} Fit</p>
              </div>
              
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-mono text-zibara-cream/60 mb-2">Stretch</p>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] md:text-xs text-zibara-cream/55">None</span>
                  <div className="flex-1 h-2 bg-zibara-black/45 rounded-full mx-2 relative">
                    <div className={`absolute ${getStretchPosition()} top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-zibara-crimson rounded-full`}></div>
                  </div>
                  <span className="text-[10px] md:text-xs text-zibara-cream/55">High</span>
                </div>
                <p className="text-xs text-center mt-1 font-mono text-zibara-cream/72 capitalize">{sizeGuide.stretch} Stretch</p>
              </div>
            </div>
          </div>
        )}

        {/* How to Measure */}
        {measurementTips.length > 0 && (
          <div className="bg-zibara-deep border border-zibara-cream/10 rounded-lg p-4 md:p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Ruler size={20} className="text-zibara-gold" />
              <h2 className="text-sm md:text-base font-light uppercase tracking-[0.25em] text-zibara-cream" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                How to Measure
              </h2>
            </div>
            
            <div className="space-y-4">
              {measurementTips.map((tip, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-6 h-6 bg-zibara-crimson text-zibara-cream rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-xs md:text-sm text-zibara-cream/72">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {sizeTips.length > 0 && (
          <div className="bg-zibara-crimson text-zibara-cream rounded-lg p-4 md:p-6 border border-zibara-gold/15">
            <h2 className="text-sm md:text-base font-light uppercase tracking-[0.25em] mb-3" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
              Size Tips
            </h2>
            <ul className="space-y-2 text-xs md:text-sm text-zibara-cream/90">
              {sizeTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-zibara-gold">•</span>
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
