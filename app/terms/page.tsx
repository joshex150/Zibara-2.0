export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream pt-24 md:pt-28">
      <div className="max-w-[900px] mx-auto px-4 md:px-8 pb-16">

        <div className="mb-12 border-b border-zibara-cream/5 pb-8">
          <h1 className="text-3xl md:text-4xl font-light uppercase tracking-[0.3em] text-center"
            style={{ fontFamily: 'var(--font-cormorant), serif' }}>
            Terms of Service
          </h1>
          <p className="text-center text-[10px] font-mono text-zibara-cream/60 uppercase tracking-widest mt-3">
            Last Updated: January 15, 2026
          </p>
        </div>

        <div className="space-y-6 text-[11px] md:text-xs font-mono leading-loose text-zibara-cream/75">

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <p>Welcome to ZIBARASTUDIO. By accessing or using our website and services, you agree to be bound by these Terms of Service. Please read them carefully.</p>
          </div>

          {[
            {
              title: 'Acceptance of Terms',
              body: 'By using this website, you represent that you are at least 18 years of age and have the legal capacity to enter into this agreement. If you do not agree with any part of these terms, you may not use our services.',
            },
          ].map(({ title, body }) => (
            <div key={title} className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
              <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">{title}</h2>
              <p>{body}</p>
            </div>
          ))}

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">Use of Website</h2>
            <p className="mb-4">You agree to use this website only for lawful purposes. You must not:</p>
            <ul className="space-y-2 pl-4">
              <li>· Use the website in any way that violates any applicable law or regulation</li>
              <li>· Attempt to gain unauthorized access to any part of the website</li>
              <li>· Transmit any viruses, malware, or other harmful code</li>
              <li>· Engage in any activity that disrupts or interferes with the website</li>
              <li>· Use automated systems (bots, scrapers) without our written permission</li>
              <li>· Reproduce, duplicate, or copy any part of the website without permission</li>
            </ul>
          </div>

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">Products and Pricing</h2>
            <p className="mb-4">All products are handmade and may vary slightly from the images shown. We strive for accuracy in product descriptions and images, but cannot guarantee exact color matches due to screen variations.</p>
            <p className="mb-4">Prices are listed in USD ($) and are subject to change without notice. We reserve the right to modify or discontinue products at any time.</p>
            <p>In the event of a pricing error, we reserve the right to cancel or refuse orders placed at the incorrect price.</p>
          </div>

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">Orders and Payment</h2>
            <p className="mb-4">By placing an order, you are making an offer to purchase products. We reserve the right to accept or decline your order for any reason, including product availability, errors in pricing or product information, or suspected fraud.</p>
            <p className="mb-4">Payment must be made in full before we begin production or ship your order. We accept the following payment methods: bank transfer, debit/credit cards, and mobile money transfers.</p>
            <p>All transactions are processed securely through our third-party payment processors. We do not store your complete payment card information on our servers.</p>
          </div>

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">Custom Orders</h2>
            <p className="mb-4">Custom and made-to-order items are final sale and cannot be returned or exchanged unless defective. Custom orders require a 50% deposit before production begins, with the balance due before shipping.</p>
            <p>If you cancel a custom order after production has begun, the deposit is non-refundable. We&apos;ll make every effort to accommodate changes to custom orders, but cannot guarantee modifications once production has started.</p>
          </div>

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">Intellectual Property</h2>
            <p className="mb-4">All content on this website, including text, images, logos, designs, and product descriptions, is the property of ZIBARASTUDIO or its content suppliers and is protected by international copyright laws.</p>
            <p>You may not reproduce, distribute, modify, or create derivative works from any content on this website without our express written permission.</p>
          </div>

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">User Accounts</h2>
            <p className="mb-4">If you create an account, you are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
            <p>You must notify us immediately of any unauthorized use of your account. We are not liable for any loss or damage arising from your failure to protect your account information.</p>
          </div>

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">Limitation of Liability</h2>
            <p className="mb-4">To the maximum extent permitted by law, ZIBARASTUDIO shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or other intangible losses.</p>
            <p>Our total liability for any claim arising from your use of our website or products shall not exceed the amount you paid for the specific product giving rise to the claim.</p>
          </div>

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">Indemnification</h2>
            <p>You agree to indemnify and hold harmless ZIBARASTUDIO, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of our website or violation of these Terms of Service.</p>
          </div>

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">Governing Law</h2>
            <p>These Terms of Service shall be governed by and construed in accordance with international commerce laws. Any disputes arising from these terms shall be subject to binding arbitration in accordance with internationally recognized arbitration procedures.</p>
          </div>

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">Changes to Terms</h2>
            <p className="mb-4">We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website after changes are posted constitutes your acceptance of the modified terms.</p>
            <p>We will indicate the date of the most recent update at the top of this page.</p>
          </div>

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">Severability</h2>
            <p>If any provision of these Terms of Service is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the remaining terms remain in full force and effect.</p>
          </div>

          <div className="bg-zibara-deep/50 border border-zibara-cream/10 p-6 md:p-8">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-zibara-cream mb-5">Contact Information</h2>
            <p className="mb-4">If you have questions about these Terms of Service, please contact us:</p>
            <div className="space-y-2">
              <p><span className="text-zibara-cream/90">Email:</span>{' '}<a href="mailto:studio@zibarastudio.com" className="text-zibara-cream underline hover:text-zibara-gold transition-colors">studio@zibarastudio.com</a></p>
              <p><span className="text-zibara-cream/90">Website:</span> www.zibarastudio.com</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
