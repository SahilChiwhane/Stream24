import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SubscriptionFailed = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Industrial redirect back to plans after 5 seconds
    const timer = setTimeout(() => {
      navigate("/plans", { replace: true });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <section className="relative min-h-screen bg-black text-white flex items-center justify-center px-6 py-24 overflow-hidden font-sans tracking-tight">
      <div
        className={`relative w-full max-w-2xl bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-10 md:p-14 shadow-2xl
        transition-all duration-700 ease-out
        ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        {/* ERROR ICON - REFINED */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        {/* TITLE */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Payment <span className="text-red-500">Failed.</span>
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-md mx-auto leading-relaxed">
            We couldn't process your transaction. No charges were made to your
            account.
          </p>
        </div>

        {/* GUIDANCE CARD - INDUSTRIAL STYLE */}
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 mb-10">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] flex-shrink-0" />
              <p className="text-sm text-gray-400 font-medium leading-relaxed">
                Check your internet connection and verify your payment details.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] flex-shrink-0" />
              <p className="text-sm text-gray-400 font-medium leading-relaxed">
                Ensure your card has sufficient funds or try an alternative
                payment method.
              </p>
            </div>
          </div>
        </div>

        {/* CTA - SOLID GREY/WHITE, NO GLOW */}
        <div className="space-y-6">
          <button
            onClick={() => navigate("/plans", { replace: true })}
            className="w-full py-4 rounded-2xl font-black text-white bg-white/10 hover:bg-white/15 active:scale-[0.98] transition-all duration-300 uppercase tracking-[0.15em] text-[11px] border border-white/5"
          >
            Retry Payment
          </button>

          <p className="text-center text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            Redirecting to plans in 5 seconds...
          </p>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionFailed;
