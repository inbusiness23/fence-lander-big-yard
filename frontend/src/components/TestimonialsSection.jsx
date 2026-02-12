import { Star, Quote } from "lucide-react";
import { TESTIMONIALS } from "../data/mock";

export const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-stone-900" id="testimonials">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-amber-400 text-sm font-semibold uppercase tracking-[0.15em] mb-4">
            Client Stories
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-5"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Trusted by Seminole County's Finest Properties
          </h2>
          <p className="text-stone-400 text-lg leading-relaxed">
            Don't take our word for it. Here's what homeowners with large properties
            have to say about working with our VIP team.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, idx) => (
            <div
              key={idx}
              className="relative bg-stone-800/50 backdrop-blur-sm rounded-2xl p-8 border border-stone-700/50 hover:border-stone-600/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20"
            >
              {/* Quote Icon */}
              <Quote className="w-10 h-10 text-amber-500/20 mb-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-stone-300 leading-relaxed mb-6 text-[15px]">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="border-t border-stone-700/50 pt-5">
                <div className="font-semibold text-white text-sm">
                  {testimonial.name}
                </div>
                <div className="text-stone-500 text-sm">
                  {testimonial.location}
                </div>
                <div className="mt-2 inline-flex items-center bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
                  <span className="text-amber-400 text-xs font-medium">
                    {testimonial.project}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
