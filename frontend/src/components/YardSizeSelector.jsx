import { useState } from "react";
import { Check, ArrowRight, Crown, Sparkles, Lock, ShieldX } from "lucide-react";
import { Button } from "./ui/button";
import { YARD_SIZES, DISQUALIFY_MESSAGE } from "../data/mock";

export const YardSizeSelector = () => {
  const [selected, setSelected] = useState(null);
  const [showDisqualify, setShowDisqualify] = useState(false);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-24 bg-stone-50" id="yard-size">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-amber-700 text-sm font-semibold uppercase tracking-[0.15em] mb-4">
            Exclusive Service
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold text-stone-900 mb-5"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Our VIP Team Is Reserved for Large Properties
          </h2>
          <p className="text-stone-500 text-lg leading-relaxed">
            We intentionally limit our client roster to ensure every large property gets
            the dedicated attention it deserves. Select your property size below.
          </p>
        </div>

        {/* VIP Size Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
          {YARD_SIZES.map((yard) => {
            const isSelected = selected === yard.id;

            return (
              <div
                key={yard.id}
                onClick={() => {
                  setSelected(yard.id);
                  setShowDisqualify(false);
                }}
                className={`relative cursor-pointer rounded-2xl p-8 transition-all duration-300 border-2 ${
                  isSelected
                    ? "border-amber-600 bg-white shadow-xl shadow-amber-100/50 -translate-y-1"
                    : "border-amber-200 bg-white hover:border-amber-400 hover:shadow-lg hover:-translate-y-0.5"
                }`}
              >
                {/* VIP Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 bg-amber-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-lg">
                    <Crown className="w-3 h-3" />
                    VIP Service
                  </div>
                </div>

                {/* Selection Indicator */}
                <div
                  className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    isSelected ? "border-amber-600 bg-amber-600" : "border-stone-300"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>

                <div className="mt-4">
                  <h3
                    className="text-xl font-bold text-stone-900 mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {yard.label}
                  </h3>
                  <div className="text-2xl font-bold text-amber-700 mb-1">
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

        {/* Under ¼ Acre Disqualifier */}
        <div className="text-center mb-6">
          <button
            onClick={() => {
              setShowDisqualify(true);
              setSelected(null);
            }}
            className="text-sm text-stone-400 hover:text-stone-500 underline underline-offset-4 decoration-dotted transition-colors"
          >
            My property is under ¼ acre
          </button>
        </div>

        {/* Disqualification Message */}
        {showDisqualify && (
          <div className="max-w-2xl mx-auto mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-stone-100 border border-stone-200 rounded-xl p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-stone-200 flex items-center justify-center mx-auto mb-5">
                <Lock className="w-6 h-6 text-stone-500" />
              </div>
              <h3
                className="text-lg font-bold text-stone-700 mb-3"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {DISQUALIFY_MESSAGE.title}
              </h3>
              <p className="text-stone-500 text-[15px] leading-relaxed mb-4">
                {DISQUALIFY_MESSAGE.description}
              </p>
              <p className="text-stone-400 text-sm italic">
                {DISQUALIFY_MESSAGE.note}
              </p>
            </div>
          </div>
        )}

        {/* Selected VIP Message */}
        {selected && (
          <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span className="font-medium">
                {YARD_SIZES.find((y) => y.id === selected)?.message}
              </span>
              <Button
                onClick={() => scrollTo("consultation")}
                className="ml-2 bg-amber-700 hover:bg-amber-800 text-white text-sm px-5 py-2 rounded-lg transition-all duration-200 group"
              >
                Book VIP Consultation — $150
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
