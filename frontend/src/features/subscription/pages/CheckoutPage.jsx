import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BGImg from "../../../assets/BGImg.png";

const PLANS = [
  { id: "basic", name: "Basic", price: 199, label: "HD • 1 Device" },
  { id: "standard", name: "Standard", price: 499, label: "Full HD • 2 Devices", recommended: true },
  { id: "premium", name: "Premium", price: 799, label: "4K HDR • 4 Devices" },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // incoming plan from Subscribe Now or Plans funnel
  const incomingPlan = location?.state?.plan || null;

  const [selectedPlan, setSelectedPlan] = useState(
    incomingPlan?.id || "standard"
  );

  const plan = useMemo(
    () => PLANS.find((p) => p.id === selectedPlan),
    [selectedPlan]
  );

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleConfirm = () => {
    navigate("/payment", {
      state: { plan },
      replace: false,
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundImage: `url(${BGImg})`, backgroundSize: "cover" }}
    >
      <div className="w-full max-w-2xl bg-black/85 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-8 text-white">

        {/* Header */}
        <h1 className="text-2xl font-extrabold text-center">
          Confirm your subscription
        </h1>

        <p className="text-gray-300 text-sm text-center mt-1">
          You can switch plans before completing payment.
        </p>

        {/* 🔹 Inline Plan Switcher */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((p) => {
            const active = p.id === selectedPlan;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlan(p.id)}
                className={`
                  rounded-xl p-4 text-left border transition-all duration-200
                  bg-[#0d0f12]
                  ${active
                    ? "border-blue-400 shadow-[0_0_25px_rgba(96,165,250,0.5)] scale-[1.03]"
                    : "border-white/10 hover:border-white/30"
                  }
                `}
              >
                {p.recommended && (
                  <span className="px-2 py-1 text-[10px] rounded-full bg-blue-600 text-white">
                    Most Popular
                  </span>
                )}

                <h3 className="mt-2 text-lg font-bold">{p.name}</h3>

                <p className="text-sm text-gray-400">{p.label}</p>

                <p className="mt-2 text-xl font-extrabold">
                  ₹{p.price}
                  <span className="text-sm font-normal text-gray-400">
                    {" "}
                    / month
                  </span>
                </p>
              </button>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="font-semibold text-lg">Plan Summary</h3>

          <div className="mt-3 flex justify-between text-gray-300">
            <span>{plan.name}</span>
            <span>₹{plan.price} / month</span>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            Auto-renews monthly • Cancel anytime
          </p>
        </div>

        {/* Continue */}
        <button
          onClick={handleConfirm}
          className="mt-8 w-full py-3 rounded-lg font-semibold
          bg-gradient-to-r from-blue-600 to-blue-500
          hover:from-blue-500 hover:to-blue-400
          transition active:scale-95"
        >
          Continue to Payment
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          You’ll be charged after completing payment.
        </p>
      </div>
    </div>
  );
}
