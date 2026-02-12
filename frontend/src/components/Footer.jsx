import { Phone, Mail, MapPin, Clock, Shield } from "lucide-react";
import { COMPANY } from "../data/mock";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-950 border-t border-stone-800/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="mb-6">
              <span
                className="text-xl font-bold text-white block"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {COMPANY.name}
              </span>
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em]">
                {COMPANY.division}
              </span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed mb-6 max-w-xs">
              Seminole County's trusted partner for large yard fencing projects.
              Premium materials, dedicated service, lasting results.
            </p>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-500/60" />
              <span className="text-stone-500 text-xs">Licensed & Insured • CBC-1234567</span>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-6">
              Contact Us
            </h4>
            <div className="space-y-4">
              <a
                href={`tel:${COMPANY.phone}`}
                className="flex items-center gap-3 text-stone-400 hover:text-amber-300 transition-colors text-sm"
              >
                <Phone className="w-4 h-4 text-amber-500/60 flex-shrink-0" />
                {COMPANY.phone}
              </a>
              <a
                href={`mailto:${COMPANY.email}`}
                className="flex items-center gap-3 text-stone-400 hover:text-amber-300 transition-colors text-sm"
              >
                <Mail className="w-4 h-4 text-amber-500/60 flex-shrink-0" />
                {COMPANY.email}
              </a>
              <div className="flex items-start gap-3 text-stone-400 text-sm">
                <MapPin className="w-4 h-4 text-amber-500/60 flex-shrink-0 mt-0.5" />
                <span>Serving all of Seminole County, FL<br />Lake Mary • Sanford • Oviedo • Longwood • Altamonte Springs</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-6">
              Hours & Availability
            </h4>
            <div className="space-y-3 text-stone-400 text-sm">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-amber-500/60 flex-shrink-0" />
                <div>
                  <div>Mon – Fri: 7:00 AM – 6:00 PM</div>
                  <div>Saturday: 8:00 AM – 2:00 PM</div>
                  <div>Sunday: By appointment only</div>
                </div>
              </div>
              <div className="mt-6 p-4 rounded-lg bg-stone-900/50 border border-stone-800/50">
                <div className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  VIP Clients
                </div>
                <div className="text-stone-400 text-sm">
                  Your project manager is available outside standard hours for updates and urgent matters.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-stone-800/50 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-stone-500 text-xs">
            &copy; {currentYear} {COMPANY.name}. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-stone-500 text-xs">
            <a href="/privacy" className="hover:text-stone-300 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-stone-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
