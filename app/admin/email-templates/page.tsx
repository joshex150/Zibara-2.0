'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Send, Eye, EyeOff, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import BrandLoader from '@/components/BrandLoader';

const DEFAULT_TEMPLATE = {
  subject: 'Your ZIBARASTUDIO order — {{orderNumber}}',
  intro:
    'Thank you for your order. We are preparing your pieces with care and will notify you once they ship.',
  footer:
    'Questions? Reply to this email or visit zibara.store/contact — we respond within 24 hours.',
};

const PLACEHOLDERS = {
  subject: ['{{orderNumber}}'],
  intro: ['{{firstName}}', '{{orderNumber}}', '{{total}}'],
  footer: ['{{firstName}}'],
};

const labelClass =
  'block text-[8px] uppercase tracking-[0.45em] font-mono text-zibara-cream/50 mb-3';
const textareaClass =
  'w-full px-0 py-3 bg-transparent border-b border-zibara-cream/25 text-zibara-cream text-[11px] font-mono placeholder:text-zibara-cream/30 focus:outline-none focus:border-zibara-cream/50 transition-colors resize-none leading-relaxed';
const inputClass =
  'w-full px-0 py-3 bg-transparent border-b border-zibara-cream/25 text-zibara-cream text-[11px] font-mono placeholder:text-zibara-cream/30 focus:outline-none focus:border-zibara-cream/50 transition-colors';

export default function AdminEmailTemplatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const [tpl, setTpl] = useState({ ...DEFAULT_TEMPLATE });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') fetchTemplate();
  }, [status]);

  const fetchTemplate = async () => {
    try {
      const res = await fetch('/api/admin/email-templates');
      const result = await res.json();
      if (result.success && result.data) {
        setTpl({ ...DEFAULT_TEMPLATE, ...result.data });
      }
    } catch {
      /* use defaults */
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/email-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tpl),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error ?? 'Save failed');
      toast.success('Template saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    const to = testEmail.trim() || (session?.user?.email as string) || '';
    if (!to) {
      toast.error('Enter a recipient email');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/admin/email-templates/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: to, template: tpl }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error ?? 'Send failed');
      toast.success(`Preview sent to ${to}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Send failed');
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setTpl({ ...DEFAULT_TEMPLATE });
    toast.success('Reset to defaults — click Save to persist');
  };

  if (status === 'loading' || loading)
    return <BrandLoader label="Email Templates" sublabel="ZIBARASTUDIO" tone="deep" />;

  // Preview render (simplified in-page HTML preview)
  const previewHtml = `
    <div style="background:#030303;color:#EFEFC9;font-family:monospace;padding:56px;min-height:100%;box-sizing:border-box;">
      <p style="margin:0 0 40px;font-size:9px;letter-spacing:0.45em;text-transform:uppercase;color:rgba(239,239,201,0.4);border-bottom:1px solid rgba(239,239,201,0.08);padding-bottom:36px;">ZIBARASTUDIO</p>
      <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-weight:300;font-size:38px;letter-spacing:0.28em;text-transform:uppercase;line-height:1.1;">Order<br/>Confirmed</h1>
      <p style="margin:0 0 40px;font-size:10px;letter-spacing:0.35em;text-transform:uppercase;color:rgba(239,239,201,0.5);">Hi Preview — CRL-PREVIEW-0000</p>
      <p style="margin:0 0 48px;font-size:12px;line-height:1.85;color:rgba(239,239,201,0.72);">${tpl.intro.replace(/{{firstName}}/g, 'Preview').replace(/{{orderNumber}}/g, 'CRL-PREVIEW-0000').replace(/{{total}}/g, '$730.00')}</p>
      <div style="border-top:1px solid rgba(239,239,201,0.08);padding-top:32px;">
        <p style="margin:0 0 0;font-size:9px;letter-spacing:0.5em;text-transform:uppercase;color:rgba(239,239,201,0.4);">Order Details</p>
        <div style="padding:20px 0;border-bottom:1px solid rgba(239,239,201,0.08);">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;">LUMA SHEATH DRESS</p>
          <p style="margin:0 0 4px;font-size:10px;color:rgba(239,239,201,0.55);">Size: M &nbsp;·&nbsp; Color: Onyx</p>
          <p style="margin:0;font-size:10px;color:rgba(239,239,201,0.55);">Qty: 1 &nbsp;·&nbsp; $430.00</p>
        </div>
        <div style="padding:20px 0;border-bottom:1px solid rgba(239,239,201,0.08);">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;">ADIRE WRAP COAT</p>
          <p style="margin:0 0 4px;font-size:10px;color:rgba(239,239,201,0.55);">Size: S</p>
          <p style="margin:0;font-size:10px;color:rgba(239,239,201,0.55);">Qty: 1 &nbsp;·&nbsp; $290.00</p>
        </div>
      </div>
      <div style="border-top:1px solid rgba(239,239,201,0.08);padding:24px 0;">
        <div style="display:flex;justify-content:space-between;">
          <span style="font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(239,239,201,0.55);">Total Paid</span>
          <span style="font-size:15px;">$730.00</span>
        </div>
        <p style="font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(239,239,201,0.35);margin:6px 0 0;">Via Test Preview</p>
      </div>
      <div style="border-top:1px solid rgba(239,239,201,0.08);padding:40px 0 56px;">
        <p style="margin:0 0 32px;font-size:11px;line-height:1.8;color:rgba(239,239,201,0.55);">${tpl.footer.replace(/{{firstName}}/g, 'Preview')}</p>
        <p style="margin:0;font-size:9px;letter-spacing:0.45em;text-transform:uppercase;color:rgba(239,239,201,0.3);">ZIBARASTUDIO &nbsp;·&nbsp; AFRO-FUTURIST LUXURY</p>
      </div>
    </div>
  `;

  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-10 md:py-14">

        {/* Header */}
        <div className="flex items-center justify-between mb-12 pb-6 border-b border-zibara-cream/8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-zibara-cream/50 hover:text-zibara-cream transition-colors">
              <ArrowLeft size={16} strokeWidth={1.2} />
            </Link>
            <div>
              <h1 className="text-xl font-light uppercase tracking-[0.3em]" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                Email Templates
              </h1>
              <p className="text-[9px] font-mono tracking-[0.4em] uppercase text-zibara-cream/45 mt-1">
                Order receipt · customer-facing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-[9px] tracking-[0.35em] uppercase font-mono text-zibara-cream/50 hover:text-zibara-cream transition-colors border border-zibara-cream/15 hover:border-zibara-cream/30"
            >
              <RotateCcw size={11} strokeWidth={1.4} />
              Reset
            </button>
            <button
              onClick={() => setShowPreview((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 text-[9px] tracking-[0.35em] uppercase font-mono text-zibara-cream/65 hover:text-zibara-cream transition-colors border border-zibara-cream/20 hover:border-zibara-cream/40"
            >
              {showPreview ? <EyeOff size={11} strokeWidth={1.4} /> : <Eye size={11} strokeWidth={1.4} />}
              {showPreview ? 'Hide Preview' : 'Preview'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 text-[9px] tracking-[0.35em] uppercase font-mono bg-zibara-cream text-zibara-black hover:bg-zibara-cream/85 transition-colors disabled:opacity-40"
            >
              <Save size={11} strokeWidth={1.8} />
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        <div className={`grid gap-12 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-2xl'}`}>

          {/* EDITOR */}
          <div className="space-y-10">

            {/* Subject */}
            <div>
              <label className={labelClass}>
                Subject Line
                <span className="ml-3 text-zibara-cream/30 normal-case tracking-normal">
                  — use <code className="text-zibara-cream/55">{'{{orderNumber}}'}</code>
                </span>
              </label>
              <input
                type="text"
                className={inputClass}
                value={tpl.subject}
                onChange={(e) => setTpl((t) => ({ ...t, subject: e.target.value }))}
                placeholder={DEFAULT_TEMPLATE.subject}
              />
              <div className="mt-2 flex gap-2 flex-wrap">
                {PLACEHOLDERS.subject.map((p) => (
                  <button
                    key={p}
                    onClick={() => setTpl((t) => ({ ...t, subject: t.subject + p }))}
                    className="text-[8px] font-mono px-2 py-0.5 border border-zibara-cream/15 text-zibara-cream/45 hover:text-zibara-cream/70 hover:border-zibara-cream/30 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Intro */}
            <div>
              <label className={labelClass}>
                Intro Paragraph
                <span className="ml-3 text-zibara-cream/30 normal-case tracking-normal">
                  — shown after the order heading
                </span>
              </label>
              <textarea
                rows={4}
                className={textareaClass}
                value={tpl.intro}
                onChange={(e) => setTpl((t) => ({ ...t, intro: e.target.value }))}
                placeholder={DEFAULT_TEMPLATE.intro}
              />
              <div className="mt-2 flex gap-2 flex-wrap">
                {PLACEHOLDERS.intro.map((p) => (
                  <button
                    key={p}
                    onClick={() => setTpl((t) => ({ ...t, intro: t.intro + p }))}
                    className="text-[8px] font-mono px-2 py-0.5 border border-zibara-cream/15 text-zibara-cream/45 hover:text-zibara-cream/70 hover:border-zibara-cream/30 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div>
              <label className={labelClass}>
                Footer Message
                <span className="ml-3 text-zibara-cream/30 normal-case tracking-normal">
                  — shown before the signature
                </span>
              </label>
              <textarea
                rows={3}
                className={textareaClass}
                value={tpl.footer}
                onChange={(e) => setTpl((t) => ({ ...t, footer: e.target.value }))}
                placeholder={DEFAULT_TEMPLATE.footer}
              />
              <div className="mt-2 flex gap-2 flex-wrap">
                {PLACEHOLDERS.footer.map((p) => (
                  <button
                    key={p}
                    onClick={() => setTpl((t) => ({ ...t, footer: t.footer + p }))}
                    className="text-[8px] font-mono px-2 py-0.5 border border-zibara-cream/15 text-zibara-cream/45 hover:text-zibara-cream/70 hover:border-zibara-cream/30 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Send test */}
            <div className="pt-6 border-t border-zibara-cream/8">
              <label className={labelClass}>Send Preview Email</label>
              <div className="flex gap-0">
                <input
                  type="email"
                  className="flex-1 px-0 py-3 bg-transparent border-b border-zibara-cream/25 text-zibara-cream text-[11px] font-mono placeholder:text-zibara-cream/30 focus:outline-none focus:border-zibara-cream/50 transition-colors"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder={`${session?.user?.email ?? 'recipient@email.com'}`}
                />
                <button
                  onClick={handleSendTest}
                  disabled={sending}
                  className="flex items-center gap-2 ml-4 px-5 py-2 text-[9px] tracking-[0.35em] uppercase font-mono border border-zibara-cream/25 text-zibara-cream/70 hover:bg-zibara-cream hover:text-zibara-black hover:border-zibara-cream transition-all disabled:opacity-40 whitespace-nowrap"
                >
                  <Send size={11} strokeWidth={1.4} />
                  {sending ? 'Sending…' : 'Send Test'}
                </button>
              </div>
              <p className="mt-2 text-[9px] font-mono text-zibara-cream/35">
                Sends a preview with sample order data using the current (unsaved) template.
              </p>
            </div>
          </div>

          {/* PREVIEW */}
          {showPreview && (
            <div className="border border-zibara-cream/10">
              <div className="px-4 py-3 border-b border-zibara-cream/8 flex items-center justify-between">
                <p className="text-[9px] font-mono tracking-[0.4em] uppercase text-zibara-cream/40">
                  Email Preview
                </p>
                <p className="text-[8px] font-mono text-zibara-cream/25">sample data</p>
              </div>
              <div
                className="overflow-auto max-h-[700px]"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
