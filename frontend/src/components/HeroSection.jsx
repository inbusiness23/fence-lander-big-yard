import { useState } from "react";
import { ArrowRight, Phone, Shield, Clock, Star, ShieldCheck, Send } from "lucide-react";
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
import { HERO, COMPANY, SATISFACTION_GUARANTEE } from "../data/mock";
import { toast } from "sonner";

export const HeroSection = () => {
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState("");
  const [callbackName, setCallbackName] = useState("");
  const [callbackSent, setCallbackSent] = useState(false);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCallbackSubmit = (e) => {
    e.preventDefault();
    if (!callbackPhone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    const callbacks = JSON.parse(localStorage.getItem("callbacks") || "[]");
    callbacks.push({ name: callbackName, phone: callbackPhone, timestamp: new Date().toISOString() });
    localStorage.setItem("callbacks", JSON.stringify(callbacks));
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
                Seminole County's Premier Large Yard Fence Specialists
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

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-5">
              {/* Desktop: opens callback modal | Mobile: click-to-call */}
              <div
                className="hidden md:flex items-center gap-2.5 px-8 py-4 rounded-lg bg-white text-stone-900 font-bold text-base cursor-pointer shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-stone-50 select-none"
                onClick={() => setCallbackOpen(true)}
              >
                <Phone className="w-5 h-5 text-amber-700" />
                {COMPANY.phone}
              </div>
              <a href={`tel:${COMPANY.phone.replace(/[^0-9]/g, "")}`} className="md:hidden">
                <Button className="w-full bg-white text-stone-900 hover:bg-stone-100 px-8 py-6 text-base font-bold rounded-lg shadow-xl">
                  <Phone className="w-5 h-5 mr-2.5 text-amber-700" />
                  Call {COMPANY.phone}
                </Button>
              </a>

              <Button
                onClick={() => scrollTo("consultation")}
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-base font-semibold rounded-lg shadow-xl shadow-amber-600/25 transition-all duration-300 hover:shadow-amber-700/35 hover:-translate-y-0.5 group"
              >
                Book VIP Consultation — $150
                <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </div>

            {/* Fee + Guarantee + Financing */}
            <div className="flex flex-col gap-1.5 mb-10">
              <p className="text-amber-200/70 text-sm">
                $150 consultation fee — credited in full toward your fence project
              </p>
              <p className="text-emerald-300/70 text-sm flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                {SATISFACTION_GUARANTEE.headline} — or your $150 back
              </p>
              <p className="text-stone-400/80 text-sm flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-amber-400/50" />
                Pay-over-time financing available — easy to apply
              </p>
            </div>

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

      {/* Callback Modal */}
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
