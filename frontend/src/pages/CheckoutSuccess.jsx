import { useState, useEffect } from "react";
import { CheckCircle2, Phone, ArrowRight, ShieldCheck, Loader2, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import { COMPANY } from "../data/mock";
import axios from "axios";
import { API, backendUrlHelpText, hasBackendUrl } from "../lib/api";

export default function CheckoutSuccess() {
  const [status, setStatus] = useState("checking");
  const [consultation, setConsultation] = useState(null);

  useEffect(() => {
    if (!hasBackendUrl) {
      setStatus("error");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setStatus("error");
      return;
    }

    const pollStatus = async (attempt) => {
      try {
        const response = await axios.get(`${API}/consultations/status/${sessionId}`);
        const data = response.data;

        if (data.payment_status === "paid") {
          setStatus("success");
          setConsultation(data.consultation);
          return;
        } else if (data.status === "expired") {
          setStatus("expired");
          return;
        }

        if (attempt < 8) {
          setTimeout(() => pollStatus(attempt + 1), 2500);
        } else {
          setStatus("timeout");
        }
      } catch (error) {
        console.error("Status check error:", error);
        if (attempt < 8) {
          setTimeout(() => pollStatus(attempt + 1), 2500);
        } else {
          setStatus("error");
        }
      }
    };

    pollStatus(0);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-lg w-full text-center">
        {status === "checking" && (
          <>
            <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-8">
              <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
            </div>
            <h1
              className="text-2xl font-bold text-stone-900 mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
              data-testid="success-checking-heading"
            >
              Confirming Your Payment...
            </h1>
            <p className="text-stone-500">Please wait while we verify your payment with Stripe.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h1
              className="text-2xl sm:text-3xl font-bold text-stone-900 mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
              data-testid="success-confirmed-heading"
            >
              You're Confirmed{consultation?.fullName ? `, ${consultation.fullName.split(" ")[0]}` : ""}!
            </h1>

            {/* Urgency / "We're reaching out now" messaging */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 text-left">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-stone-900 font-semibold text-base mb-1">
                    We're reaching out to you right now.
                  </p>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    Your dedicated project manager has been notified and will contact you shortly to schedule your
                    VIP on-site appointment — typically the same day or next business day.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 sm:p-6 border border-stone-200 mb-6 text-left">
              <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-4">What Happens Next</h3>
              <div className="space-y-4">
                {[
                  "Your project manager will call you to schedule your on-site VIP visit",
                  "They'll arrive with material samples and walk your entire fence line",
                  "You'll receive a detailed custom proposal within 48 hours",
                  "Your $150 is credited in full toward your project when you proceed",
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-amber-700 text-xs font-bold">{idx + 1}</span>
                    </div>
                    <span className="text-stone-600 text-sm">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-8 text-left">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-emerald-700 text-sm">
                <span className="font-semibold">100% Satisfaction Guarantee</span> — If you're not happy with your consultation for any reason, we'll refund your $150.
              </p>
            </div>

            <div className="space-y-3">
              <a href="/">
                <Button data-testid="success-return-home-btn" className="w-full bg-amber-700 hover:bg-amber-800 text-white py-5 font-semibold rounded-lg">
                  Return to Home
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
              <a
                href={`tel:${COMPANY.phone.replace(/[^0-9]/g, "")}`}
                className="flex items-center justify-center gap-2 py-3 text-stone-500 text-sm font-medium hover:text-stone-700 transition-colors"
                data-testid="success-call-link"
              >
                <Phone className="w-4 h-4" />
                Questions? Call {COMPANY.phone}
              </a>
            </div>
          </>
        )}

        {(status === "error" || status === "timeout" || status === "expired") && (
          <>
            <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-8">
              <Phone className="w-10 h-10 text-amber-600" />
            </div>
            <h1
              className="text-2xl font-bold text-stone-900 mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {status === "expired" ? "Session Expired" : "We're On It"}
            </h1>
            <p className="text-stone-500 text-lg leading-relaxed mb-8">
              {status === "expired"
                ? "Your payment session has expired. Please try booking again."
                : backendUrlHelpText}
            </p>
            <div className="space-y-3">
              <a href="/#consultation-form">
                <Button className="w-full bg-amber-700 hover:bg-amber-800 text-white py-5 font-semibold rounded-lg">
                  Book Again
                </Button>
              </a>
              <a
                href={`tel:${COMPANY.phone.replace(/[^0-9]/g, "")}`}
                className="flex items-center justify-center gap-2 py-3 text-stone-500 text-sm font-medium hover:text-stone-700 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call {COMPANY.phone}
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
