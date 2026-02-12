import { Check } from "lucide-react";
import { SERVICES } from "../data/mock";

export const ServicesSection = () => {
  return (
    <section className="py-24 bg-stone-50" id="services">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-amber-700 text-sm font-semibold uppercase tracking-[0.15em] mb-4">
            Our Services
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold text-stone-900 mb-5"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Comprehensive Fencing Solutions
          </h2>
          <p className="text-stone-500 text-lg leading-relaxed">
            From first consultation to final walkthrough, we manage every aspect of your
            fencing project with meticulous attention to detail.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {SERVICES.map((service, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-2xl overflow-hidden border border-stone-200/60 hover:shadow-xl hover:border-stone-200 transition-all duration-400 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-8">
                <h3
                  className="text-xl font-bold text-stone-900 mb-3"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {service.title}
                </h3>
                <p className="text-stone-500 text-[15px] leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-3">
                  {service.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-amber-700" />
                      </div>
                      <span className="text-sm text-stone-600">{feature}</span>
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
