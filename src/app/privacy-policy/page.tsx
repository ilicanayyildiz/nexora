import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Nexora",
  description: "Privacy Policy for Nexora NFT marketplace and creator platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="space-y-8 text-white/80 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Introduction</h2>
          <p>
            This Privacy Policy describes how Nexora (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and shares your personal 
            information when you use our NFT marketplace platform and related services (collectively, the &quot;Services&quot;).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">1. Information We Collect</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-white">1.1 Information You Provide</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Wallet address and associated blockchain information</li>
                <li>Profile information (username, email if provided)</li>
                <li>NFT metadata and content you create or upload</li>
                <li>Communications with our support team</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2 text-white">1.2 Information We Collect Automatically</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Usage data and analytics</li>
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
                <li>Transaction data on the blockchain</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
            <li>Provide, maintain, and improve our Services</li>
            <li>Process transactions and manage your account</li>
            <li>Communicate with you about our Services</li>
            <li>Ensure security and prevent fraud</li>
            <li>Comply with legal obligations</li>
            <li>Analyze usage patterns to improve user experience</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">3. Information Sharing</h2>
          <div className="space-y-3">
            <p>
              3.1 We do not sell, trade, or rent your personal information to third parties. We may share your 
              information in the following circumstances:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>With service providers who assist in operating our platform</li>
              <li>In connection with a business transfer or merger</li>
            </ul>
            <p>
              3.2 Please note that blockchain transactions are public and your wallet address may be visible 
              to other users when you engage in transactions.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information 
            against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
            over the internet or electronic storage is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">5. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to provide our Services and comply with 
            legal obligations. When you delete your account, we will delete or anonymize your personal information, 
            except where we are required to retain it for legal purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">6. Your Rights</h2>
          <p>Depending on your location, you may have the following rights:</p>
          <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
            <li>Access to your personal information</li>
            <li>Correction of inaccurate information</li>
            <li>Deletion of your personal information</li>
            <li>Restriction of processing</li>
            <li>Data portability</li>
            <li>Objection to processing</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">7. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your experience on our platform. You can control 
            cookie settings through your browser preferences. Some features of our Services may not function 
            properly if cookies are disabled.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">8. Third-Party Services</h2>
          <p>
            Our Services may contain links to third-party websites or services. We are not responsible for the 
            privacy practices of these third parties. We encourage you to review their privacy policies before 
            providing any personal information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">9. Children's Privacy</h2>
          <p>
            Our Services are not intended for children under 13 years of age. We do not knowingly collect 
            personal information from children under 13. If you become aware that a child has provided us with 
            personal information, please contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by 
            posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. Your continued use 
            of our Services after such changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
          </p>
          <div className="bg-white/5 rounded-xl p-6 mt-4">
            <p><strong>Email:</strong> privacy@nexora.com</p>
            <p><strong>Support:</strong> support@nexora.com</p>
          </div>
          <p className="text-sm text-white/60 mt-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </section>
      </div>
    </div>
  );
}
