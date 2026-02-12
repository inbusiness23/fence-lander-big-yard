import { ArrowLeft, Phone } from "lucide-react";
import { Button } from "../components/ui/button";
import { COMPANY } from "../data/mock";

export default function CheckoutCancel() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-8">
          <ArrowLeft className="w-10 h-10 text-stone-400" />
        </div>
        <h1
          className="text-2xl font-bold text-stone-900 mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          No Problem — Take Your Time
        </h1>
        <p className="text-stone-500 text-lg leading-relaxed mb-4">
          Your consultation request has been saved. When you're ready, you can complete your booking
          or give us a call to discuss your project.
        </p>
        <p className="text-stone-400 text-sm mb-8">
          Remember: the $150 consultation fee is credited in full toward your fence installation,
          and we offer a 100% satisfaction guarantee.
        </p>

        <div className="space-y-3">
          <a href="/#consultation">
            <Button className="w-full bg-amber-700 hover:bg-amber-800 text-white py-5 font-semibold rounded-lg">
              Complete Your Booking
            </Button>
          </a>
          <a
            href={`tel:${COMPANY.phone.replace(/[^0-9]/g, "")}`}
            className="md:hidden flex items-center justify-center gap-2 py-3 text-stone-500 text-sm font-medium hover:text-stone-700 transition-colors"
          >
            <Phone className="w-4 h-4" />
            Or call us: {COMPANY.phone}
          </a>
          <div className="hidden md:flex items-center justify-center gap-2 py-3 text-stone-500 text-sm font-medium">
            <Phone className="w-4 h-4" />
            Or call us: {COMPANY.phone}
          </div>
        </div>
      </div>
    </div>
  );
}
