import React, { useEffect } from "react";
import HomeNav from "../components/HomeNav";
import HeroSection from "../components/HeroSection";
import DeviceSupportSection from "../components/DeviceSupportSection";
import StreamingBenefitsSection from "../components/StreamingBenefitsSection";
import SubscriptionPlansSection from "../components/SubscriptionPlansSection";
import FAQSection from "../components/FAQSection";

const LandingPage = () => {
  useEffect(() => {
    document.body.style.overflowX = "hidden";
  }, []);

  return (
    <div className="bg-black text-white w-full overflow-hidden">
      <HomeNav />
      <HeroSection />
      <DeviceSupportSection />
      <StreamingBenefitsSection />
      <SubscriptionPlansSection />
      <FAQSection />
    </div>
  );
};

export default LandingPage;
