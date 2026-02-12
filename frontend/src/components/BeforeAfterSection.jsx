import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { BEFORE_AFTER } from "../data/mock";

export const BeforeAfterSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <section className="py-24 bg-white" id="transformations">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-amber-700 text-sm font-semibold uppercase tracking-[0.15em] mb-4">
            Real Transformations
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold text-stone-900 mb-5"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            See the Difference a Premium Fence Makes
          </h2>
          <p className="text-stone-500 text-lg leading-relaxed">
            Every project starts with a vision. Here are real Seminole County properties
            transformed by our Large Yard Division.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-10">
          {BEFORE_AFTER.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setActiveSlide(idx)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeSlide === idx
                  ? "bg-stone-900 text-white shadow-lg"
                  : "bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Before / After Display */}
        <div className="max-w-5xl mx-auto">
          {BEFORE_AFTER.map((item, idx) => (
            <div
              key={item.id}
              className={`grid md:grid-cols-2 gap-6 items-stretch ${
                activeSlide === idx ? "block" : "hidden"
              }`}
            >
              {/* Before */}
              <div className="group relative overflow-hidden rounded-2xl">
                <img
                  src={item.before.image}
                  alt={item.before.caption}
                  className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500/90 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur-sm">
                    Before
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-sm font-medium">{item.before.caption}</p>
                </div>
              </div>

              {/* After */}
              <div className="group relative overflow-hidden rounded-2xl">
                <img
                  src={item.after.image}
                  alt={item.after.caption}
                  className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-emerald-500/90 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur-sm">
                    After
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-sm font-medium">{item.after.caption}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Arrow indicator between */}
          <div className="hidden md:flex justify-center -mt-[11.5rem] mb-[8rem] relative z-10 pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center border border-stone-200">
              <ArrowLeftRight className="w-5 h-5 text-stone-600" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
