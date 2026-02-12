import { Check } from "lucide-react";
import { FENCE_STYLES } from "../data/mock";

export const ServicesSection = () => {
  return (
    <section className="py-24 bg-stone-50" id="services">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-amber-700 text-sm font-semibold uppercase tracking-[0.15em] mb-4">
            Fence Styles
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold text-stone-900 mb-5"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Six Premium Styles for Central Florida
          </h2>
          <p className="text-stone-500 text-lg leading-relaxed">
            Every material we offer is selected specifically for Central Florida's climate.
            Your project manager will bring samples to your consultation.
          </p>
        </div>

        {/* Fence Styles Grid — 3x2 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FENCE_STYLES.map((style, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-2xl overflow-hidden border border-stone-200/60 hover:shadow-xl hover:border-stone-200 transition-all duration-400 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={style.image}
                  alt={style.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <span className="text-white/90 text-xs font-medium bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                    {style.shortDesc}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3
                  className="text-lg font-bold text-stone-900 mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {style.title}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed mb-5">
                  {style.description}
                </p>

                {/* Features */}
                <ul className="space-y-2.5">
                  {style.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-amber-700" />
                      </div>
                      <span className="text-xs text-stone-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
