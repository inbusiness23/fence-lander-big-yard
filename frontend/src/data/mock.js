import { Shield, Clock, UserCheck, Ruler, Phone, Mail, MapPin, Star, ChevronRight, Fence, TreePine, Home, Award, Sparkles, CalendarCheck, Wrench, MessageSquare, CheckCircle2 } from "lucide-react";

export const COMPANY = {
  name: "ASAP Fence & Gates",
  division: "Large Yard Division",
  phone: "(407) 555-0182",
  email: "vip@asapfencegates.com",
  address: "Seminole County, Florida",
  tagline: "Premium Fencing for Exceptional Properties",
};

export const HERO = {
  headline: "Your Large Yard Deserves\nMore Than a Contractor.",
  subheadline: "It Deserves a Partner.",
  description: "ASAP Fence & Gates' Large Yard Division exists for one reason — to give Seminole County homeowners with significant properties the dedicated attention, premium craftsmanship, and white-glove service their investment demands.",
  ctaPrimary: "Schedule Your VIP Consultation",
  ctaSecondary: "Call Us Directly",
  image: "https://images.unsplash.com/photo-1694885143361-0214e13387f5?w=1200&auto=format&fit=crop&q=80",
};

export const YARD_SIZES = [
  {
    id: "standard",
    label: "Standard Yard",
    size: "Under ¼ Acre",
    budget: "Under $5,000",
    description: "Great for typical residential lots",
    recommended: false,
    message: "Our standard division can help — call (407) 555-0180",
  },
  {
    id: "large",
    label: "Large Yard",
    size: "¼ – ¾ Acre",
    budget: "$7,500 – $15,000",
    description: "Perfect for spacious Seminole County properties",
    recommended: true,
    message: "You're in the right place. Let's get started.",
  },
  {
    id: "estate",
    label: "Estate Property",
    size: "¾ Acre+",
    budget: "$15,000+",
    description: "Custom solutions for estate-level properties",
    recommended: true,
    message: "Our VIP team specializes in projects like yours.",
  },
];

export const VALUE_PROPS = [
  {
    icon: "UserCheck",
    title: "Dedicated Project Manager",
    description: "One point of contact from estimate to final walkthrough. No runaround, no phone trees — just someone who knows your project inside and out.",
  },
  {
    icon: "Clock",
    title: "We Respect Your Time",
    description: "Guaranteed same-week estimates, on-time crews, and proactive updates so you're never left wondering what's happening with your project.",
  },
  {
    icon: "Shield",
    title: "Premium Materials Only",
    description: "We source commercial-grade materials that withstand Florida's sun, storms, and humidity. Every fence we build is engineered to last decades.",
  },
  {
    icon: "Award",
    title: "Licensed & Insured",
    description: "Fully licensed in Seminole County with comprehensive insurance. Your property and investment are protected at every stage.",
  },
];

export const SERVICES = [
  {
    title: "New Fence Installation",
    description: "From property survey to final inspection, we handle every detail of your new fence installation with precision and care.",
    image: "https://images.unsplash.com/photo-1722293742416-4380f2987a61?w=600&auto=format&fit=crop&q=80",
    features: ["Custom design consultation", "Professional property survey", "Permit handling", "Expert installation", "Final walkthrough"],
  },
  {
    title: "Fence Replacement",
    description: "Upgrade your existing fence with modern materials and superior craftsmanship. We remove the old and install the new seamlessly.",
    image: "https://images.unsplash.com/photo-1702083560652-223096493bc4?w=600&auto=format&fit=crop&q=80",
    features: ["Full removal & disposal", "Foundation assessment", "Material upgrade options", "Code-compliant installation", "Cleanup guarantee"],
  },
  {
    title: "Premium Materials",
    description: "Choose from our curated selection of commercial-grade fencing materials built to withstand Florida's demanding climate.",
    image: "https://images.unsplash.com/photo-1619322704995-5215d5f47a75?w=600&auto=format&fit=crop&q=80",
    features: ["Cedar & pressure-treated wood", "Vinyl privacy fencing", "Ornamental aluminum", "Custom gates & hardware", "Hurricane-rated options"],
  },
];

export const PROCESS_STEPS = [
  {
    step: 1,
    title: "Schedule Your Consultation",
    description: "Book a time that works for you. We come to your property, assess your needs, and discuss your vision — all within the same week.",
    icon: "CalendarCheck",
  },
  {
    step: 2,
    title: "Receive Your Custom Proposal",
    description: "Within 48 hours, your dedicated project manager delivers a detailed proposal with material options, timeline, and transparent pricing.",
    icon: "MessageSquare",
  },
  {
    step: 3,
    title: "Professional Installation",
    description: "Our experienced crews arrive on schedule with premium materials. Your project manager keeps you updated every step of the way.",
    icon: "Wrench",
  },
  {
    step: 4,
    title: "Final Walkthrough & Warranty",
    description: "We walk every foot of your new fence together. You don't pay the final balance until you're completely satisfied.",
    icon: "CheckCircle2",
  },
];

export const TESTIMONIALS = [
  {
    name: "Robert & Linda M.",
    location: "Lake Mary, FL",
    rating: 5,
    text: "We have over half an acre and every other company made us feel like just another number. ASAP's Large Yard Division treated us like their only client. The fence is stunning and was done two days ahead of schedule.",
    project: "¾ Acre Cedar Privacy Fence",
  },
  {
    name: "David K.",
    location: "Sanford, FL",
    rating: 5,
    text: "Having a dedicated project manager made all the difference. I'm busy — I don't have time to chase down contractors. Marcus kept me informed the entire time. Best $12,000 I've spent on this house.",
    project: "Full Property Vinyl Replacement",
  },
  {
    name: "Jennifer & Tom S.",
    location: "Oviedo, FL",
    rating: 5,
    text: "The team surveyed our entire acre lot, handled all the permits, and installed a beautiful aluminum fence with custom gates. Professional from start to finish. This is how contracting should work.",
    project: "1 Acre Ornamental Aluminum",
  },
];

export const FAQ_ITEMS = [
  {
    question: "What makes the Large Yard Division different from your standard service?",
    answer: "Our Large Yard Division is a dedicated team that exclusively handles properties ¼ acre and above. You get a personal project manager, priority scheduling, commercial-grade materials, and the focused attention that larger projects demand. We limit our active projects so your fence gets the care it deserves.",
  },
  {
    question: "How quickly can you start my project?",
    answer: "We offer same-week consultations and typically begin installation within 2-3 weeks of proposal approval. For urgent projects, ask about our priority scheduling — we'll do everything we can to accommodate your timeline.",
  },
  {
    question: "Do you handle permits in Seminole County?",
    answer: "Absolutely. We handle 100% of the permitting process with Seminole County. Our team knows the local codes inside and out, so there are no surprises or delays. It's one less thing you have to think about.",
  },
  {
    question: "What's included in the consultation?",
    answer: "Your consultation includes a thorough property assessment, measurement of your fence line, discussion of material options and styles, and a review of any HOA requirements. We bring samples so you can see and feel the materials. There's zero obligation and zero pressure.",
  },
  {
    question: "What kind of warranty do you offer?",
    answer: "Every Large Yard Division project includes our comprehensive warranty: lifetime warranty on vinyl, 10-year warranty on wood craftsmanship, and 20-year warranty on aluminum. We also offer a 1-year workmanship guarantee on all labor.",
  },
  {
    question: "Can you work with my HOA requirements?",
    answer: "Yes — we work with HOAs throughout Seminole County daily. We'll review your community's guidelines before designing your fence to ensure full compliance, and we can provide architectural drawings if your HOA requires them for approval.",
  },
];

export const CONSULTATION_FORM_FIELDS = [
  { name: "fullName", label: "Full Name", type: "text", placeholder: "Your full name", required: true },
  { name: "email", label: "Email", type: "email", placeholder: "your@email.com", required: true },
  { name: "phone", label: "Phone", type: "tel", placeholder: "(407) 555-0000", required: true },
  { name: "address", label: "Property Address", type: "text", placeholder: "Your property address in Seminole County", required: true },
  { name: "yardSize", label: "Estimated Yard Size", type: "select", options: ["¼ – ½ Acre", "½ – ¾ Acre", "¾ – 1 Acre", "1+ Acre"], required: true },
  { name: "projectType", label: "Project Type", type: "select", options: ["New Fence Installation", "Fence Replacement", "Both — Replace & Extend"], required: true },
  { name: "timeline", label: "Preferred Timeline", type: "select", options: ["As soon as possible", "Within 1 month", "Within 2-3 months", "Just exploring options"], required: false },
  { name: "message", label: "Tell Us About Your Project", type: "textarea", placeholder: "Any details about your property, preferences, or questions...", required: false },
];
