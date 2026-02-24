import React, { useEffect } from "react";
import SubscriptionPlansSection from "../../landing/components/SubscriptionPlansSection";

export default function Plans() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full overflow-hidden">
      <SubscriptionPlansSection />
    </div>
  );
}
