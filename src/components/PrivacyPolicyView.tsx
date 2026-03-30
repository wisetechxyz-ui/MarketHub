import { ShieldCheck, Lock, UserCheck, Share2, FileText, Bell, HelpCircle, MapPin } from 'lucide-react';

export default function PrivacyPolicyView() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          Privacy Policy – <span className="text-blue-600">MarketHub</span>
        </h1>
        <div className="flex flex-col items-center gap-2 text-gray-500 font-medium">
          <p>Effective Date: [29/03/2026]</p>
          <p>Platform Name: MarketHub</p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 shadow-sm space-y-12">
        
        {/* Section 1 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <FileText className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">1. Introduction</h2>
          </div>
          <div className="text-gray-600 leading-relaxed space-y-4">
            <p>
              Welcome to MarketHub. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform.
            </p>
            <p className="font-medium text-gray-900">
              By using MarketHub, you agree to the terms of this Privacy Policy.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <UserCheck className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">2. Information We Collect</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-bold text-gray-900">a. Personal Information</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
                <li>Name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Profile details</li>
                <li>Location (city/state)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-gray-900">b. Transaction Information</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
                <li>Product listings</li>
                <li>Buying and selling activity</li>
                <li>Chat and communication between users</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-gray-900">c. Device & Usage Information</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
                <li>IP address</li>
                <li>Device type</li>
                <li>Browser information</li>
                <li>App usage behavior</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-gray-900">d. Cookies & Tracking Technologies</h3>
              <p className="text-gray-600 ml-2">
                We use cookies and similar technologies to enhance user experience and analyze performance.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <Lock className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">3. How We Use Your Information</h2>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
              <span>Create and manage your account</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
              <span>Enable buying and selling activities</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
              <span>Improve platform performance and features</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
              <span>Provide customer support</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
              <span>Send updates, notifications, and offers</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
              <span>Detect and prevent fraud or illegal activities</span>
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <Share2 className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">4. Sharing of Information</h2>
          </div>
          <div className="text-gray-600 leading-relaxed space-y-4">
            <p>We do not sell your personal data. However, we may share information with:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Other users (to complete transactions)</li>
              <li>Service providers (hosting, analytics, payment services)</li>
              <li>Legal authorities if required by law</li>
            </ul>
          </div>
        </section>

        {/* Sections 5-10 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">5. User Content</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Any listings, messages, or content you post on MarketHub may be visible to other users. Please avoid sharing sensitive personal information publicly.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">6. Data Security</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              We take reasonable security measures to protect your data. However, no online platform is completely secure, and we cannot guarantee absolute protection.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">7. Your Rights</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              You have the right to access your personal data, update or correct your information, delete your account, and opt-out of marketing communications.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">8. Third-Party Links</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              MarketHub may contain links to third-party websites. We are not responsible for their privacy practices.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">9. Children’s Privacy</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              MarketHub is not intended for users under 18 years of age. We do not knowingly collect personal data from minors.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">10. Changes to This Policy</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              We may update this Privacy Policy from time to time. Changes will be notified on the platform.
            </p>
          </section>
        </div>

        {/* Section 11 */}
        <section className="pt-12 border-t border-gray-100 space-y-6">
          <div className="flex items-center gap-3 text-blue-600">
            <HelpCircle className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">11. Contact Us</h2>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Address: [India, Maharashtra, Mumbai 400063]</span>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Tagline */}
      <div className="text-center pt-8">
        <div className="h-px bg-gray-200 w-24 mx-auto mb-8"></div>
        <p className="text-2xl font-bold text-gray-900">
          MarketHub – <span className="text-blue-600 text-lg sm:text-2xl block sm:inline mt-2 sm:mt-0">Your Trusted Marketplace for Smart Buying & Easy Selling</span>
        </p>
      </div>
    </div>
  );
}
