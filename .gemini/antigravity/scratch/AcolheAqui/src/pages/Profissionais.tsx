import ProHeader from "@/components/pro/ProHeader";
import ProHeroSection from "@/components/pro/ProHeroSection";
import HowItWorksSection from "@/components/pro/HowItWorksSection";
import BenefitsSection from "@/components/pro/BenefitsSection";
import FeaturesShowcaseSection from "@/components/pro/FeaturesShowcaseSection";
import PricingSection from "@/components/pro/PricingSection";
import ProFAQSection from "@/components/pro/ProFAQSection";
import ProFooter from "@/components/pro/ProFooter";
import Marquee from "@/components/Marquee";

const Profissionais = () => {
  return (
    <main className="min-h-screen pro-theme">
      <ProHeader />
      <ProHeroSection />
      <FeaturesShowcaseSection />
      <Marquee />
      <HowItWorksSection />
      <BenefitsSection />
      <PricingSection />
      <ProFAQSection />
      <ProFooter />
    </main>
  );
};

export default Profissionais;
