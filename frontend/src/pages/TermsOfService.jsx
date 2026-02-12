import { ArrowLeft } from "lucide-react";
import { COMPANY } from "../data/mock";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <a href="/" className="inline-flex items-center gap-2 text-amber-700 text-sm font-medium hover:text-amber-800 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </a>

        <h1 className="text-3xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Terms of Service
        </h1>
        <p className="text-stone-400 text-sm mb-10">Last updated: February 12, 2026</p>

        <div className="prose prose-stone prose-sm max-w-none space-y-6 text-stone-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">1. Services</h2>
            <p>
              <strong>{COMPANY.name}</strong> ("we," "our," "us") provides fence installation, replacement,
              and consultation services for residential properties in Seminole County, Florida.
              This website facilitates booking VIP consultations and contacting our team.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">2. VIP Consultation Fee</h2>
            <p>
              The $150 VIP Consultation Fee is required to book an on-site consultation with a dedicated project manager.
              This fee:
            </p>
            <ul className="list-disc ml-5 space-y-1 mt-2">
              <li>Is credited in full toward your fence installation if you proceed with the project</li>
              <li>Includes an on-site property survey, material samples, HOA review, and a detailed custom proposal</li>
              <li>Is subject to our 100% Satisfaction Guarantee (see below)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">3. 100% Satisfaction Guarantee</h2>
            <p>
              If you are not satisfied with your VIP consultation for any reason, you may request a full refund
              of the $150 consultation fee. To request a refund, contact us within 7 days of your consultation at{" "}
              <a href={`mailto:${COMPANY.email}`} className="text-amber-700 underline">{COMPANY.email}</a> or{" "}
              <a href={`tel:${COMPANY.phone.replace(/[^0-9]/g, "")}`} className="text-amber-700 underline">{COMPANY.phone}</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">4. Payment Terms</h2>
            <p>
              All payments are processed securely through Stripe. By submitting payment, you authorize us to charge the
              specified amount to your payment method. Consultation fees are processed at the time of booking.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">5. SMS Communications</h2>
            <p>
              If you opt in to receive SMS messages:
            </p>
            <ul className="list-disc ml-5 space-y-1 mt-2">
              <li>You consent to receive automated text messages from {COMPANY.name} at the phone number you provided</li>
              <li>Messages may include appointment confirmations, scheduling updates, and project communications</li>
              <li>Message frequency varies; message and data rates may apply</li>
              <li>You can opt out at any time by replying <strong>STOP</strong></li>
              <li>Reply <strong>HELP</strong> for assistance</li>
              <li>SMS consent is not required to purchase any goods or services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">6. Scheduling & Cancellations</h2>
            <p>
              We will make every effort to schedule your VIP consultation at a mutually convenient time, typically
              the same day or next business day after booking. If you need to reschedule, please contact us at
              least 24 hours in advance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">7. Service Area</h2>
            <p>
              Our Large Yard Division serves properties of ¼ acre and larger in Seminole County, Florida, including
              Lake Mary, Sanford, Oviedo, Longwood, Altamonte Springs, and surrounding areas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">8. Limitation of Liability</h2>
            <p>
              This website is provided "as is." We are not liable for any indirect, incidental, or consequential
              damages arising from use of this website or reliance on information provided herein.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">9. Contact</h2>
            <p>
              For questions about these Terms, contact us at:<br />
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
