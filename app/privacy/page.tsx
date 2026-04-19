import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#EBB0C9] text-[#8b2b4d] scroll-mt-32">
      <div className="max-w-[900px] mx-auto px-4 md:px-8 py-12 md:py-16">
        
        <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-[0.3em] mb-4 text-center">
          PRIVACY POLICY
        </h1>
        
        <p className="text-center text-sm mb-8 opacity-70">
          Last Updated: January 15, 2026
        </p>

        <div className="space-y-8 text-sm md:text-base leading-relaxed">
          
          {/* INTRO */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm">
            <p>
              At Crochellaa.ng, we respect your privacy and are committed to protecting your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
              visit our website or make a purchase from us.
            </p>
          </div>

          {/* SECTION 1 */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.25em] mb-4">
              INFORMATION WE COLLECT
            </h2>
            
            <h3 className="font-bold mb-2 mt-4">Personal Information</h3>
            <p className="mb-4">When you place an order or create an account, we collect:</p>
            <ul className="space-y-1 pl-5 mb-4">
              <li>• Name and contact information (email, phone number)</li>
              <li>• Billing and shipping addresses</li>
              <li>• Payment information (processed securely by our payment processors)</li>
              <li>• Order history and preferences</li>
            </ul>

            <h3 className="font-bold mb-2">Browsing Information</h3>
            <p className="mb-4">We automatically collect certain information when you visit our site:</p>
            <ul className="space-y-1 pl-5">
              <li>• IP address and browser type</li>
              <li>• Device information</li>
              <li>• Pages visited and time spent on site</li>
              <li>• Referring website</li>
            </ul>
          </div>

          {/* SECTION 2 */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.25em] mb-4">
              HOW WE USE YOUR INFORMATION
            </h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="space-y-2 pl-5">
              <li>• Process and fulfill your orders</li>
              <li>• Communicate with you about your orders and inquiries</li>
              <li>• Send you marketing communications (if you've opted in)</li>
              <li>• Improve our website and customer experience</li>
              <li>• Prevent fraud and enhance security</li>
              <li>• Comply with legal obligations</li>
            </ul>
          </div>

          {/* SECTION 3 */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.25em] mb-4">
              SHARING YOUR INFORMATION
            </h2>
            <p className="mb-4">
              We do not sell, rent, or trade your personal information. We may share your information with:
            </p>
            <ul className="space-y-2 pl-5">
              <li>
                • <strong>Service Providers:</strong> Companies that help us operate our business 
                (payment processors, shipping companies, email service providers)
              </li>
              <li>
                • <strong>Legal Requirements:</strong> When required by law or to protect our rights
              </li>
              <li>
                • <strong>Business Transfers:</strong> In the event of a merger, sale, or transfer of our business
              </li>
            </ul>
          </div>

          {/* SECTION 4 */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.25em] mb-4">
              COOKIES AND TRACKING
            </h2>
            <p className="mb-4">
              We use cookies and similar tracking technologies to enhance your browsing experience, 
              analyze site traffic, and personalize content.
            </p>
            <p className="mb-4">
              You can control cookies through your browser settings. However, disabling cookies may 
              affect your ability to use certain features of our website.
            </p>
          </div>

          {/* SECTION 5 */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.25em] mb-4">
              DATA SECURITY
            </h2>
            <p className="mb-4">
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <p>
              However, no method of transmission over the internet or electronic storage is 100% secure. 
              While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </div>

          {/* SECTION 6 */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.25em] mb-4">
              YOUR RIGHTS
            </h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="space-y-2 pl-5">
              <li>• Access the personal information we hold about you</li>
              <li>• Request correction of inaccurate information</li>
              <li>• Request deletion of your information (subject to legal requirements)</li>
              <li>• Object to processing of your information</li>
              <li>• Opt-out of marketing communications at any time</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us at{' '}
              <a href="mailto:hello@crochellaa.ng" className="underline hover:opacity-70">hello@crochellaa.ng</a>
            </p>
          </div>

          {/* SECTION 7 */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.25em] mb-4">
              CHILDREN'S PRIVACY
            </h2>
            <p>
              Our website is not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If you believe we have collected information from 
              a child under 13, please contact us immediately.
            </p>
          </div>

          {/* SECTION 8 */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.25em] mb-4">
              INTERNATIONAL TRANSFERS
            </h2>
            <p>
              Your information may be transferred to and processed in various countries. 
              We ensure appropriate safeguards are in place to protect your information in accordance 
              with this Privacy Policy.
            </p>
          </div>

          {/* SECTION 9 */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.25em] mb-4">
              CHANGES TO THIS POLICY
            </h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by 
              posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
            <p>
              We encourage you to review this Privacy Policy periodically for any changes. Your continued 
              use of our website after changes are posted constitutes your acceptance of the updated policy.
            </p>
          </div>

          {/* CONTACT */}
          <div className="bg-white/30 p-6 md:p-8 rounded-sm">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.25em] mb-4">
              CONTACT US
            </h2>
            <p className="mb-4">
              If you have questions or concerns about this Privacy Policy or our data practices, 
              please contact us:
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> <a href="mailto:hello@crochellaa.ng" className="underline hover:opacity-70">hello@crochellaa.ng</a></p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              <p><strong>Website:</strong> www.crochellaa.com</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
