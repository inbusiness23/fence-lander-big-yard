import { useState } from "react";
import { ArrowRight, Phone, CheckCircle2, ShieldCheck, ArrowLeft, Lock, CreditCard, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { CONSULTATION_FORM_FIELDS, COMPANY, SATISFACTION_GUARANTEE } from "../data/mock";
import { toast } from "sonner";
import { validateEmail } from "../lib/emailValidator";
import axios from "axios";
import { API, backendUrlHelpText, hasBackendUrl } from "../lib/api";

export const CTASection = () => {
  const [formData, setFormData] = useState({});
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [smsConsent, setSmsConsent] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [emailSuggestion, setEmailSuggestion] = useState(null);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "email") {
      setEmailError(null);
      setEmailSuggestion(null);
    }
  };

  const handleEmailBlur = () => {
    if (!formData.email) return;
    const result = validateEmail(formData.email);
    if (!result.valid) {
      if (result.suggestion) {
        setEmailSuggestion(result.suggestion);
        setEmailError(result.error);
      } else {
        setEmailError(result.error);
        setEmailSuggestion(null);
      }
    } else {
      setEmailError(null);
      setEmailSuggestion(null);
      if (result.email !== formData.email) {
        handleChange("email", result.email);
      }
    }
  };

  const acceptEmailSuggestion = () => {
    handleChange("email", emailSuggestion);
    setEmailError(null);
    setEmailSuggestion(null);
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    const requiredFields = CONSULTATION_FORM_FIELDS.filter((f) => f.required);
    const missing = requiredFields.filter((f) => !formData[f.name]);
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }

    // Validate email
    const emailResult = validateEmail(formData.email);
    if (!emailResult.valid) {
      if (emailResult.suggestion) {
        setEmailSuggestion(emailResult.suggestion);
        setEmailError(emailResult.error);
      } else {
        setEmailError(emailResult.error);
      }
      toast.error("Please check your email address");
      return;
    }

    setStep(2);
    document.getElementById("consultation-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePayment = async () => {
    if (!hasBackendUrl) {
      toast.error(backendUrlHelpText);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API}/consultations`, {
        ...formData,
        smsConsent,
        smsConsentTimestamp: smsConsent ? new Date().toISOString() : null,
        originUrl: window.location.origin,
      });

      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        toast.error("Failed to create checkout session");
        setLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.response?.data?.detail || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <section data-testid="cta-section" className="py-16 sm:py-24 bg-stone-900" id="consultation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile: section header visible above form */}
        <div className="lg:hidden text-center mb-8">
          <span className="inline-block text-amber-400 text-sm font-semibold uppercase tracking-[0.15em] mb-3">
            Start Your Project
          </span>
          <h2
            className="text-2xl sm:text-3xl font-bold text-white mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Book Your VIP Consultation
          </h2>
          <p className="text-stone-400 text-base leading-relaxed">
            {step === 1
              ? "Fill out the form below. Your dedicated project manager will contact you within hours."
              : "Review your details and proceed to secure payment."}
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-16 items-start">
          {/* Left - Info (hidden on mobile, shown on desktop) */}
          <div className="hidden lg:block min-w-0">
            <span className="inline-block text-amber-400 text-sm font-semibold uppercase tracking-[0.15em] mb-4">
              Start Your Project
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold text-white mb-5"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Book Your VIP Consultation
            </h2>
            <p className="text-stone-400 text-lg leading-relaxed mb-6">
              {step === 1
                ? "Fill out the form and your dedicated project manager will contact you within hours to schedule your on-site visit — typically the same day or next business day."
                : "Review your information below and proceed to secure payment. Your $150 is credited in full toward your fence project."}
            </p>

            {/* $150 Fee Box */}
            <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold text-amber-300" style={{ fontFamily: "'Playfair Display', serif" }}>$150</span>
                <span className="text-amber-400/80 text-sm font-medium">VIP Consultation Fee</span>
              </div>
              <p className="text-stone-300 text-[15px] leading-relaxed mb-3">
                This isn't a typical "free estimate." The $150 fee is how we filter out tire kickers and dedicate
                <span className="text-amber-300 font-semibold"> real time, real resources, and our full attention</span> to
                homeowners who are serious about their fence project.
              </p>
              <p className="text-stone-400 text-sm leading-relaxed">
                When you move forward, the <span className="text-amber-300 font-semibold">entire $150 is credited toward your installation</span> —
                so it costs you nothing.
              </p>
            </div>

            {/* Financing */}
            <div className="p-5 rounded-xl bg-stone-800/60 border border-stone-700/50 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-400 text-sm font-bold">$</span>
                </div>
                <span className="text-white font-semibold text-sm">Pay-Over-Time Options Available</span>
              </div>
              <p className="text-stone-400 text-sm leading-relaxed ml-11">
                Spread your fence investment over time with our easy-to-apply financing. Most homeowners are approved quickly with competitive rates. Ask your project manager for details.
              </p>
            </div>

            {/* Satisfaction Guarantee */}
            <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-8">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-emerald-300 text-sm font-semibold">{SATISFACTION_GUARANTEE.headline}</span>
                  <p className="text-stone-400 text-sm leading-relaxed mt-1">
                    {SATISFACTION_GUARANTEE.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-5 mb-8">
              {[
                "Same-day or next-day on-site consultation",
                "$150 fee credited toward your installation",
                "Detailed proposal within 48 hours",
                "Transparent pricing — no hidden fees",
                "Dedicated project manager assigned to you",
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-amber-400" />
                  </div>
                  <span className="text-stone-300 text-[15px]">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Direct Call Option */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="text-sm text-stone-400 mb-3">Ready to talk? Skip the form.</div>
              <div className="flex items-center gap-3 text-stone-300 font-semibold text-lg">
                <Phone className="w-5 h-5 text-amber-400" />
                {COMPANY.phone}
              </div>
            </div>
          </div>

          {/* Right - Form (shows FIRST on mobile via order) */}
          <div id="consultation-form" className="min-w-0">
            {step === 1 ? (
              <form
                onSubmit={handleStep1Submit}
                data-testid="consultation-form"
                className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl shadow-black/20"
              >
                {/* Step indicator */}
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                    <span className="text-sm font-semibold text-stone-800">Your Details</span>
                  </div>
                  <div className="flex-1 h-px bg-stone-200" />
                  <div className="flex items-center gap-2 opacity-40">
                    <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center text-sm font-bold">2</div>
                    <span className="text-sm font-medium text-stone-400">Secure Payment</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                  {CONSULTATION_FORM_FIELDS.map((field) => {
                    if (field.type === "textarea") {
                      return (
                        <div key={field.name} className="sm:col-span-2">
                          <Label className="text-stone-700 font-medium text-sm mb-2 block">
                            {field.label}
                            {field.required && <span className="text-amber-600 ml-1">*</span>}
                          </Label>
                          <Textarea
                            placeholder={field.placeholder}
                            value={formData[field.name] || ""}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            className="border-stone-200 focus:border-amber-500 focus:ring-amber-500/20 min-h-[100px] rounded-lg resize-none"
                          />
                        </div>
                      );
                    }

                    if (field.type === "select") {
                      return (
                        <div key={field.name} className={field.name === "address" ? "sm:col-span-2" : ""}>
                          <Label className="text-stone-700 font-medium text-sm mb-2 block">
                            {field.label}
                            {field.required && <span className="text-amber-600 ml-1">*</span>}
                          </Label>
                          <Select
                            value={formData[field.name] || ""}
                            onValueChange={(val) => handleChange(field.name, val)}
                          >
                            <SelectTrigger className="border-stone-200 focus:border-amber-500 focus:ring-amber-500/20 rounded-lg h-11">
                              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    }

                    // Email field with validation
                    if (field.name === "email") {
                      return (
                        <div key={field.name}>
                          <Label className="text-stone-700 font-medium text-sm mb-2 block">
                            {field.label}
                            {field.required && <span className="text-amber-600 ml-1">*</span>}
                          </Label>
                          <Input
                            type="email"
                            placeholder={field.placeholder}
                            value={formData[field.name] || ""}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            onBlur={handleEmailBlur}
                            data-testid="email-input"
                            className={`border-stone-200 focus:border-amber-500 focus:ring-amber-500/20 rounded-lg h-11 ${emailError ? "border-red-400 focus:border-red-500" : ""}`}
                          />
                          {emailError && (
                            <div className="mt-1.5 flex items-start gap-1.5" data-testid="email-error">
                              <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-red-600">
                                {emailSuggestion ? (
                                  <>
                                    Did you mean{" "}
                                    <button
                                      type="button"
                                      onClick={acceptEmailSuggestion}
                                      data-testid="email-suggestion-btn"
                                      className="text-amber-700 font-semibold underline underline-offset-2 hover:text-amber-800"
                                    >
                                      {emailSuggestion}
                                    </button>
                                    ?
                                  </>
                                ) : (
                                  emailError
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div key={field.name} className={field.name === "address" ? "sm:col-span-2" : ""}>
                        <Label className="text-stone-700 font-medium text-sm mb-2 block">
                          {field.label}
                          {field.required && <span className="text-amber-600 ml-1">*</span>}
                        </Label>
                        <Input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formData[field.name] || ""}
                          onChange={(e) => handleChange(field.name, e.target.value)}
                          className="border-stone-200 focus:border-amber-500 focus:ring-amber-500/20 rounded-lg h-11"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* A2P SMS Consent */}
                {formData.phone && (
                  <div className="mt-5 p-4 rounded-lg bg-stone-50 border border-stone-200" data-testid="sms-consent-section">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="sms-consent"
                        checked={smsConsent}
                        onCheckedChange={setSmsConsent}
                        data-testid="sms-consent-checkbox"
                        className="mt-0.5 border-stone-300 data-[state=checked]:bg-amber-700 data-[state=checked]:border-amber-700"
                      />
                      <label htmlFor="sms-consent" className="text-xs text-stone-500 leading-relaxed cursor-pointer">
                        By checking this box, I consent to receive automated text messages from
                        <span className="font-semibold text-stone-700"> ASAP Fence & Gates</span> at the phone number provided above
                        regarding my fence consultation and project updates. Message frequency varies. Msg & data rates may apply.
                        Reply STOP to cancel at any time. Reply HELP for help. Consent is not a condition of purchase.
                        View our <a href="/privacy" target="_blank" className="text-amber-700 underline">Privacy Policy</a> and <a href="/terms" target="_blank" className="text-amber-700 underline">Terms of Service</a>.
                      </label>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  data-testid="consultation-step1-submit-btn"
                  className="w-full mt-6 sm:mt-8 bg-amber-700 hover:bg-amber-800 text-white py-6 text-base font-semibold rounded-lg shadow-lg shadow-amber-700/20 transition-all duration-300 hover:shadow-amber-800/30 group"
                >
                  Continue to Secure Payment — $150
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-0.5" />
                </Button>

                <p className="text-center text-stone-400 text-xs mt-4">
                  $150 consultation fee is fully credited toward your project. No spam. No obligation.
                </p>
              </form>
            ) : (
              /* Step 2: Review & Pay */
              <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl shadow-black/20">
                {/* Step indicator */}
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <div className="flex items-center gap-2 opacity-60">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-stone-500">Your Details</span>
                  </div>
                  <div className="flex-1 h-px bg-amber-300" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                    <span className="text-sm font-semibold text-stone-800">Secure Payment</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-stone-50 rounded-xl p-4 sm:p-6 mb-6 border border-stone-100">
                  <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">Consultation Details</h3>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div>
                      <span className="text-stone-400 block text-xs">Name</span>
                      <span className="text-stone-800 font-medium">{formData.fullName}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-xs">Email</span>
                      <span className="text-stone-800 font-medium break-all">{formData.email}</span>
                    </div>
                    {formData.phone && (
                      <div>
                        <span className="text-stone-400 block text-xs">Phone</span>
                        <span className="text-stone-800 font-medium">{formData.phone}</span>
                        {smsConsent && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> SMS opted in
                          </span>
                        )}
                      </div>
                    )}
                    <div>
                      <span className="text-stone-400 block text-xs">Property</span>
                      <span className="text-stone-800 font-medium break-words">{formData.address}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-xs">Yard Size</span>
                      <span className="text-stone-800 font-medium">{formData.yardSize}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-xs">Project</span>
                      <span className="text-stone-800 font-medium">{formData.projectType}</span>
                    </div>
                    {formData.fenceStyle && (
                      <div>
                        <span className="text-stone-400 block text-xs">Fence Style</span>
                        <span className="text-stone-800 font-medium">{formData.fenceStyle}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-amber-50 rounded-xl p-4 sm:p-6 mb-6 border border-amber-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-stone-700 font-medium text-sm">VIP Consultation Fee</span>
                    <span className="text-2xl font-bold text-stone-900" style={{ fontFamily: "'Playfair Display', serif" }}>$150.00</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-700 text-sm">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">Credited in full toward your fence installation</span>
                  </div>
                </div>

                {/* Guarantee */}
                <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-emerald-800 text-sm font-semibold">{SATISFACTION_GUARANTEE.headline}</span>
                    <p className="text-emerald-700/70 text-xs mt-1">
                      Not satisfied with your consultation? We'll refund the full $150 — no questions asked.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <Button
                  onClick={handlePayment}
                  disabled={loading}
                  data-testid="consultation-pay-btn"
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white py-6 text-base font-semibold rounded-lg shadow-lg shadow-amber-700/20 transition-all duration-300 hover:shadow-amber-800/30 group disabled:opacity-70 mb-3"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connecting to secure checkout...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Pay $150 — Proceed to Secure Checkout
                      <CreditCard className="w-4 h-4 ml-1" />
                    </span>
                  )}
                </Button>

                <button
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center gap-2 w-full py-3 text-stone-500 text-sm font-medium hover:text-stone-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to edit details
                </button>

                <div className="flex items-center justify-center gap-2 mt-4 text-stone-400 text-xs">
                  <Lock className="w-3 h-3" />
                  <span>Secured by Stripe. Your payment info is never stored on our servers.</span>
                </div>
              </div>
            )}

            {/* Mobile-only: compact info below form */}
            <div className="lg:hidden mt-8 space-y-4">
              {/* $150 explanation */}
              <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-amber-300" style={{ fontFamily: "'Playfair Display', serif" }}>$150</span>
                  <span className="text-amber-400/80 text-sm font-medium">credited toward your project</span>
                </div>
                <p className="text-stone-300 text-sm leading-relaxed">
                  The consultation fee filters out tire kickers so we can dedicate our full attention to serious homeowners. It's credited in full when you move forward.
                </p>
              </div>

              {/* Guarantee */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-emerald-300 text-sm font-semibold">{SATISFACTION_GUARANTEE.headline}</span>
                    <p className="text-stone-400 text-xs leading-relaxed mt-1">
                      Not satisfied? Full $150 refund — no questions asked.
                    </p>
                  </div>
                </div>
              </div>

              {/* Call CTA */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm text-stone-400 mb-2">Ready to talk? Skip the form.</div>
                <a
                  href={`tel:${COMPANY.phone.replace(/[^0-9]/g, "")}`}
                  data-testid="cta-mobile-call-btn"
                  className="flex items-center justify-center gap-3 w-full py-3 rounded-lg bg-white text-stone-900 font-bold text-base hover:bg-stone-100 transition-all duration-200"
                >
                  <Phone className="w-4 h-4 text-amber-700" />
                  {COMPANY.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
