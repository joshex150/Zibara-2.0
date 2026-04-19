import React from 'react';

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-[#EBB0C9] text-[#8b2b4d] scroll-mt-32">
      <div className="max-w-[900px] mx-auto px-4 md:px-8 py-12 md:py-16">
        
        <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-[0.3em] mb-8 text-center">
          SHIPPING POLICY
        </h1>

        <div className="space-y-8 text-sm md:text-base leading-relaxed">
          
          {/* SECTION 1 */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.25em] mb-4">
              DOMESTIC SHIPPING
            </h2>
            <p className="mb-4">
              We offer reliable shipping through our trusted courier partners.
            </p>
            <ul className="space-y-2 pl-5">
              <li>• <strong>Standard Shipping:</strong> 3-5 business days - $10</li>
              <li>• <strong>Free Shipping:</strong> On orders over $500</li>
            </ul>
          </div>

          {/* SECTION 2 */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.25em] mb-4">
              INTERNATIONAL SHIPPING
            </h2>
            <p className="mb-4">
              We ship internationally! Standard international shipping rate is <strong>$60</strong> with 
              delivery in <strong>3-5 business days</strong>.
            </p>
            <p className="mt-4 italic opacity-80">
              International orders (particularly to the US) may incur customs fees and import duties. 
              Crochellaa.ng is not responsible for collecting, processing, or paying these fees — 
              responsibility lies solely with the customer.
            </p>
          </div>

          {/* SECTION 3 */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.25em] mb-4">
              PROCESSING TIME
            </h2>
            <p className="mb-4">
              All orders are processed within 1-3 business days. Orders placed on weekends or public 
              holidays will be processed the next business day.
            </p>
            <p className="mb-4">
              <strong>Made-to-Order Items:</strong> Please allow 7-21 business days for production before 
              shipping. We'll send you updates throughout the crafting process.
            </p>
            <p className="mb-4">
              <strong>Custom Orders:</strong> Production time varies based on complexity. Timeline will be 
              communicated when you place your order.
            </p>
            <p className="p-4 bg-[#8b2b4d]/10 rounded-sm">
              <strong>Express Orders:</strong> Need it faster? Express orders are available and attract an 
              additional fee that will be calculated at checkout.
            </p>
          </div>

          {/* SECTION 4 */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.25em] mb-4">
              TRACKING YOUR ORDER
            </h2>
            <p className="mb-4">
              Once your order ships, you'll receive a confirmation email with tracking information. 
              You can track your package using the provided tracking number on our courier's website.
            </p>
            <p>
              If you don't receive tracking information within 4 business days of placing your order, 
              please contact us at <a href="mailto:crochellaang@gmail.com" className="underline hover:opacity-70">crochellaang@gmail.com</a>
            </p>
          </div>

          {/* SECTION 5 */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.25em] mb-4">
              SHIPPING RESTRICTIONS
            </h2>
            <p className="mb-4">
              We currently do not ship to P.O. boxes for security reasons. Please provide a physical 
              address for delivery.
            </p>
            <p>
              Some locations may have restricted access. If your area is restricted, we'll contact you 
              to arrange alternative delivery options.
            </p>
          </div>

          {/* SECTION 6 */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.25em] mb-4">
              LOST OR DAMAGED PACKAGES
            </h2>
            <p className="mb-4">
              If your package is lost or arrives damaged, please contact us immediately at{' '}
              <a href="mailto:crochellaang@gmail.com" className="underline hover:opacity-70">crochellaang@gmail.com</a>{' '}
              with photos of the damage (if applicable) and your order number.
            </p>
            <p>
              We'll work with you and our courier to resolve the issue as quickly as possible, including 
              arranging a replacement or refund where appropriate.
            </p>
          </div>

          {/* CONTACT */}
          <div className="text-center pt-8">
            <p className="mb-4">
              Have questions about shipping? We're here to help!
            </p>
            <a 
              href="/contact" 
              className="inline-block px-10 py-3 bg-[#8b2b4d] text-white text-xs md:text-sm uppercase tracking-[0.3em] font-bold hover:bg-[#6d1f3a] transition-colors rounded-sm"
            >
              CONTACT US
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
