import { Phone, ArrowRight, Clock, User, Briefcase, Gem, Star, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import { COMPANY, SATISFACTION_GUARANTEE } from "../data/mock";

export const WhyNotFreeSection = () => {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-16 sm:py-24 bg-stone-900 overflow-hidden" id="why-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Left - The Argument */}
          <div className="min-w-0">
            <span className="inline-block text-amber-400 text-sm font-semibold uppercase tracking-[0.15em] mb-5">
              The $150 Question
            </span>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              "Why Should I Pay When Everyone Else Gives Free Estimates?"
            </h2>
            <p className="text-stone-300 text-lg leading-relaxed mb-8">
              It's the best question you can ask — and the answer is exactly why our clients 
              choose us over every other fence contractor in Seminole County.
            </p>

            <div className="space-y-6 mb-10">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0 mt-1">
                  <Clock className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Free means rushed.</h4>
                  <p className="text-stone-400 text-[15px] leading-relaxed">
                    Free estimators juggle 6-8 appointments daily. They spend 15 minutes on your property, 
                    hand you a generic quote, and move on. Your large yard deserves more than a drive-by.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Free sends their junior estimator.</h4>
                  <p className="text-stone-400 text-[15px] leading-relaxed">
                    When it's free, you get whoever is available — often the newest hire. Our $150 consultation 
                    guarantees our most experienced project manager walks your property personally.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0 mt-1">
                  <Briefcase className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Free means you're the product, not the client.</h4>
                  <p className="text-stone-400 text-[15px] leading-relaxed">
                    Free estimates are a sales tool designed to generate leads. Our consultation is a service 
                    designed to solve your fencing problem — whether you hire us or not.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - What You Actually Get */}
          <div>
            <div className="bg-stone-800/50 backdrop-blur-sm rounded-2xl border border-stone-700/50 p-6 sm:p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
                  <Gem className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                    What Your $150 Actually Buys
                  </h3>
                  <p className="text-stone-400 text-sm">Credited in full when you move forward</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  "60-90 minute dedicated on-site consultation",
                  "Your most experienced project manager — not a junior estimator",
                  "Physical material samples brought to your property",
                  "Full property survey and fence line measurement",
                  "HOA requirement review and compliance check",
                  "Design options discussion tailored to your vision",
                  "Detailed custom proposal within 48 hours",
                  "Transparent pricing — no hidden fees, no surprises",
                  "Zero sales pressure — just expertise and honest guidance",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    </div>
                    <span className="text-stone-300 text-[15px]">{item}</span>
                  </div>
                ))}
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 mb-4">
                <p className="text-amber-200 text-sm font-semibold mb-1">The Bottom Line</p>
                <p className="text-stone-300 text-[15px] leading-relaxed">
                  You wouldn't expect the Ritz-Carlton to compete with a motel on price — and 
                  you wouldn't want them to. The $150 is how we ensure you get an experience 
                  that matches the size of your investment.
                </p>
              </div>

              {/* Satisfaction Guarantee */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-emerald-300 text-sm font-semibold mb-1">{SATISFACTION_GUARANTEE.headline}</p>
                    <p className="text-stone-400 text-sm leading-relaxed">
                      {SATISFACTION_GUARANTEE.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dual CTA */}
              <div className="space-y-3">
                <Button
                  onClick={() => scrollTo("consultation-form")}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-5 text-base font-semibold rounded-lg shadow-lg shadow-amber-600/20 transition-all duration-200 group"
                >
                  Book Your VIP Consultation — $150
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" />
                </Button>
                {/* Mobile: click-to-call | Desktop: just display number */}
                <a
                  href={`tel:${COMPANY.phone.replace(/[^0-9]/g, "")}`}
                  className="flex md:hidden items-center justify-center gap-2 w-full py-4 rounded-lg border border-stone-600 text-stone-300 hover:text-white hover:border-stone-500 hover:bg-stone-700/30 transition-all duration-200 font-medium text-sm"
                >
                  <Phone className="w-4 h-4" />
                  Call now: {COMPANY.phone}
                </a>
                <div className="hidden md:flex items-center justify-center gap-2 w-full py-4 rounded-lg text-stone-400 font-medium text-sm">
                  <Phone className="w-4 h-4 text-stone-500" />
                  Or call us: {COMPANY.phone}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
