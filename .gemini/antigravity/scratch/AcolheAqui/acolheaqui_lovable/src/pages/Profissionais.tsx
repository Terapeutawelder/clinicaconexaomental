import { lazy, Suspense, memo } from "react";
import ProHeader from "@/components/pro/ProHeader";
import ProHeroSection from "@/components/pro/ProHeroSection";

// Lazy load heavy sections
const FeaturesShowcaseSection = lazy(() => import("@/components/pro/FeaturesShowcaseSection"));
const Marquee = lazy(() => import("@/components/Marquee"));
const HowItWorksSection = lazy(() => import("@/components/pro/HowItWorksSection"));
const BenefitsSection = lazy(() => import("@/components/pro/BenefitsSection"));
const ProTestimonialsSection = lazy(() => import("@/components/pro/ProTestimonialsSection"));
const PricingSection = lazy(() => import("@/components/pro/PricingSection"));
const ProFAQSection = lazy(() => import("@/components/pro/ProFAQSection"));
const ProFooter = lazy(() => import("@/components/pro/ProFooter"));

const SectionLoader = memo(() => (
  <div className="py-16 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
));

SectionLoader.displayName = "SectionLoader";

const Profissionais = () => {
  return (
    <main className="min-h-screen pro-theme">
      <ProHeader />
      <ProHeroSection />
      <Suspense fallback={<SectionLoader />}>
        <FeaturesShowcaseSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <Marquee />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <HowItWorksSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <BenefitsSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <ProTestimonialsSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <PricingSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <ProFAQSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <ProFooter />
      </Suspense>
    </main>
  );
};

export default Profissionais;
