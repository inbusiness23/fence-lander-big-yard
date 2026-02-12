import { Header } from "../components/Header";
import { HeroSection } from "../components/HeroSection";
import { FeaturedIn } from "../components/FeaturedIn";
import { YardSizeSelector } from "../components/YardSizeSelector";
import { WhyChooseUs } from "../components/WhyChooseUs";
import { ServicesSection } from "../components/ServicesSection";
import { BeforeAfterSection } from "../components/BeforeAfterSection";
import { HowItWorks } from "../components/HowItWorks";
import { TestimonialsSection } from "../components/TestimonialsSection";
import { FAQSection } from "../components/FAQSection";
import { CTASection } from "../components/CTASection";
import { Footer } from "../components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <HeroSection />
      <FeaturedIn />
      <YardSizeSelector />
      <WhyChooseUs />
      <ServicesSection />
      <BeforeAfterSection />
      <HowItWorks />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
