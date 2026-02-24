import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../services/firebase";
import api from "../../../services/api";
import { routeByAccountStatus } from "../../auth/utils/routeBySession";
import { useAuth } from "../../auth/context/AuthContext";

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: "₹199",
    note: "Essential streaming",
    features: ["Crisp HD clarity", "No interruptions", "Watch without limits"],
  },
  {
    id: "standard",
    name: "Standard",
    price: "₹499",
    note: "High Definition",
    features: [
      "Vivid 1080p detail",
      "Your story, anytime",
      "Originals collection",
    ],
    recommended: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "₹799",
    note: "Ultra Fidelity",
    features: [
      "Ultra 4K fidelity",
      "Cinematic soundscapes",
      "Priority first-access",
    ],
  },
];

const SubscriptionPlansSection = () => {
  const [selected, setSelected] = useState("standard");
  const [loading, setLoading] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef(null);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const start = windowHeight;
      const end = windowHeight * 0.3;
      const p = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
      setProgress(p);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setRazorpayReady(true);
    document.body.appendChild(script);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const reveal = (delayIdx = 0, direction = "up") => {
    // Tightened ramp: starts later, finishes faster for more decisive 'pop'
    const elementProgress = Math.max(
      0,
      Math.min(1, progress * 1.5 - delayIdx * 0.1),
    );
    const translate = {
      up: `translateY(${16 * (1 - elementProgress)}px)`,
      none: "none",
    };

    return {
      opacity: elementProgress,
      transform: `${translate[direction]} scale(${0.99 + 0.01 * elementProgress})`,
      transition:
        "opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)",
    };
  };

  const parseAmount = (val) =>
    Math.round(parseFloat(val.replace(/[^0-9.]/g, "")) * 100);

  const handleContinue = async () => {
    const plan = plans.find((p) => p.id === selected);
    const user = auth.currentUser;

    if (!user) {
      return navigate("/signup", { state: { plan, fromPlan: true } });
    }

    try {
      const token = await user.getIdToken(true);
      const res = await api.get("/auth/session", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const status = res.data?.data?.user?.accountStatus;
      if (status !== "EMAIL_VERIFIED" && status !== "ACCOUNT_READY") {
        return navigate(routeByAccountStatus(status), {
          state: { plan, fromPlan: true },
        });
      }

      if (!razorpayReady || loading) return;

      setLoading(true);
      const amount = parseAmount(plan.price);

      const orderRes = await api.post("/payments/create-order", {
        planId: plan.id,
        amount,
      });

      const { orderId, currency, key } = orderRes.data.data;

      const options = {
        key,
        amount,
        currency,
        order_id: orderId,
        name: "Stream24",
        description: `${plan.name} Subscription`,
        prefill: { email: user.email },
        config: {
          display: {
            blocks: {
              methods: {
                name: "Payment Methods",
                methods: ["upi", "netbanking", "wallet"], // Explicitly omit 'card'
              },
            },
            sequence: ["block.methods"],
            preferences: {
              show_default_blocks: false,
            },
          },
        },
        handler: async (paymentRes) => {
          try {
            await api.post("/payments/confirm", {
              planId: plan.id,
              amount,
              ...paymentRes,
            });

            // ⚡ Industrial Sync: Force refresh user context to pick up ACCOUNT_READY status immediately
            if (refreshUser) {
              await refreshUser();
            }

            navigate("/subscription/confirmation", { replace: true });
          } catch (err) {
            console.error("Payment confirmation failed:", err);
            navigate("/subscription/failed", { replace: true });
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            // Industrial handling for "X" button or ESC key
            // If the user manually closes the modal, take them to the failure page
            // to show troubleshooting and allow a clean retry.
            navigate("/subscription/failed", { replace: true });
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response) => {
        console.error("Razorpay Payment Failure:", response.error);
        setLoading(false);
        navigate("/subscription/failed", { replace: true });
      });

      rzp.open();
    } catch (err) {
      console.error("Payment initiation failed:", err);
      setTimeout(() => {
        setLoading(false);
        navigate("/subscription/failed");
      }, 500);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-black text-white py-20 md:py-24 overflow-hidden"
    >
      <div className="relative max-w-6xl mx-auto px-6 text-center">
        {/* Header Block — Center Aligned */}
        <div className="max-w-2xl mb-12 mx-auto">
          <div
            className="flex items-center justify-center gap-3 mb-6"
            style={reveal(0)}
          >
            <span className="w-6 h-[1px] bg-blue-600" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-blue-500">
              Membership
            </span>
            <span className="w-6 h-[1px] bg-blue-600" />
          </div>

          <h2 className="mb-6" style={{ lineHeight: 1.04 }}>
            <span
              className="block font-light"
              style={{
                fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                letterSpacing: "-0.015em",
                color: "rgba(235,240,255,0.52)",
                ...reveal(1),
              }}
            >
              One subscription.
            </span>
            <span
              className="block font-bold text-white"
              style={{
                fontSize: "clamp(2.5rem, 4.5vw, 4rem)",
                letterSpacing: "-0.04em",
                ...reveal(2),
              }}
            >
              Every moment uninterrupted.
            </span>
          </h2>

          <p
            className="text-white/40 font-light leading-relaxed max-w-xl mx-auto"
            style={{
              fontSize: "clamp(0.95rem, 1.4vw, 1.05rem)",
              ...reveal(3),
            }}
          >
            Choose the plan that fits how you watch. Upgrade or cancel anytime —
            engineered for pure cinematic freedom.
          </p>
        </div>

        {/* Pricing Cards — Compacted Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch transition-transform duration-700 ease-out">
          {plans.map((plan, idx) => {
            const active = plan.id === selected;
            const delayIdx = 4 + idx;

            return (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className={`relative group text-center px-7 py-9 rounded-2xl transition-all duration-500 border tracking-[0.05em]
                  ${
                    active
                      ? "bg-white/[0.04] border-blue-500/60 z-10"
                      : "bg-white/[0.01] border-white/5 hover:border-white/10 opacity-70 hover:opacity-100"
                  }
                `}
                style={reveal(delayIdx)}
              >
                {/* Visual Accent — Refined Technical Tab */}
                {active && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[3px] bg-blue-500 rounded-b-sm shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
                )}

                <div className="flex flex-col h-full">
                  <div className="mb-8">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-white/20 text-[11px] mt-1 uppercase tracking-wider font-medium">
                      {plan.note}
                    </p>
                  </div>

                  <div className="mb-10">
                    <div className="flex items-baseline gap-1 justify-center">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-sm text-white/20 font-light">
                        /mo.
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-4 flex-grow mb-2">
                    {plan.features.map((f, i) => (
                      <li
                        key={i}
                        className="text-[13px] text-white/40 group-hover:text-white/60 transition-colors"
                      >
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Area — Symmetrically Aligned to Cards */}
        <div
          className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5"
          style={reveal(8)}
        >
          <div className="md:col-start-2 flex flex-col items-center gap-6">
            <button
              onClick={handleContinue}
              disabled={loading}
              className="w-full relative font-bold text-white tracking-[0.04em]
             transition-all duration-300
             disabled:opacity-50 disabled:cursor-not-allowed
             hover:-translate-y-[1px] active:translate-y-0"
              style={{
                padding: "0.9rem 2.2rem",
                borderRadius: "0.65rem",
                fontSize: "0.9rem",
                backgroundColor: "#3b82f6",
              }}
            >
              {loading
                ? "Processing…"
                : `Unlock ${plans.find((p) => p.id === selected)?.name}`}
            </button>

            <p className="text-[9px] tracking-[0.3em] uppercase text-white/15">
              Instant access • Secure payment
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionPlansSection;
