'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle, Upload } from 'lucide-react';
import { useData } from '@/context/DataContext';
import ImageUploading from 'react-images-uploading';
import toast from 'react-hot-toast';
import BrandLoader from '@/components/BrandLoader';

const toastStyle = {
  background: '#0a0806',
  color: '#EFEFC9',
  border: '1px solid rgba(239,239,201,0.08)',
  fontFamily: 'var(--font-space-mono), monospace',
  fontSize: '11px',
};

const itemTypes = [
  'Top', 'Dress', 'Skirt', 'Shorts', 'Romper',
  'Set (Top + Bottom)', 'Cardigan', 'Swimwear', 'Accessories', 'Other',
];

const colorOptions = [
  'White', 'Black', 'Cream', 'Beige', 'Brown',
  'Pink', 'Red', 'Orange', 'Yellow', 'Green',
  'Blue', 'Purple', 'Navy', 'Grey', 'Multicolor',
];

const inputClass = 'w-full px-0 py-3 bg-transparent border-b border-zibara-cream/20 text-zibara-cream text-[11px] font-mono placeholder:text-zibara-cream/30 focus:outline-none focus:border-zibara-cream/60 transition-colors';
const labelClass = 'block text-[8px] uppercase tracking-[0.4em] font-mono text-zibara-cream/50 mb-2';
const sectionClass = 'bg-zibara-deep/50 border border-zibara-cream/10 p-5 md:p-7';
const sectionTitle = 'text-[9px] tracking-[0.45em] font-mono text-zibara-cream/45 uppercase mb-5';

export default function CustomOrderPage() {
  const { getContentValue, siteContentLoading } = useData();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    itemType: '',
    description: '',
    colors: [] as string[],
    measurements: { bust: '', waist: '', hip: '', length: '', other: '' },
    budget: '',
    deadline: '',
    additionalNotes: '',
  });

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Failed to upload file');
      const data = await response.json();
      toast.success('Image uploaded successfully!', { style: toastStyle });
      setReferenceImages(prev => [...prev, data.url]);
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown upload error';
      console.error('Error uploading file:', message);
      toast.error('Failed to upload image', { style: toastStyle });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const toggleColor = (color: string) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const measurements = {
        bust: form.measurements.bust ? parseFloat(form.measurements.bust) : undefined,
        waist: form.measurements.waist ? parseFloat(form.measurements.waist) : undefined,
        hip: form.measurements.hip ? parseFloat(form.measurements.hip) : undefined,
        length: form.measurements.length ? parseFloat(form.measurements.length) : undefined,
        other: form.measurements.other || undefined,
      };

      const res = await fetch('/api/custom-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          measurements: Object.values(measurements).some(v => v !== undefined) ? measurements : undefined,
          referenceImages,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to submit. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (siteContentLoading) return <BrandLoader label="Custom Order" sublabel="ZIBARASTUDIO" tone="deep" />;

  if (submitted) {
    return (
      <div className="min-h-screen bg-zibara-black text-zibara-cream flex items-center justify-center px-4">
        <div className="bg-zibara-deep/60 border border-zibara-cream/10 p-8 md:p-12 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 border border-zibara-cream/20 mb-6">
            <CheckCircle className="w-6 h-6 text-zibara-cream/70" />
          </div>
          <h1 className="text-2xl font-light text-zibara-cream uppercase tracking-[0.2em] mb-4"
            style={{ fontFamily: 'var(--font-cormorant), serif' }}>
            {getContentValue('custom_order_success_title', 'Request Submitted')}
          </h1>
          <p className="text-[11px] font-mono text-zibara-cream/60 leading-loose mb-8">
            {getContentValue('custom_order_success_text', "Thank you for your custom order request. We'll review your details and get back to you within 24–48 hours to discuss your vision and provide a quote.")}
          </p>
          <Link
            href="/"
            className="inline-block px-10 py-3 border border-zibara-cream/35 text-[10px] uppercase tracking-[0.4em] font-mono text-zibara-cream/80 hover:bg-zibara-cream hover:text-zibara-black transition-all duration-300"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream pt-24 md:pt-28">
      <div className="max-w-3xl mx-auto px-4 md:px-8 pb-16">

        {/* Header */}
        <div className="flex items-center gap-5 mb-10">
          <Link
            href="/"
            className="flex-shrink-0 w-10 h-10 border border-zibara-cream/15 flex items-center justify-center hover:border-zibara-cream/40 transition-colors"
          >
            <ArrowLeft size={16} className="text-zibara-cream/60" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-light uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-cormorant), serif' }}>
              {getContentValue('custom_order_title', 'Custom Order')}
            </h1>
            <p className="text-[10px] font-mono text-zibara-cream/45 uppercase tracking-widest mt-1">
              {getContentValue('custom_order_subtitle', 'Tell us about your dream piece')}
            </p>
          </div>
        </div>

        {/* Intro */}
        <div className={`${sectionClass} mb-8`}>
          <p className="text-[11px] font-mono text-zibara-cream/65 leading-loose">
            {getContentValue('custom_order_intro_text', 'Ready to create something unique? Fill out the form below with as much detail as possible. Our studio team will review your request and contact you within 24–48 hours to discuss your vision, provide a quote, and timeline. A 50% deposit is required to begin work.')}
          </p>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-500/25 p-4 mb-6">
            <p className="text-[10px] font-mono text-red-400/80">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Contact Information */}
          <div className={sectionClass}>
            <p className={sectionTitle}>Contact Information</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'First Name *', key: 'firstName', type: 'text', required: true },
                { label: 'Last Name *', key: 'lastName', type: 'text', required: true },
                { label: 'Email *', key: 'email', type: 'email', required: true },
                { label: 'Phone *', key: 'phone', type: 'tel', required: true },
              ].map(({ label, key, type, required }) => (
                <div key={key}>
                  <label className={labelClass}>{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form] as string}
                    onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    required={required}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Order Details */}
          <div className={sectionClass}>
            <p className={sectionTitle}>Order Details</p>
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Item Type *</label>
                <select
                  value={form.itemType}
                  onChange={(e) => setForm(prev => ({ ...prev, itemType: e.target.value }))}
                  required
                  className="w-full px-0 py-3 bg-transparent border-b border-zibara-cream/20 text-zibara-cream text-[11px] font-mono focus:outline-none focus:border-zibara-cream/60 transition-colors appearance-none cursor-pointer"
                >
                  <option value="" className="bg-zibara-deep">Select item type</option>
                  {itemTypes.map(type => (
                    <option key={type} value={type} className="bg-zibara-deep">{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Describe Your Vision *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={4}
                  placeholder="Describe the style, design, occasion, or any inspiration you have..."
                  className="w-full px-0 py-3 bg-transparent border-b border-zibara-cream/20 text-zibara-cream text-[11px] font-mono placeholder:text-zibara-cream/30 focus:outline-none focus:border-zibara-cream/60 transition-colors resize-none"
                />
              </div>

              <div>
                <label className={labelClass}>Preferred Colors</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleColor(color)}
                      className={`px-3 py-1.5 text-[9px] uppercase tracking-wider font-mono transition-colors ${
                        form.colors.includes(color)
                          ? 'bg-zibara-cream text-zibara-black'
                          : 'border border-zibara-cream/20 text-zibara-cream/55 hover:border-zibara-cream/45 hover:text-zibara-cream/75'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reference Images */}
          <div className={sectionClass}>
            <p className={sectionTitle}>Reference Images (Optional)</p>
            <p className="text-[10px] font-mono text-zibara-cream/40 mb-5">
              Upload images of styles, designs, or inspiration you&apos;d like us to see
            </p>

            <ImageUploading
              multiple
              value={referenceImages.map(url => ({ data_url: url }))}
              onChange={(imageList, addUpdateIndex) => {
                const index = Array.isArray(addUpdateIndex) ? addUpdateIndex[0] : addUpdateIndex;
                if (index !== undefined && imageList[index]?.file) {
                  uploadFile(imageList[index].file);
                }
              }}
              maxNumber={10}
              dataURLKey="data_url"
            >
              {({ imageList, onImageUpload, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                <div className="space-y-4">
                  {imageList.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {imageList.map((image, index) => {
                        const imageUrl = typeof image.data_url === 'string' ? image.data_url : '';
                        return (
                          <div key={index} className="relative w-24 h-24 border border-zibara-cream/15 overflow-hidden">
                            <img src={imageUrl} alt={`Reference ${index + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-zibara-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button type="button" onClick={() => onImageUpdate(index)}
                                className="px-2 py-1 text-[8px] uppercase tracking-wider font-mono border border-zibara-cream/40 text-zibara-cream/80 hover:bg-zibara-cream hover:text-zibara-black transition-colors">
                                Edit
                              </button>
                              <button type="button" onClick={() => { onImageRemove(index); setReferenceImages(prev => prev.filter((_, i) => i !== index)); }}
                                className="px-2 py-1 text-[8px] uppercase tracking-wider font-mono border border-red-500/40 text-red-400/80 hover:bg-red-500 hover:text-white transition-colors">
                                Remove
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={onImageUpload}
                    {...dragProps}
                    disabled={uploading}
                    className={`flex items-center gap-3 px-5 py-3 text-[9px] uppercase tracking-wider font-mono border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      isDragging
                        ? 'border-zibara-cream/60 bg-zibara-cream/10 text-zibara-cream'
                        : 'border-zibara-cream/20 text-zibara-cream/60 hover:border-zibara-cream/45 hover:text-zibara-cream/80'
                    }`}
                  >
                    <Upload size={14} />
                    {uploading ? 'Uploading...' : 'Upload Reference Images'}
                  </button>
                </div>
              )}
            </ImageUploading>
          </div>

          {/* Measurements */}
          <div className={sectionClass}>
            <div className="flex items-baseline justify-between mb-5">
              <p className={sectionTitle} style={{ marginBottom: 0 }}>Measurements (cm)</p>
              <Link href="/size-guide" className="text-[9px] font-mono text-zibara-cream/40 uppercase tracking-wider hover:text-zibara-cream/65 transition-colors underline">
                Size Guide
              </Link>
            </div>
            <p className="text-[10px] font-mono text-zibara-cream/40 mb-5">
              Optional — you can provide these later or we can guide you through measuring.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {['bust', 'waist', 'hip', 'length'].map((field) => (
                <div key={field}>
                  <label className={labelClass}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input
                    type="number"
                    value={form.measurements[field as keyof typeof form.measurements]}
                    onChange={(e) => setForm(prev => ({ ...prev, measurements: { ...prev.measurements, [field]: e.target.value } }))}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6">
              <label className={labelClass}>Other Measurements</label>
              <input
                type="text"
                value={form.measurements.other}
                onChange={(e) => setForm(prev => ({ ...prev, measurements: { ...prev.measurements, other: e.target.value } }))}
                placeholder="e.g., arm length: 55cm, shoulder width: 40cm"
                className={inputClass}
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className={sectionClass}>
            <p className={sectionTitle}>Additional Information</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Budget Range</label>
                <select
                  value={form.budget}
                  onChange={(e) => setForm(prev => ({ ...prev, budget: e.target.value }))}
                  className="w-full px-0 py-3 bg-transparent border-b border-zibara-cream/20 text-zibara-cream text-[11px] font-mono focus:outline-none focus:border-zibara-cream/60 transition-colors appearance-none cursor-pointer"
                >
                  <option value="" className="bg-zibara-deep">Select budget</option>
                  <option value="Under $50" className="bg-zibara-deep">Under $50</option>
                  <option value="$50 - $100" className="bg-zibara-deep">$50 – $100</option>
                  <option value="$100 - $200" className="bg-zibara-deep">$100 – $200</option>
                  <option value="$200 - $500" className="bg-zibara-deep">$200 – $500</option>
                  <option value="Over $500" className="bg-zibara-deep">Over $500</option>
                  <option value="Flexible" className="bg-zibara-deep">Flexible / Open to Suggestions</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>When do you need it?</label>
                <input
                  type="text"
                  value={form.deadline}
                  onChange={(e) => setForm(prev => ({ ...prev, deadline: e.target.value }))}
                  placeholder="e.g., February wedding, No rush"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mt-6">
              <label className={labelClass}>Anything else we should know?</label>
              <textarea
                value={form.additionalNotes}
                onChange={(e) => setForm(prev => ({ ...prev, additionalNotes: e.target.value }))}
                rows={3}
                placeholder="Any other details, questions, or special requests..."
                className="w-full px-0 py-3 bg-transparent border-b border-zibara-cream/20 text-zibara-cream text-[11px] font-mono placeholder:text-zibara-cream/30 focus:outline-none focus:border-zibara-cream/60 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 border border-zibara-cream/35 text-[10px] uppercase tracking-[0.4em] font-mono text-zibara-cream/80 hover:bg-zibara-cream hover:text-zibara-black hover:border-zibara-cream transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {submitting ? (
              'Submitting...'
            ) : (
              <>
                <Send size={14} />
                Submit Request
              </>
            )}
          </button>

          <p className="text-[9px] text-center font-mono text-zibara-cream/35 uppercase tracking-wider">
            {getContentValue('custom_order_footer_text', 'By submitting, you agree to our terms. A 50% deposit is required before production begins.')}
          </p>
        </form>
      </div>
    </div>
  );
}
