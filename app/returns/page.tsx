import React from 'react';

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-[#EBB0C9] text-[#8b2b4d] scroll-mt-32">
      <div className="max-w-[900px] mx-auto px-4 md:px-8 py-12 md:py-16">
        
        <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-[0.3em] mb-8 text-center">
          RETURN & EXCHANGE POLICY
        </h1>

        <div className="space-y-8 text-sm md:text-base leading-relaxed">
          
          {/* INTRO */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm text-center">
            <p className="text-base md:text-lg">
              We want you to love your ZIBARASTUDIO piece. If for any reason you're not completely satisfied, 
              we're here to help.
            </p>
          </div>

          {/* SECTION 1 */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.25em] mb-4">
              RETURN WINDOW
            </h2>
            <p className="mb-4">
              You have <strong>7 days</strong> from the date of delivery to initiate a return or exchange 
              for ready-to-wear items.
            </p>
            <p className="mb-4">
              To be eligible for a return:
            </p>
            <ul className="space-y-2 pl-5">
              <li>• Items must be unworn, unwashed, and in original condition</li>
              <li>• All original tags must be attached</li>
              <li>• Items must be in original packaging</li>
              <li>• Proof of purchase (order confirmation email) required</li>
            </ul>
          </div>

          {/* SECTION 2 */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.25em] mb-4">
              ITEMS NOT ELIGIBLE FOR RETURN
            </h2>
            <p className="mb-4">
              Due to the handmade nature of our work, the following items cannot be returned:
            </p>
            <ul className="space-y-2 pl-5">
              <li>• <strong>Custom/Made-to-Order Items:</strong> All custom pieces are final sale</li>
              <li>• <strong>Sale Items:</strong> Items purchased during sales are final sale</li>
              <li>• <strong>Worn or Altered Items:</strong> Items that show signs of wear or alteration</li>
              <li>• <strong>Items Without Tags:</strong> Products with removed or damaged tags</li>
            </ul>
          </div>

          {/* SECTION 3 */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.25em] mb-4">
              HOW TO INITIATE A RETURN
            </h2>
            <div className="space-y-4">
              <div>
                <p className="font-bold mb-2">STEP 1: Contact Us</p>
                <p>
                  Email us at <a href="mailto:studio@zibarastudio.com" className="underline hover:opacity-70">studio@zibarastudio.com</a> with:
                </p>
                <ul className="space-y-1 pl-5 mt-2">
                  <li>• Your order number</li>
                  <li>• Item(s) you wish to return</li>
                  <li>• Reason for return</li>
                  <li>• Photos of the item (if applicable)</li>
                </ul>
              </div>

              <div>
                <p className="font-bold mb-2">STEP 2: Get Authorization</p>
                <p>
                  We'll review your request and send you a return authorization number (RMA) and instructions 
                  within 24-48 hours.
                </p>
              </div>

              <div>
                <p className="font-bold mb-2">STEP 3: Ship Your Return</p>
                <p>
                  Package your item securely with the RMA number clearly marked on the package. 
                  Ship to the address provided in your return authorization email.
                </p>
              </div>

              <div>
                <p className="font-bold mb-2">STEP 4: Receive Your Refund</p>
                <p>
                  Once we receive and inspect your return, we'll process your refund within 5-7 business days 
                  to your original payment method.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 4 */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.25em] mb-4">
              EXCHANGES
            </h2>
            <p className="mb-4">
              We're happy to exchange items for a different size or color (subject to availability).
            </p>
            <p className="mb-4">
              To request an exchange, follow the same process as returns and indicate in your email that 
              you'd like an exchange. We'll arrange for your new item to be shipped once we receive 
              your return.
            </p>
            <p className="italic opacity-80">
              If the new item is more expensive, you'll be charged the difference. If it's less expensive, 
              we'll refund the difference.
            </p>
          </div>

          {/* SECTION 5 */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.25em] mb-4">
              RETURN SHIPPING COSTS
            </h2>
            <p className="mb-4">
              <strong>Within Lagos:</strong> Return shipping is free for exchanges. For refunds, customers 
              are responsible for return shipping costs unless the item is defective or we made an error.
            </p>
            <p className="mb-4">
              <strong>Outside Lagos:</strong> Customer is responsible for return shipping costs unless the 
              item is defective or we made an error.
            </p>
            <p>
              <strong>Defective or Incorrect Items:</strong> We'll cover all return shipping costs and send 
              you a replacement immediately.
            </p>
          </div>

          {/* SECTION 6 */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.25em] mb-4">
              DAMAGED OR DEFECTIVE ITEMS
            </h2>
            <p className="mb-4">
              Every item is carefully inspected before shipping. However, if you receive a damaged or 
              defective item, please contact us within 48 hours of delivery with photos.
            </p>
            <p>
              We'll arrange for a replacement or full refund, including return shipping costs, at no charge to you.
            </p>
          </div>

          {/* SECTION 7 */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.25em] mb-4">
              INTERNATIONAL RETURNS
            </h2>
            <p className="mb-4">
              International customers are responsible for all return shipping costs and any customs fees incurred.
            </p>
            <p>
              We recommend using a trackable shipping service, as we cannot guarantee receipt of returned items 
              sent via untracked mail.
            </p>
          </div>

          {/* CONTACT */}
          <div className="text-center pt-8">
            <p className="mb-4">
              Have questions about returns or exchanges?
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
