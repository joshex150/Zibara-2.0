'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle, Plus, X, Upload } from 'lucide-react';
import { useData } from '@/context/DataContext';
import ImageUploading from 'react-images-uploading';
import toast from 'react-hot-toast';
import ZibaraPlaceholder from '@/components/ZibaraPlaceholder';

const itemTypes = [
  'Top',
  'Dress',
  'Skirt',
  'Shorts',
  'Romper',
  'Set (Top + Bottom)',
  'Cardigan',
  'Swimwear',
  'Accessories',
  'Other',
];

const colorOptions = [
  'White', 'Black', 'Cream', 'Beige', 'Brown',
  'Pink', 'Red', 'Orange', 'Yellow', 'Green',
  'Blue', 'Purple', 'Navy', 'Grey', 'Multicolor',
];

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
    measurements: {
      bust: '',
      waist: '',
      hip: '',
      length: '',
      other: '',
    },
    budget: '',
    deadline: '',
    additionalNotes: '',
  });

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
      setReferenceImages(prev => [...prev, data.url]);
      return data;
    } catch (error: any) {
      console.error('Error uploading file:', error.message);
      toast.error('Failed to upload image');
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
      // Convert measurement strings to numbers
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
          referenceImages: referenceImages,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to submit. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (siteContentLoading) {
    return (
      <div className="fixed inset-0 bg-zibara-black flex items-center justify-center z-50">
        <div className="w-40 md:w-56 aspect-square animate-pulse">
          <ZibaraPlaceholder label="Loading" sublabel="CUSTOM ORDER" tone="deep" variant="compact" className="w-full h-full" />
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#EBB0C9] flex items-center justify-center px-4 scroll-mt-32">
        <div className="bg-[#f5d5e5] rounded-lg p-8 md:p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[#8b2b4d] mb-4">
            {getContentValue('custom_order_success_title', 'Request Submitted!')}
          </h1>
          <p className="text-sm text-gray-700 mb-6">
            {getContentValue('custom_order_success_text', "Thank you for your custom order request! We'll review your details and get back to you within 24-48 hours to discuss your vision and provide a quote.")}
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-[#8b2b4d] text-white text-sm uppercase tracking-wider font-bold rounded-lg hover:bg-[#6d1f3a] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EBB0C9] text-[#8b2b4d] scroll-mt-32">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/"
            className="p-2 bg-[#f5d5e5] rounded-lg hover:bg-[#d896b5]/30 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-[0.15em] uppercase">
              {getContentValue('custom_order_title', 'Custom Order')}
            </h1>
            <p className="text-xs md:text-sm opacity-70 mt-1">
              {getContentValue('custom_order_subtitle', 'Tell us about your dream piece')}
            </p>
          </div>
        </div>

        {/* Intro */}
        <div className="bg-[#f5d5e5] rounded-lg p-4 md:p-6 mb-8">
          <p className="text-sm leading-relaxed">
            {getContentValue('custom_order_intro_text', 'Ready to create something unique? Fill out the form below with as much detail as possible. Our artisan crocheters will review your request and contact you within 24-48 hours to discuss your vision, provide a quote, and timeline. A 50% deposit is required to begin work.')}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="bg-[#f5d5e5] rounded-lg p-4 md:p-6">
            <h2 className="text-sm md:text-base font-bold uppercase tracking-wider mb-4">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent bg-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-[#f5d5e5] rounded-lg p-4 md:p-6">
            <h2 className="text-sm md:text-base font-bold uppercase tracking-wider mb-4">
              Order Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                  Item Type *
                </label>
                <select
                  value={form.itemType}
                  onChange={(e) => setForm(prev => ({ ...prev, itemType: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-[#8b2b4d]/20 focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent bg-[#f5d5e5] text-[#8b2b4d] text-sm"
                >
                  <option value="">Select item type</option>
                  {itemTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                  Describe Your Vision *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={4}
                  placeholder="Describe the style, design, occasion, or any inspiration you have..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent bg-white text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                  Preferred Colors (select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleColor(color)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        form.colors.includes(color)
                          ? 'bg-[#8b2b4d] text-white'
                          : 'bg-white border border-gray-300 hover:border-[#8b2b4d]'
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
          <div className="bg-[#f5d5e5] rounded-lg p-4 md:p-6">
            <h2 className="text-sm md:text-base font-bold uppercase tracking-wider mb-4">
              Reference Images (Optional)
            </h2>
            <p className="text-xs opacity-70 mb-4">
              Upload images of styles, designs, or inspiration you'd like us to see
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
                        <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-300">
                          <img
                            src={imageUrl}
                            alt={`Reference ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => onImageUpdate(index)}
                              className="px-2 py-1 bg-white text-gray-700 rounded text-xs font-semibold hover:bg-gray-100"
                            >
                              Update
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onImageRemove(index);
                                setReferenceImages(prev => prev.filter((_, i) => i !== index));
                              }}
                              className="px-2 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600"
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                      isDragging
                        ? 'bg-[#8b2b4d] text-white'
                        : 'bg-white text-[#8b2b4d] border-2 border-[#8b2b4d] hover:bg-[#8b2b4d] hover:text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Upload size={16} />
                    {uploading ? 'Uploading...' : 'Upload Reference Images'}
                  </button>
                </div>
              )}
            </ImageUploading>
          </div>

          {/* Measurements (Optional) */}
          <div className="bg-[#f5d5e5] rounded-lg p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm md:text-base font-bold uppercase tracking-wider">
                Measurements (cm)
              </h2>
              <Link href="/size-guide" className="text-xs underline opacity-70 hover:opacity-100">
                Size Guide
              </Link>
            </div>
            <p className="text-xs opacity-70 mb-4">
              Optional - you can provide these later or we can guide you through measuring.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-2">Bust</label>
                <input
                  type="number"
                  value={form.measurements.bust}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    measurements: { ...prev.measurements, bust: e.target.value }
                  }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-2">Waist</label>
                <input
                  type="number"
                  value={form.measurements.waist}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    measurements: { ...prev.measurements, waist: e.target.value }
                  }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-2">Hip</label>
                <input
                  type="number"
                  value={form.measurements.hip}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    measurements: { ...prev.measurements, hip: e.target.value }
                  }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-2">Length</label>
                <input
                  type="number"
                  value={form.measurements.length}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    measurements: { ...prev.measurements, length: e.target.value }
                  }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent bg-white text-sm"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                Other Measurements
              </label>
              <input
                type="text"
                value={form.measurements.other}
                onChange={(e) => setForm(prev => ({
                  ...prev,
                  measurements: { ...prev.measurements, other: e.target.value }
                }))}
                placeholder="e.g., arm length: 55cm, shoulder width: 40cm"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent bg-white text-sm"
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-[#f5d5e5] rounded-lg p-4 md:p-6">
            <h2 className="text-sm md:text-base font-bold uppercase tracking-wider mb-4">
              Additional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-2">Budget Range</label>
                <select
                  value={form.budget}
                  onChange={(e) => setForm(prev => ({ ...prev, budget: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-[#8b2b4d]/20 focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent bg-[#f5d5e5] text-[#8b2b4d] text-sm"
                >
                  <option value="">Select budget</option>
                  <option value="Under $50">Under $50</option>
                  <option value="$50 - $100">$50 - $100</option>
                  <option value="$100 - $200">$100 - $200</option>
                  <option value="$200 - $500">$200 - $500</option>
                  <option value="Over $500">Over $500</option>
                  <option value="Flexible">Flexible / Open to Suggestions</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                  When do you need it?
                </label>
                <input
                  type="text"
                  value={form.deadline}
                  onChange={(e) => setForm(prev => ({ ...prev, deadline: e.target.value }))}
                  placeholder="e.g., February wedding, No rush, etc."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent bg-white text-sm"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                Anything else we should know?
              </label>
              <textarea
                value={form.additionalNotes}
                onChange={(e) => setForm(prev => ({ ...prev, additionalNotes: e.target.value }))}
                rows={3}
                placeholder="Any other details, questions, or special requests..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent bg-white text-sm resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[#8b2b4d] text-white text-sm uppercase tracking-[0.2em] font-bold rounded-lg hover:bg-[#6d1f3a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              'Submitting...'
            ) : (
              <>
                <Send size={18} />
                Submit Request
              </>
            )}
          </button>

          <p className="text-xs text-center opacity-70">
            {getContentValue('custom_order_footer_text', 'By submitting this form, you agree to our terms and understand that a 50% deposit is required before production begins.')}
          </p>
        </form>
      </div>
    </div>
  );
}
