import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import api from "../../../services/api";

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, initialized } = useAuth();
  const plan = location?.state?.plan || null;

  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);

  const parseAmount = (val) => {
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9.]/g, "");
    const rupees = parseFloat(cleaned || "0");
    return Math.round(rupees * 100);
  };

  const amountPaise = parseAmount(plan?.amount ?? plan?.price);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setRazorpayReady(true);
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isConfirming) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-6"></div>
        <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
        <p className="text-gray-400">
          We're confirming your subscription with the server. Please don't close
          this window.
        </p>
      </div>
    );
  }

  if (!plan || !user) {
    return (
      <div className="text-white p-6 text-center">
        Invalid session — restart checkout.
      </div>
    );
  }

  const handleTestPayment = async () => {
    if (!razorpayReady || isProcessing) return;

    if (!plan?.id || amountPaise <= 0) {
      alert("Invalid plan data. Please restart checkout.");
      navigate("/plans", { replace: true });
      return;
    }

    setIsProcessing(true);

    try {
      const orderRes = await api.post("/payments/create-order", {
        planId: plan.id,
        amount: amountPaise,
      });

      const { orderId, amount, currency, key } = orderRes.data.data;

      const rzp = new window.Razorpay({
        key,
        amount,
        currency,
        order_id: orderId,
        name: "Stream24",
        description: `${plan.name} Subscription`,
        config: {
          display: {
            hide: [{ method: "card" }],
          },
        },
        prefill: {
          email: user.email,
          name: user.name || "User",
        },
        handler: async (res) => {
          setIsConfirming(true);
          try {
            await api.post("/payments/confirm", {
              planId: plan.id,
              amount: amountPaise,
              razorpay_order_id: res.razorpay_order_id,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_signature: res.razorpay_signature,
            });

            sessionStorage.setItem("payment_success", "true");
            navigate("/subscription/confirmation", { replace: true });
          } catch (err) {
            console.error("Payment confirmation failed:", err);
            alert(
              "Verification failed. Please contact support if amount was debited.",
            );
            setIsConfirming(false);
          }
        },
      });

      rzp.on("payment.failed", (err) => {
        setIsProcessing(false);
        console.error("Payment Failed:", err);
      });

      rzp.open();
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Payment initialization failed";
      alert(msg);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-3 text-center">Confirm & Pay</h2>
        <p className="text-gray-400 text-center mb-6">{plan.name}</p>

        <button
          onClick={handleTestPayment}
          disabled={isProcessing}
          className="w-full py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isProcessing && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {isProcessing ? "Processing..." : "Pay with Razorpay (Test Mode)"}
        </button>

        <div className="mt-4 text-center text-gray-400 text-sm">OR</div>

        <button
          disabled
          className="w-full mt-3 py-3 rounded-xl border border-white/20 opacity-40"
        >
          Grant Subscription (Disabled in Secure Mode)
        </button>
      </div>
    </div>
  );
}
