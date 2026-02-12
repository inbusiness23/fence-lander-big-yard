import { ArrowRight, Phone, Shield, Clock, Star } from "lucide-react";
import { Button } from "./ui/button";
import { HERO, COMPANY } from "../data/mock";

export const HeroSection = () => {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={HERO.image}
          alt="Central Florida large yard with premium fencing"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-900/75 to-stone-900/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-700/20 border border-amber-500/30 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-amber-200 text-sm font-medium tracking-wide">
              Seminole County's Premier Large Yard Specialists
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {HERO.headline.split("\n").map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h1>

          <p
            className="text-2xl sm:text-3xl text-amber-300 font-semibold mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {HERO.subheadline}
          </p>

          <p className="text-lg text-stone-300 leading-relaxed mb-10 max-w-xl">
            {HERO.description}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Button
              onClick={() => scrollTo("consultation")}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-base font-semibold rounded-lg shadow-xl shadow-amber-600/25 transition-all duration-300 hover:shadow-amber-700/35 hover:-translate-y-0.5 group"
            >
              {HERO.ctaPrimary}
              <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
            <a href={`tel:${COMPANY.phone}`}>
              <Button
                variant="outline"
                className="border-white/25 text-white hover:bg-white/10 hover:text-white px-8 py-6 text-base font-medium rounded-lg backdrop-blur-sm transition-all duration-300 w-full sm:w-auto"
              >
                <Phone className="w-5 h-5 mr-2" />
                {HERO.ctaSecondary}
              </Button>
            </a>
          </div>

          {/* Fee Note */}
          <p className="text-amber-200/70 text-sm mb-4">
            $150 consultation fee — credited in full toward your fence project
          </p>

          {/* Financing Note */}
          <p className="text-stone-400/80 text-sm mb-10 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-amber-400/50" />
            Pay-over-time financing available — easy to apply
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-6 items-center">
            {[
              { icon: Shield, text: "Licensed & Insured" },
              { icon: Clock, text: "Same-Day Consultations" },
              { icon: Star, text: "5-Star Rated" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-stone-400">
                <Icon className="w-4 h-4 text-amber-400/70" />
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-50 to-transparent" />
    </section>
  );
};
