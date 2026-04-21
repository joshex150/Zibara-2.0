export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream pt-24 md:pt-28">
      <div className="max-w-[900px] mx-auto px-4 md:px-8 pb-16">

        <div className="mb-12 border-b border-zibara-cream/5 pb-8">
          <h1 className="text-3xl md:text-4xl font-light uppercase tracking-[0.3em] text-center"
            style={{ fontFamily: 'var(--font-cormorant), serif' }}>
            Shipping Policy
          </h1>
        </div>

        <div className="space-y-6 text-[11px] md:text-xs font-mono leading-loose text-zibara-cream/75">

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">Domestic Shipping</h2>
            <p className="mb-4">We offer reliable shipping through our trusted courier partners.</p>
            <ul className="space-y-2 pl-4">
              <li>· <span className="text-zibara-cream/90">Standard Shipping:</span> 3–5 business days — $10</li>
              <li>· <span className="text-zibara-cream/90">Free Shipping:</span> On orders over $500</li>
            </ul>
          </div>

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">International Shipping</h2>
            <p className="mb-4">We ship internationally. Standard international shipping rate is <span className="text-zibara-cream">$60</span> with delivery in <span className="text-zibara-cream">3–5 business days</span>.</p>
            <p className="text-zibara-cream/70 italic">International orders (particularly to the US) may incur customs fees and import duties. ZIBARASTUDIO is not responsible for collecting, processing, or paying these fees — responsibility lies solely with the customer.</p>
          </div>

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">Processing Time</h2>
            <p className="mb-4">All orders are processed within 1–3 business days. Orders placed on weekends or public holidays will be processed the next business day.</p>
            <p className="mb-4"><span className="text-zibara-cream/90">Made-to-Order Items:</span> Please allow 7–21 business days for production before shipping. We&apos;ll send you updates throughout the crafting process.</p>
            <p className="mb-4"><span className="text-zibara-cream/90">Custom Orders:</span> Production time varies based on complexity. Timeline will be communicated when you place your order.</p>
            <div className="p-4 bg-zibara-crimson/10 border border-zibara-cream/10">
              <p><span className="text-zibara-cream/90">Express Orders:</span> Need it faster? Express orders are available and attract an additional fee calculated at checkout.</p>
            </div>
          </div>

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">Tracking Your Order</h2>
            <p className="mb-4">Once your order ships, you&apos;ll receive a confirmation email with tracking information. You can track your package using the provided tracking number on our courier&apos;s website.</p>
            <p>If you don&apos;t receive tracking information within 4 business days of placing your order, please contact us at <a href="mailto:studio@zibarastudio.com" className="text-zibara-cream underline hover:text-zibara-gold transition-colors">studio@zibarastudio.com</a></p>
          </div>

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">Shipping Restrictions</h2>
            <p className="mb-4">We currently do not ship to P.O. boxes for security reasons. Please provide a physical address for delivery.</p>
            <p>Some locations may have restricted access. If your area is restricted, we&apos;ll contact you to arrange alternative delivery options.</p>
          </div>

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">Lost or Damaged Packages</h2>
            <p className="mb-4">If your package is lost or arrives damaged, please contact us immediately at{' '}
              <a href="mailto:studio@zibarastudio.com" className="text-zibara-cream underline hover:text-zibara-gold transition-colors">studio@zibarastudio.com</a>{' '}
              with photos of the damage (if applicable) and your order number.
            </p>
            <p>We&apos;ll work with you and our courier to resolve the issue as quickly as possible, including arranging a replacement or refund where appropriate.</p>
          </div>

          <div className="text-center pt-4">
            <p className="mb-6 text-zibara-cream/70">Have questions about shipping? We&apos;re here to help.</p>
            <a
              href="/contact"
              className="inline-block px-10 py-3 border border-zibara-cream/35 text-[10px] uppercase tracking-[0.4em] font-mono text-zibara-cream/80 hover:bg-zibara-cream hover:text-zibara-black transition-all duration-300"
            >
              Contact Us
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
