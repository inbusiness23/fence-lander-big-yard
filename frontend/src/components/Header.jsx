import { useState, useEffect } from "react";
import { Phone, Menu, X, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { COMPANY } from "../data/mock";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState("");
  const [callbackName, setCallbackName] = useState("");
  const [callbackSent, setCallbackSent] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const handleCallbackSubmit = (e) => {
    e.preventDefault();
    if (!callbackPhone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    try {
      await axios.post(`${API}/callbacks`, { name: callbackName, phone: callbackPhone });
    } catch (err) {
      // Save locally as fallback
      const callbacks = JSON.parse(localStorage.getItem("callbacks") || "[]");
      callbacks.push({ name: callbackName, phone: callbackPhone, timestamp: new Date().toISOString() });
      localStorage.setItem("callbacks", JSON.stringify(callbacks));
    }
    setCallbackSent(true);
    toast.success("We'll call you shortly!");
  };

  const resetCallback = () => {
    setCallbackOpen(false);
    setCallbackSent(false);
    setCallbackPhone("");
    setCallbackName("");
  };

  return (
    <>
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
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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

            {/* Right side — Phone (text on desktop) + Book CTA */}
            <div className="hidden md:flex items-center gap-4">
              {/* Phone: static text on desktop, opens callback modal */}
              <div
                onClick={() => setCallbackOpen(true)}
                className={`flex items-center gap-2 cursor-pointer select-none transition-colors duration-200 ${
                  scrolled ? "text-stone-700" : "text-white/90"
                }`}
              >
                <Phone className={`w-4 h-4 ${scrolled ? "text-amber-700" : "text-amber-400"}`} />
                <span className="text-sm font-semibold tracking-wide">{COMPANY.phone}</span>
              </div>

              <div className="w-px h-6 bg-stone-300/30" />

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
                {/* Mobile: real click-to-call */}
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

      {/* Callback Request Modal (Desktop) */}
      <Dialog open={callbackOpen} onOpenChange={(open) => { if (!open) resetCallback(); else setCallbackOpen(true); }}>
        <DialogContent className="sm:max-w-md">
          {!callbackSent ? (
            <>
              <DialogHeader>
                <DialogTitle
                  className="text-xl font-bold text-stone-900"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  We'll Call You
                </DialogTitle>
                <DialogDescription className="text-stone-500 text-sm">
                  Leave your number and a member of our VIP team will call you back shortly — typically within minutes during business hours.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCallbackSubmit} className="space-y-4 mt-4">
                <div>
                  <Label className="text-stone-700 font-medium text-sm mb-2 block">Your Name</Label>
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={callbackName}
                    onChange={(e) => setCallbackName(e.target.value)}
                    className="border-stone-200 focus:border-amber-500 focus:ring-amber-500/20 rounded-lg h-11"
                  />
                </div>
                <div>
                  <Label className="text-stone-700 font-medium text-sm mb-2 block">
                    Phone Number <span className="text-amber-600">*</span>
                  </Label>
                  <Input
                    type="tel"
                    placeholder="(321) 555-0000"
                    value={callbackPhone}
                    onChange={(e) => setCallbackPhone(e.target.value)}
                    className="border-stone-200 focus:border-amber-500 focus:ring-amber-500/20 rounded-lg h-11"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white py-5 text-sm font-semibold rounded-lg shadow-lg shadow-amber-700/20 transition-all duration-200 group"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Request a Callback
                </Button>
                <p className="text-center text-stone-400 text-xs">
                  We typically return calls within minutes during business hours.
                </p>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                <Phone className="w-7 h-7 text-emerald-600" />
              </div>
              <h3
                className="text-xl font-bold text-stone-900 mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                We'll Call You Shortly
              </h3>
              <p className="text-stone-500 text-sm mb-6">
                A member of our VIP team will reach out to <span className="font-semibold text-stone-700">{callbackPhone}</span> shortly.
              </p>
              <Button
                onClick={resetCallback}
                variant="outline"
                className="border-stone-200 text-stone-600 hover:bg-stone-50"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
