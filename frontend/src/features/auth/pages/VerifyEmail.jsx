import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { sendEmailVerification } from "firebase/auth";
import BGImg from "../../../assets/BGImgg.png";
import { auth } from "../../../services/firebase";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const email =
    location?.state?.email || auth.currentUser?.email || "your email address";

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!auth.currentUser) return;

      await auth.currentUser.reload();

      if (auth.currentUser.emailVerified) {
        navigate("/plans", { replace: true });
      }
    };

    check();
  }, [navigate]);

  const resendVerification = async () => {
    if (!auth.currentUser) {
      setError("Please login to resend verification email.");
      return;
    }

    try {
      setResending(true);
      setError("");
      setMessage("");

      await sendEmailVerification(auth.currentUser);
      setMessage("Verification email resent. Check your inbox.");
    } catch {
      setError("Could not resend email. Please try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 relative"
      style={{ backgroundImage: `url(${BGImg})` }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      <div className="w-full max-w-md bg-black/85 backdrop-blur-sm rounded-xl p-8 shadow-2xl text-white text-center relative z-10 border border-white/10">
        <h1 className="text-2xl font-bold mb-2">Verify your email</h1>

        <p className="text-gray-300 text-sm">
          We’ve sent a verification link to
          <br />
          <span className="font-semibold text-white">{email}</span>
        </p>

        <p className="mt-4 text-blue-300 text-sm">
          Please open your inbox and click the verification link.
        </p>

        {message && <p className="mt-3 text-green-400">{message}</p>}
        {error && <p className="mt-3 text-red-400">{error}</p>}

        <div className="mt-6 space-y-3">
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-lg transition-colors active:scale-95"
          >
            Go to Login
          </button>

          <button
            onClick={resendVerification}
            disabled={resending}
            className="w-full py-2 text-sm text-gray-300 underline disabled:opacity-60"
          >
            {resending ? "Resending…" : "Resend verification email"}
          </button>
        </div>
      </div>
    </div>
  );
}
