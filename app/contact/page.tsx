'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import AnimatedHeading from '@/components/AnimatedHeading';
import AnimatedText from '@/components/AnimatedText';
import BrandLoader from '@/components/BrandLoader';
import toast from 'react-hot-toast';

const toastStyle = {
  background: '#0a0806',
  color: '#EFEFC9',
  border: '1px solid rgba(239,239,201,0.08)',
  fontFamily: 'var(--font-space-mono), monospace',
  fontSize: '11px',
};

export default function ContactPage() {
  const { getContentValue, siteContentLoading } = useData();

  const [formData, setFormData] = useState({
    name: '', email: '', subject: '', message: ''
  });
  const [sending, setSending] = useState(false);

  const contactEmail = getContentValue('contact_email', 'studio@zibarastudio.com');
  const instagramUrl = getContentValue('contact_instagram', 'https://instagram.com/zibarastudio');
  const tiktokUrl    = getContentValue('contact_tiktok',    'https://tiktok.com/@zibarastudio');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill all required fields', { style: toastStyle });
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success('Message received. We will be in touch.', { style: toastStyle });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error('Something went wrong.', { style: toastStyle });
      }
    } catch {
      toast.error('Something went wrong.', { style: toastStyle });
    } finally {
      setSending(false);
    }
  };

  if (siteContentLoading) return <BrandLoader label="Reach Out" sublabel="ZIBARASTUDIO" tone="deep" />;

  const faqs = [
    {
      q: getContentValue('contact_faq_1_question', 'How long does a custom piece take?'),
      a: getContentValue('contact_faq_1_answer',   'Custom pieces typically take 10–18 business days. We discuss your exact timeline after the initial consultation.'),
    },
    {
      q: getContentValue('contact_faq_2_question', 'Do you ship internationally?'),
      a: getContentValue('contact_faq_2_answer',   'Yes. We ship to Lagos, Abuja, and internationally including London, Paris, and New York. Shipping costs calculated at checkout.'),
    },
    {
      q: getContentValue('contact_faq_3_question', 'Can I visit the studio?'),
      a: getContentValue('contact_faq_3_answer',   'Studio visits are by appointment. Contact us to schedule.'),
    },
    {
      q: getContentValue('contact_faq_4_question', 'What payment methods do you accept?'),
      a: getContentValue('contact_faq_4_answer',   'We accept card payments, bank transfer, Paystack, and Flutterwave.'),
    },
  ];

  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream pt-24 md:pt-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-8">

        {/* Page header */}
        <div className="mb-16 border-b border-zibara-cream/5 pb-10">
          <AnimatedHeading
            tag="h1"
            className="font-display font-light text-[clamp(3rem,9vw,8rem)] leading-none tracking-tight uppercase text-zibara-cream"
            style={{ fontFamily: 'var(--font-cormorant), serif' } as React.CSSProperties}
          >
            Reach Out
          </AnimatedHeading>
          <AnimatedText
            delay={0.2}
            className="mt-4 text-[10px] tracking-[0.4em] font-mono text-zibara-cream/65 uppercase"
            onScroll={false}
          >
            For the woman who knows what she wants.
          </AnimatedText>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-24">

          {/* Form */}
          <div>
            <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/65 uppercase mb-8">Send a message</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {[
                { name: 'name',    label: 'Name',    type: 'text',  required: true,  placeholder: 'Your name' },
                { name: 'email',   label: 'Email',   type: 'email', required: true,  placeholder: 'your@email.com' },
                { name: 'subject', label: 'Subject', type: 'text',  required: false, placeholder: 'What is this regarding?' },
              ].map((field) => (
                <div key={field.name} className="border-b border-zibara-cream/15 pb-3">
                  <label className="block text-[8px] tracking-[0.4em] font-mono text-zibara-cream/65 uppercase mb-2">
                    {field.label}{field.required && ' *'}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={handleChange}
                    required={field.required}
                    placeholder={field.placeholder}
                    className="w-full text-[11px] font-mono text-zibara-cream placeholder:text-zibara-cream/45 bg-transparent focus:outline-none"
                  />
                </div>
              ))}

              <div className="border-b border-zibara-cream/15 pb-3">
                <label className="block text-[8px] tracking-[0.4em] font-mono text-zibara-cream/65 uppercase mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us about your inquiry, custom order vision, or anything else..."
                  className="w-full text-[11px] font-mono text-zibara-cream placeholder:text-zibara-cream/45 bg-transparent focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full py-4 border border-zibara-cream/35 text-[10px] tracking-[0.4em] uppercase font-mono text-zibara-cream/75 hover:bg-zibara-cream hover:text-zibara-black hover:border-zibara-cream transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-12">
            <div>
              <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/65 uppercase mb-6">Direct contact</p>
              <div className="space-y-4">
                <div>
                  <p className="text-[8px] tracking-widest font-mono text-zibara-cream/65 uppercase mb-1">Email</p>
                  <a href={`mailto:${contactEmail}`} className="text-[11px] font-mono text-zibara-cream/80 hover:text-zibara-cream transition-colors">
                    {contactEmail}
                  </a>
                </div>
                <div>
                  <p className="text-[8px] tracking-widest font-mono text-zibara-cream/65 uppercase mb-1">Social</p>
                  <div className="flex gap-4">
                    <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] tracking-widest font-mono text-zibara-cream/65 hover:text-zibara-cream transition-colors uppercase">
                      Instagram
                    </a>
                    <a href={tiktokUrl} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] tracking-widest font-mono text-zibara-cream/65 hover:text-zibara-cream transition-colors uppercase">
                      TikTok
                    </a>
                  </div>
                </div>
                <div>
                  <p className="text-[8px] tracking-widest font-mono text-zibara-cream/65 uppercase mb-1">Locations</p>
                  <p className="text-[11px] font-mono text-zibara-cream/70">Lagos · Abuja · London</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Full-width FAQ */}
        <div className="border-t border-zibara-cream/5 pt-16 pb-24">
          <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/65 uppercase mb-12">Frequently Asked</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-0">
            {faqs.map((faq, i) => (
              <div key={i} className="border-t border-zibara-cream/10 py-8">
                <p
                  className="font-display font-light italic text-[clamp(0.95rem,1.4vw,1.2rem)] text-zibara-cream/80 mb-3 leading-snug"
                  style={{ fontFamily: 'var(--font-cormorant), serif' }}
                >
                  {faq.q}
                </p>
                <p className="text-[10px] font-mono text-zibara-cream/65 leading-loose">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
