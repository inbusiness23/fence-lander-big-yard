import { CalendarCheck, MessageSquare, Wrench, CheckCircle2 } from "lucide-react";
import { PROCESS_STEPS } from "../data/mock";

const iconMap = {
  CalendarCheck,
  MessageSquare,
  Wrench,
  CheckCircle2,
};

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-white" id="process">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-amber-700 text-sm font-semibold uppercase tracking-[0.15em] mb-4">
            Your Journey
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold text-stone-900 mb-5"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Four Steps to Your Perfect Fence
          </h2>
          <p className="text-stone-500 text-lg leading-relaxed">
            We've streamlined the process so you can focus on what matters.
            Your dedicated project manager handles the rest.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {PROCESS_STEPS.map((step, idx) => {
            const IconComponent = iconMap[step.icon];
            return (
              <div key={idx} className="relative">
                {/* Connector Line */}
                {idx < PROCESS_STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[calc(50%+36px)] right-[-calc(50%-36px)] w-[calc(100%-72px)] h-[2px] bg-gradient-to-r from-amber-200 to-amber-100" />
                )}

                <div className="text-center group">
                  {/* Icon Container */}
                  <div className="relative inline-flex items-center justify-center mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center group-hover:bg-amber-100 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-amber-100/50">
                      {IconComponent && (
                        <IconComponent className="w-8 h-8 text-amber-700" />
                      )}
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-stone-900 text-white text-xs font-bold flex items-center justify-center">
                      {step.step}
                    </div>
                  </div>

                  <h3
                    className="text-lg font-bold text-stone-900 mb-3"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm text-stone-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
