import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { FAQ_ITEMS } from "../data/mock";

export const FAQSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-stone-50" id="faq">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-16 items-start max-w-6xl mx-auto">
          {/* Left Column */}
          <div className="lg:sticky lg:top-32 min-w-0">
            <span className="inline-block text-amber-700 text-sm font-semibold uppercase tracking-[0.15em] mb-4">
              Common Questions
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold text-stone-900 mb-5"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Everything You Need to Know
            </h2>
            <p className="text-stone-500 text-lg leading-relaxed mb-8">
              Have a question we haven't covered? Your dedicated project manager is
              always just a call away.
            </p>
            <div className="flex items-center gap-3 text-stone-600">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
                <span className="text-amber-700 text-lg">?</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-stone-800">Still have questions?</div>
                <div className="text-sm text-stone-500">Call (321) 486-6414 anytime</div>
              </div>
            </div>
          </div>

          {/* Right Column - FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="bg-white rounded-xl border border-stone-200/60 px-6 data-[state=open]:shadow-lg data-[state=open]:border-stone-200 transition-all duration-300"
              >
                <AccordionTrigger
                  className="text-left text-stone-800 font-semibold text-[15px] hover:text-amber-700 py-5 hover:no-underline"
                >
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-stone-500 text-[15px] leading-relaxed pb-5">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
