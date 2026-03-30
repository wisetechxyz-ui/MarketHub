import { FileCheck, ShieldAlert, UserPlus, UserCircle, ListChecks, Ban, Handshake, CreditCard, DollarSign, Copyright, AlertTriangle, UserMinus, Lock, RefreshCw, Gavel, HelpCircle, MapPin } from 'lucide-react';

export default function TermsAndConditionsView() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mb-4">
          <FileCheck className="w-8 h-8" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          Terms & Conditions – <span className="text-blue-600">The Market Hub</span>
        </h1>
        <div className="flex flex-col items-center gap-2 text-gray-500 font-medium">
          <p>Effective Date: [29/03/2026]</p>
          <p>Platform Name: The Market Hub</p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 shadow-sm space-y-12">
        
        {/* Section 1 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <ShieldAlert className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">1. Acceptance of Terms</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Welcome to The Market Hub. By accessing or using our platform, you agree to comply with and be bound by these Terms & Conditions. If you do not agree, please do not use our services.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <Handshake className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">2. Platform Overview</h2>
          </div>
          <div className="text-gray-600 leading-relaxed space-y-4">
            <p>The Market Hub is an online marketplace that connects buyers and sellers. We act only as a platform and:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Do not own, sell, or control listed products</li>
              <li>Do not guarantee product quality, safety, or legality</li>
              <li>Are not responsible for transactions between users</li>
            </ul>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <UserPlus className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">3. User Eligibility</h2>
          </div>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
            <li>You must be at least 18 years old to use The Market Hub</li>
            <li>You must provide accurate and complete information during registration</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <UserCircle className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">4. User Accounts</h2>
          </div>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
            <li>Users are responsible for maintaining account confidentiality</li>
            <li>Any activity under your account is your responsibility</li>
            <li>The Market Hub reserves the right to suspend or terminate accounts if any violation is found</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <ListChecks className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">5. Listing Rules</h2>
          </div>
          <div className="text-gray-600 leading-relaxed space-y-4">
            <p>While posting listings, users must ensure:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>No illegal, stolen, or prohibited items are listed</li>
              <li>All information is accurate and not misleading</li>
              <li>No duplicate, spam, or fake listings</li>
              <li>Images are real and relevant</li>
            </ul>
            <p className="font-medium text-gray-900">The Market Hub reserves the right to remove any listing without prior notice.</p>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <Ban className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">6. Prohibited Activities</h2>
          </div>
          <div className="text-gray-600 leading-relaxed space-y-4">
            <p>Users must not:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Engage in fraud, scams, or misleading practices</li>
              <li>Harass, abuse, or threaten other users</li>
              <li>Use fake identities or impersonate others</li>
              <li>Attempt to hack, disrupt, or misuse the platform</li>
              <li>Post harmful, offensive, or illegal content</li>
            </ul>
          </div>
        </section>

        {/* Section 7 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <Handshake className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">7. Transactions</h2>
          </div>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
            <li>All transactions are conducted directly between buyers and sellers</li>
            <li>The Market Hub does not guarantee payments, deliveries, or product authenticity</li>
            <li>Users are advised to verify all details before completing transactions</li>
          </ul>
        </section>

        {/* Section 8 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <CreditCard className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">8. Payments (If Applicable)</h2>
          </div>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
            <li>Payment services, if provided, may be handled by third-party providers</li>
            <li>The Market Hub is not responsible for payment failures or disputes</li>
          </ul>
        </section>

        {/* Section 9 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <DollarSign className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">9. Fees & Charges</h2>
          </div>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
            <li>Certain services (e.g., premium listings, ads) may include fees</li>
            <li>All fees will be clearly communicated</li>
            <li>Fees are non-refundable unless stated otherwise</li>
          </ul>
        </section>

        {/* Section 10 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <Copyright className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">10. Intellectual Property</h2>
          </div>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
            <li>All content, logos, design, and software on The Market Hub are the property of The Market Hub</li>
            <li>Unauthorized use, copying, or distribution is strictly prohibited</li>
          </ul>
        </section>

        {/* Section 11 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">11. Limitation of Liability</h2>
          </div>
          <div className="text-gray-600 leading-relaxed space-y-4">
            <p>The Market Hub shall not be held responsible for:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>User disputes or disagreements</li>
              <li>Losses or damages from transactions</li>
              <li>Fraudulent activities by users</li>
            </ul>
            <p className="font-medium text-gray-900 italic">Use of the platform is at your own risk.</p>
          </div>
        </section>

        {/* Section 12 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <UserMinus className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">12. Account Suspension & Termination</h2>
          </div>
          <div className="text-gray-600 leading-relaxed space-y-4">
            <p>The Market Hub may suspend or permanently ban users if:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Terms are violated</li>
              <li>Suspicious or illegal activity is detected</li>
            </ul>
          </div>
        </section>

        {/* Section 13 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <Lock className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">13. Privacy</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Your use of The Market Hub is also governed by our Privacy Policy.
          </p>
        </section>

        {/* Section 14 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <RefreshCw className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">14. Modifications to Terms</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            The Market Hub reserves the right to update these Terms at any time. Continued use of the platform means acceptance of updated terms.
          </p>
        </section>

        {/* Section 15 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <Gavel className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">15. Governing Law</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            These Terms shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of [Your City/State Court].
          </p>
        </section>

        {/* Section 16 */}
        <section className="pt-12 border-t border-gray-100 space-y-6">
          <div className="flex items-center gap-3 text-blue-600">
            <HelpCircle className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">16. Contact Us</h2>
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
          The Market Hub – <span className="text-blue-600">Buy Smart. Sell Easy.</span>
        </p>
      </div>
    </div>
  );
}
