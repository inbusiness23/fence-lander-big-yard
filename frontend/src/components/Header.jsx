import { useState, useEffect } from "react";
import { Phone, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { COMPANY } from "../data/mock";

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-200/60"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span
                className={`text-lg font-bold tracking-tight transition-colors duration-300 ${
                  scrolled ? "text-stone-900" : "text-white"
                }`}
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {COMPANY.name}
              </span>
              <span
                className={`text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 ${
                  scrolled ? "text-amber-700" : "text-amber-300"
                }`}
              >
                {COMPANY.division}
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {["Why Us", "Services", "Process", "Testimonials", "FAQ"].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase().replace(" ", "-"))}
                className={`text-sm font-medium transition-colors duration-200 hover:opacity-80 ${
                  scrolled ? "text-stone-600 hover:text-stone-900" : "text-white/80 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Right CTAs - Phone + Book */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={`tel:${COMPANY.phone.replace(/[^0-9]/g, "")}`}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                scrolled
                  ? "bg-stone-900 text-white hover:bg-stone-800 shadow-lg shadow-stone-900/15"
                  : "bg-white/15 backdrop-blur-sm text-white border border-white/20 hover:bg-white/25"
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Call {COMPANY.phone}</span>
            </a>
            <Button
              onClick={() => scrollTo("consultation")}
              className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 text-sm font-semibold rounded-lg shadow-lg shadow-amber-600/20 transition-all duration-200 hover:shadow-amber-700/30"
            >
              Book VIP Consultation
            </Button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              scrolled ? "text-stone-700" : "text-white"
            }`}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 shadow-xl">
          <div className="px-6 py-6 space-y-4">
            {["Why Us", "Services", "Process", "Testimonials", "FAQ"].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase().replace(" ", "-"))}
                className="block text-stone-700 font-medium text-base hover:text-amber-700 transition-colors"
              >
                {item}
              </button>
            ))}
            <div className="pt-4 border-t border-stone-100 space-y-3">
              <a
                href={`tel:${COMPANY.phone.replace(/[^0-9]/g, "")}`}
                className="flex items-center justify-center gap-2 bg-stone-900 text-white font-semibold py-3 rounded-lg w-full"
              >
                <Phone className="w-4 h-4" />
                Call {COMPANY.phone}
              </a>
              <Button
                onClick={() => scrollTo("consultation")}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg"
              >
                Book VIP Consultation
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
