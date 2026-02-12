import { Shield, Clock, UserCheck, Award } from "lucide-react";
import { VALUE_PROPS } from "../data/mock";

const iconMap = {
  Shield,
  Clock,
  UserCheck,
  Award,
};

export const WhyChooseUs = () => {
  return (
    <section className="py-24 bg-white" id="why-us">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-amber-700 text-sm font-semibold uppercase tracking-[0.15em] mb-4">
            The VIP Difference
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold text-stone-900 mb-5"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Built Around Your Time & Your Standards
          </h2>
          <p className="text-stone-500 text-lg leading-relaxed">
            Other companies scale by cutting corners. We scale by dedicating more resources
            to fewer clients — so every project gets the attention it deserves.
          </p>
        </div>

        {/* Value Props Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {VALUE_PROPS.map((prop, idx) => {
            const IconComponent = iconMap[prop.icon];
            return (
              <div
                key={idx}
                className="group flex gap-6 p-8 rounded-2xl bg-stone-50/70 border border-stone-100 hover:bg-white hover:shadow-lg hover:border-stone-200/80 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center group-hover:bg-amber-100 transition-colors duration-300">
                    {IconComponent && (
                      <IconComponent className="w-6 h-6 text-amber-700" />
                    )}
                  </div>
                </div>
                <div>
                  <h3
                    className="text-lg font-bold text-stone-900 mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {prop.title}
                  </h3>
                  <p className="text-stone-500 leading-relaxed text-[15px]">
                    {prop.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Bar */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-stone-400">
          {[
            "500+ Large Yard Projects",
            "15+ Years in Seminole County",
            "Avg. 4.9★ Rating",
            "Same-Day Consultations",
          ].map((stat) => (
            <div key={stat} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-sm font-medium tracking-wide">{stat}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
