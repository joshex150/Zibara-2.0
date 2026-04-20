export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream pt-24 md:pt-28">
      <div className="max-w-[900px] mx-auto px-4 md:px-8 pb-16">

        <div className="mb-12 border-b border-zibara-cream/5 pb-8">
          <h1 className="text-3xl md:text-4xl font-light uppercase tracking-[0.3em] text-center"
            style={{ fontFamily: 'var(--font-cormorant), serif' }}>
            Return &amp; Exchange Policy
          </h1>
        </div>

        <div className="space-y-6 text-[11px] md:text-xs font-mono leading-loose text-zibara-cream/75">

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8 text-center">
            <p className="text-xs md:text-sm text-zibara-cream/85">
              We want you to love your ZIBARASTUDIO piece. If for any reason you&apos;re not completely satisfied, we&apos;re here to help.
            </p>
          </div>

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">Return Window</h2>
            <p className="mb-4">You have <span className="text-zibara-cream">7 days</span> from the date of delivery to initiate a return or exchange for ready-to-wear items.</p>
            <p className="mb-4">To be eligible for a return:</p>
            <ul className="space-y-2 pl-4">
              <li>· Items must be unworn, unwashed, and in original condition</li>
              <li>· All original tags must be attached</li>
              <li>· Items must be in original packaging</li>
              <li>· Proof of purchase (order confirmation email) required</li>
            </ul>
          </div>

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">Items Not Eligible for Return</h2>
            <p className="mb-4">Due to the handmade nature of our work, the following items cannot be returned:</p>
            <ul className="space-y-2 pl-4">
              <li>· <span className="text-zibara-cream/90">Custom/Made-to-Order Items:</span> All custom pieces are final sale</li>
              <li>· <span className="text-zibara-cream/90">Sale Items:</span> Items purchased during sales are final sale</li>
              <li>· <span className="text-zibara-cream/90">Worn or Altered Items:</span> Items that show signs of wear or alteration</li>
              <li>· <span className="text-zibara-cream/90">Items Without Tags:</span> Products with removed or damaged tags</li>
            </ul>
          </div>

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">How to Initiate a Return</h2>
            <div className="space-y-5">
              {[
                { step: '01', title: 'Contact Us', body: <>Email us at <a href="mailto:studio@zibarastudio.com" className="text-zibara-cream underline hover:text-zibara-gold transition-colors">studio@zibarastudio.com</a> with your order number, item(s) to return, reason for return, and photos if applicable.</> },
                { step: '02', title: 'Get Authorization', body: "We'll review your request and send you a return authorization number (RMA) and instructions within 24–48 hours." },
                { step: '03', title: 'Ship Your Return', body: 'Package your item securely with the RMA number clearly marked. Ship to the address provided in your return authorization email.' },
                { step: '04', title: 'Receive Your Refund', body: "Once we receive and inspect your return, we'll process your refund within 5–7 business days to your original payment method." },
              ].map(({ step, title, body }) => (
                <div key={step} className="flex gap-4">
                  <span className="text-[8px] tracking-widest font-mono text-zibara-cream/40 pt-0.5 flex-shrink-0">{step}</span>
                  <div>
                    <p className="text-zibara-cream/90 mb-1">{title}</p>
                    <p>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">Exchanges</h2>
            <p className="mb-4">We&apos;re happy to exchange items for a different size or color (subject to availability).</p>
            <p className="mb-4">To request an exchange, follow the same process as returns and indicate in your email that you&apos;d like an exchange. We&apos;ll arrange for your new item to be shipped once we receive your return.</p>
            <p className="text-zibara-cream/55 italic">If the new item is more expensive, you&apos;ll be charged the difference. If it&apos;s less expensive, we&apos;ll refund the difference.</p>
          </div>

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">Return Shipping Costs</h2>
            <p className="mb-3"><span className="text-zibara-cream/90">Within Lagos:</span> Return shipping is free for exchanges. For refunds, customers are responsible for return shipping costs unless the item is defective or we made an error.</p>
            <p className="mb-3"><span className="text-zibara-cream/90">Outside Lagos:</span> Customer is responsible for return shipping costs unless the item is defective or we made an error.</p>
            <p><span className="text-zibara-cream/90">Defective or Incorrect Items:</span> We&apos;ll cover all return shipping costs and send you a replacement immediately.</p>
          </div>

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">Damaged or Defective Items</h2>
            <p className="mb-4">Every item is carefully inspected before shipping. However, if you receive a damaged or defective item, please contact us within 48 hours of delivery with photos.</p>
            <p>We&apos;ll arrange for a replacement or full refund, including return shipping costs, at no charge to you.</p>
          </div>

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">International Returns</h2>
            <p className="mb-4">International customers are responsible for all return shipping costs and any customs fees incurred.</p>
            <p>We recommend using a trackable shipping service, as we cannot guarantee receipt of returned items sent via untracked mail.</p>
          </div>

          <div className="text-center pt-4">
            <p className="mb-6 text-zibara-cream/60">Have questions about returns or exchanges?</p>
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
