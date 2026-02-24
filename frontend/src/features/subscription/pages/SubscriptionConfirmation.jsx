import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

const SubscriptionConfirmation = () => {
  const navigate = useNavigate();

  const [mounted, setMounted] = useState(false);
  const [subscription, setSubscription] = useState(null);

  // Load subscription from backend (Netflix-style)
  useEffect(() => {
    let alive = true;

    const load = async (retryCount = 0) => {
      try {
        const res = await api.get("/auth/session");

        if (!alive) return;

        const sub = res.data?.data?.subscription;

        // 🛡️ Industrial Resilience: If not active yet, retry up to 3 times with a small delay
        if ((!sub || sub.status !== "active") && retryCount < 3) {
          setTimeout(() => load(retryCount + 1), 1000);
          return;
        }

        if (!sub || sub.status !== "active") {
          navigate("/plans", { replace: true });
          return;
        }

        setSubscription(sub);
        setMounted(true);

        // Auto redirect to movies page
        setTimeout(() => {
          if (alive) navigate("/movies", { replace: true });
        }, 5000);
      } catch (err) {
        if (retryCount < 3) {
          setTimeout(() => load(retryCount + 1), 1000);
        } else {
          navigate("/login", { replace: true });
        }
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [navigate]);

  // Date helpers
  const startDate = new Date();
  const renewalDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd)
    : new Date();

  const formatDate = (d) =>
    d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <section className="relative min-h-screen bg-black text-white flex items-center justify-center px-6 py-24 overflow-hidden font-sans tracking-tight">
      <div
        className={`relative w-full max-w-2xl bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-10 md:p-14 shadow-2xl
        transition-all duration-700 ease-out
        ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        {/* SUCCESS ICON - REFINED */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* TITLE */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Membership <span className="text-blue-500">Activated.</span>
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-md mx-auto leading-relaxed">
            Your Stream24 journey starts now. No ads. No interruptions.
          </p>
        </div>

        {/* DETAILS CARD - INDUSTRIAL STYLE */}
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 mb-10">
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/5">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                Current Plan
              </p>
              <p className="text-2xl font-black text-white capitalize">
                {subscription?.planId}
              </p>
            </div>
            <div className="px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/5 text-blue-500 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              Active
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                Start Date
              </p>
              <p className="text-sm font-bold text-gray-300">
                {formatDate(startDate)}
              </p>
            </div>
            <div className="space-y-1.5 text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                Next Billing
              </p>
              <p className="text-sm font-bold text-gray-300">
                {formatDate(renewalDate)}
              </p>
            </div>
          </div>
        </div>

        {/* CTA - SOLID BLUE, NO GLOW */}
        <div className="space-y-6">
          <button
            onClick={() => navigate("/movies", { replace: true })}
            className="w-full py-4 rounded-2xl font-black text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all duration-300 uppercase tracking-[0.15em] text-[11px]"
          >
            Start Streaming
          </button>

          <p className="text-center text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            Redirecting to catalog in 5 seconds...
          </p>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionConfirmation;
