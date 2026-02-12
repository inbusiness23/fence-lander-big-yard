import { useState } from "react";
import { ArrowRight, Send, Phone, CheckCircle2 } from "lucide-react";
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
import { CONSULTATION_FORM_FIELDS, COMPANY } from "../data/mock";
import { toast } from "sonner";

export const CTASection = () => {
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    const requiredFields = CONSULTATION_FORM_FIELDS.filter((f) => f.required);
    const missing = requiredFields.filter((f) => !formData[f.name]);
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }

    setLoading(true);
    // Simulate submission (frontend-only mock)
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      // Store in localStorage as mock
      const existing = JSON.parse(localStorage.getItem("consultations") || "[]");
      existing.push({ ...formData, timestamp: new Date().toISOString() });
      localStorage.setItem("consultations", JSON.stringify(existing));
      toast.success("Consultation request submitted!");
    }, 1500);
  };

  if (submitted) {
    return (
      <section className="py-24 bg-stone-900" id="consultation">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-amber-400" />
          </div>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            We'll Be in Touch Soon
          </h2>
          <p className="text-stone-400 text-lg leading-relaxed mb-8">
            Your dedicated project manager will reach out within hours to schedule
            your on-site consultation — typically the same day or next business day. 
            Your $150 VIP consultation fee will be credited toward your project.
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              setFormData({});
            }}
            variant="outline"
            className="border-stone-600 text-stone-300 hover:bg-stone-800 hover:text-white"
          >
            Submit Another Request
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-stone-900" id="consultation">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 items-start">
          {/* Left - Info */}
          <div>
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
              Fill out the form and your dedicated project manager will contact you
              within hours to schedule your on-site visit — typically the same day or next business day.
            </p>

            {/* $150 Fee Box */}
            <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-8">
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
                so it costs you nothing. You get a thorough on-site assessment, material samples brought to your property, 
                and a detailed custom proposal within 48 hours.
              </p>
            </div>

            {/* Financing */}
            <div className="p-5 rounded-xl bg-stone-800/60 border border-stone-700/50 mb-8">
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

            {/* Benefits */}
            <div className="space-y-5 mb-10">
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
              <a
                href={`tel:${COMPANY.phone.replace(/[^0-9]/g, "")}`}
                className="flex items-center justify-center gap-3 w-full py-4 rounded-lg bg-white text-stone-900 font-bold text-lg hover:bg-stone-100 transition-all duration-200 shadow-lg"
              >
                <Phone className="w-5 h-5 text-amber-700" />
                {COMPANY.phone}
              </a>
            </div>
          </div>

          {/* Right - Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/20"
          >
            <div className="grid sm:grid-cols-2 gap-5">
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-amber-700 hover:bg-amber-800 text-white py-6 text-base font-semibold rounded-lg shadow-lg shadow-amber-700/20 transition-all duration-300 hover:shadow-amber-800/30 group disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Schedule My VIP Consultation — $150
                  <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </Button>

            <p className="text-center text-stone-400 text-xs mt-4">
              $150 consultation fee is fully credited toward your project. No spam. No obligation.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};
