import { ArrowLeft } from "lucide-react";
import { COMPANY } from "../data/mock";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <a href="/" className="inline-flex items-center gap-2 text-amber-700 text-sm font-medium hover:text-amber-800 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </a>

        <h1 className="text-3xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Privacy Policy
        </h1>
        <p className="text-stone-400 text-sm mb-10">Last updated: February 12, 2026</p>

        <div className="prose prose-stone prose-sm max-w-none space-y-6 text-stone-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">1. Information We Collect</h2>
            <p>
              When you submit a consultation request or callback form on our website, we collect the following information:
            </p>
            <ul className="list-disc ml-5 space-y-1 mt-2">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number (optional)</li>
              <li>Property address including city and zip code</li>
              <li>Yard size and project details</li>
              <li>Any additional information you choose to provide</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc ml-5 space-y-1 mt-2">
              <li>Contact you to schedule and conduct your fence consultation</li>
              <li>Prepare a customized project proposal for your property</li>
              <li>Process your consultation fee payment via Stripe</li>
              <li>Send you project updates and relevant communications</li>
              <li>Improve our services and website experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">3. SMS/Text Messaging</h2>
            <p>
              If you provide your phone number and opt in to receive text messages, we may send you automated SMS messages
              regarding your consultation, appointment scheduling, and project updates. By opting in, you agree to receive
              these messages from <strong>{COMPANY.name}</strong>.
            </p>
            <ul className="list-disc ml-5 space-y-1 mt-2">
              <li>Message frequency varies based on your project status</li>
              <li>Message and data rates may apply</li>
              <li>Reply <strong>STOP</strong> at any time to opt out of text messages</li>
              <li>Reply <strong>HELP</strong> for assistance</li>
              <li>Consent to receive text messages is not a condition of purchase</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">4. Payment Processing</h2>
            <p>
              All payment transactions are processed securely through Stripe. We do not store your credit card
              information on our servers. Stripe's privacy policy governs the handling of your payment data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">5. Information Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share your information with:
            </p>
            <ul className="list-disc ml-5 space-y-1 mt-2">
              <li>Our CRM platform (GoHighLevel) to manage your project and communications</li>
              <li>Payment processors (Stripe) to process transactions</li>
              <li>Service providers who assist in operating our business, subject to confidentiality agreements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">6. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information.
              However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">7. Your Rights</h2>
            <p>
              You may request to access, correct, or delete your personal information at any time by
              contacting us at <a href={`mailto:${COMPANY.email}`} className="text-amber-700 underline">{COMPANY.email}</a> or
              calling <a href={`tel:${COMPANY.phone.replace(/[^0-9]/g, "")}`} className="text-amber-700 underline">{COMPANY.phone}</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">8. Contact</h2>
            <p>
              If you have questions about this Privacy Policy, contact us at:<br />
              <strong>{COMPANY.name}</strong><br />
              Email: <a href={`mailto:${COMPANY.email}`} className="text-amber-700 underline">{COMPANY.email}</a><br />
              Phone: <a href={`tel:${COMPANY.phone.replace(/[^0-9]/g, "")}`} className="text-amber-700 underline">{COMPANY.phone}</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
