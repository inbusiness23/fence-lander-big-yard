import { useState } from "react";
import { Check, ArrowRight, Crown, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { YARD_SIZES } from "../data/mock";

export const YardSizeSelector = () => {
  const [selected, setSelected] = useState(null);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-24 bg-stone-50" id="yard-size">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-amber-700 text-sm font-semibold uppercase tracking-[0.15em] mb-4">
            Find Your Division
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold text-stone-900 mb-5"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Is Your Property a Fit for Our VIP Team?
          </h2>
          <p className="text-stone-500 text-lg leading-relaxed">
            Select your yard size below. Our Large Yard Division is purpose-built for
            homeowners who expect more from their fencing partner.
          </p>
        </div>

        {/* Size Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {YARD_SIZES.map((yard) => {
            const isSelected = selected === yard.id;
            const isVIP = yard.recommended;

            return (
              <div
                key={yard.id}
                onClick={() => setSelected(yard.id)}
                className={`relative cursor-pointer rounded-2xl p-8 transition-all duration-300 border-2 ${
                  isSelected && isVIP
                    ? "border-amber-600 bg-white shadow-xl shadow-amber-100/50 -translate-y-1"
                    : isSelected && !isVIP
                    ? "border-stone-400 bg-white shadow-lg -translate-y-1"
                    : isVIP
                    ? "border-amber-200 bg-white hover:border-amber-400 hover:shadow-lg hover:-translate-y-0.5"
                    : "border-stone-200 bg-white/70 hover:border-stone-300 hover:shadow-md"
                }`}
              >
                {/* VIP Badge */}
                {isVIP && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 bg-amber-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-lg">
                      <Crown className="w-3 h-3" />
                      VIP Service
                    </div>
                  </div>
                )}

                {/* Selection Indicator */}
                <div
                  className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? isVIP
                        ? "border-amber-600 bg-amber-600"
                        : "border-stone-500 bg-stone-500"
                      : "border-stone-300"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>

                <div className="mt-4">
                  <h3
                    className={`text-xl font-bold mb-2 ${
                      isVIP ? "text-stone-900" : "text-stone-600"
                    }`}
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {yard.label}
                  </h3>
                  <div
                    className={`text-2xl font-bold mb-1 ${
                      isVIP ? "text-amber-700" : "text-stone-500"
                    }`}
                  >
                    {yard.size}
                  </div>
                  <div className="text-sm text-stone-400 mb-3">
                    Typical investment: {yard.budget}
                  </div>
                  <p className="text-sm text-stone-500 leading-relaxed">
                    {yard.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selection Message */}
        {selected && (
          <div className="mt-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl ${
                YARD_SIZES.find((y) => y.id === selected)?.recommended
                  ? "bg-amber-50 border border-amber-200 text-amber-800"
                  : "bg-stone-100 border border-stone-200 text-stone-600"
              }`}
            >
              {YARD_SIZES.find((y) => y.id === selected)?.recommended ? (
                <Sparkles className="w-5 h-5 text-amber-600" />
              ) : null}
              <span className="font-medium">
                {YARD_SIZES.find((y) => y.id === selected)?.message}
              </span>
              {YARD_SIZES.find((y) => y.id === selected)?.recommended && (
                <Button
                  onClick={() => scrollTo("consultation")}
                  className="ml-2 bg-amber-700 hover:bg-amber-800 text-white text-sm px-5 py-2 rounded-lg transition-all duration-200 group"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
