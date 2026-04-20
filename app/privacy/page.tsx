export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream pt-24 md:pt-28">
      <div className="max-w-[900px] mx-auto px-4 md:px-8 pb-16">

        <div className="mb-12 border-b border-zibara-cream/5 pb-8">
          <h1 className="text-3xl md:text-4xl font-light uppercase tracking-[0.3em] text-center"
            style={{ fontFamily: 'var(--font-cormorant), serif' }}>
            Privacy Policy
          </h1>
          <p className="text-center text-[10px] font-mono text-zibara-cream/45 uppercase tracking-widest mt-3">
            Last Updated: January 15, 2026
          </p>
        </div>

        <div className="space-y-0 text-[11px] md:text-xs font-mono leading-loose text-zibara-cream/75">

          <div className="border-t border-zibara-cream/10 pt-8 pb-10">
            <p>
              At ZIBARASTUDIO, we respect your privacy and are committed to protecting your personal information.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
              visit our website or make a purchase from us.
            </p>
          </div>

          <div className="border-t border-zibara-cream/10 pt-8 pb-10">
            <h2 className="text-[9px] tracking-[0.45em] font-mono uppercase text-zibara-cream/55 mb-6">Information We Collect</h2>
            <h3 className="text-zibara-cream/90 mb-2 mt-4">Personal Information</h3>
            <p className="mb-4">When you place an order or create an account, we collect:</p>
            <ul className="space-y-1 pl-4 mb-4">
              <li>· Name and contact information (email, phone number)</li>
              <li>· Billing and shipping addresses</li>
              <li>· Payment information (processed securely by our payment processors)</li>
              <li>· Order history and preferences</li>
            </ul>
            <h3 className="text-zibara-cream/90 mb-2">Browsing Information</h3>
            <p className="mb-4">We automatically collect certain information when you visit our site:</p>
            <ul className="space-y-1 pl-4">
              <li>· IP address and browser type</li>
              <li>· Device information</li>
              <li>· Pages visited and time spent on site</li>
              <li>· Referring website</li>
            </ul>
          </div>

          <div className="border-t border-zibara-cream/10 pt-8 pb-10">
            <h2 className="text-[9px] tracking-[0.45em] font-mono uppercase text-zibara-cream/55 mb-6">How We Use Your Information</h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="space-y-2 pl-4">
              <li>· Process and fulfill your orders</li>
              <li>· Communicate with you about your orders and inquiries</li>
              <li>· Send you marketing communications (if you&apos;ve opted in)</li>
              <li>· Improve our website and customer experience</li>
              <li>· Prevent fraud and enhance security</li>
              <li>· Comply with legal obligations</li>
            </ul>
          </div>

          <div className="border-t border-zibara-cream/10 pt-8 pb-10">
            <h2 className="text-[9px] tracking-[0.45em] font-mono uppercase text-zibara-cream/55 mb-6">Sharing Your Information</h2>
            <p className="mb-4">We do not sell, rent, or trade your personal information. We may share your information with:</p>
            <ul className="space-y-2 pl-4">
              <li>· <span className="text-zibara-cream/90">Service Providers:</span> Companies that help us operate our business (payment processors, shipping companies, email service providers)</li>
              <li>· <span className="text-zibara-cream/90">Legal Requirements:</span> When required by law or to protect our rights</li>
              <li>· <span className="text-zibara-cream/90">Business Transfers:</span> In the event of a merger, sale, or transfer of our business</li>
            </ul>
          </div>

          <div className="border-t border-zibara-cream/10 pt-8 pb-10">
            <h2 className="text-[9px] tracking-[0.45em] font-mono uppercase text-zibara-cream/55 mb-6">Cookies and Tracking</h2>
            <p className="mb-4">We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and personalize content.</p>
            <p>You can control cookies through your browser settings. However, disabling cookies may affect your ability to use certain features of our website.</p>
          </div>

          <div className="border-t border-zibara-cream/10 pt-8 pb-10">
            <h2 className="text-[9px] tracking-[0.45em] font-mono uppercase text-zibara-cream/55 mb-6">Data Security</h2>
            <p className="mb-4">We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
            <p>However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.</p>
          </div>

          <div className="border-t border-zibara-cream/10 pt-8 pb-10">
            <h2 className="text-[9px] tracking-[0.45em] font-mono uppercase text-zibara-cream/55 mb-6">Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="space-y-2 pl-4">
              <li>· Access the personal information we hold about you</li>
              <li>· Request correction of inaccurate information</li>
              <li>· Request deletion of your information (subject to legal requirements)</li>
              <li>· Object to processing of your information</li>
              <li>· Opt-out of marketing communications at any time</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us at{' '}
              <a href="mailto:studio@zibarastudio.com" className="text-zibara-cream underline hover:text-zibara-gold transition-colors">studio@zibarastudio.com</a>
            </p>
          </div>

          <div className="border-t border-zibara-cream/10 pt-8 pb-10">
            <h2 className="text-[9px] tracking-[0.45em] font-mono uppercase text-zibara-cream/55 mb-6">Children&apos;s Privacy</h2>
            <p>Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.</p>
          </div>

          <div className="border-t border-zibara-cream/10 pt-8 pb-10">
            <h2 className="text-[9px] tracking-[0.45em] font-mono uppercase text-zibara-cream/55 mb-6">International Transfers</h2>
            <p>Your information may be transferred to and processed in various countries. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.</p>
          </div>

          <div className="border-t border-zibara-cream/10 pt-8 pb-10">
            <h2 className="text-[9px] tracking-[0.45em] font-mono uppercase text-zibara-cream/55 mb-6">Changes to This Policy</h2>
            <p className="mb-4">We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &ldquo;Last Updated&rdquo; date.</p>
            <p>We encourage you to review this Privacy Policy periodically. Your continued use of our website after changes are posted constitutes your acceptance of the updated policy.</p>
          </div>

          <div className="border-t border-zibara-cream/10 pt-8 pb-10">
            <h2 className="text-[9px] tracking-[0.45em] font-mono uppercase text-zibara-cream/55 mb-6">Contact Us</h2>
            <p className="mb-4">If you have questions or concerns about this Privacy Policy or our data practices, please contact us:</p>
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
