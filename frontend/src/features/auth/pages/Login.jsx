import React, { useState } from "react";
import BGImg from "../../../assets/authBg.png";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "../../../services/firebase";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useEffect } from "react";
import { warmupBackend } from "../../../utils/warmup";

export default function Login() {
  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  useEffect(() => {
    warmupBackend();
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState({
    loading: false,
    msg: "",
    error: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // 1. Pre-fill remembered email
  useEffect(() => {
    const saved = localStorage.getItem("stream24:remembered_email");
    if (saved) {
      setForm((s) => ({ ...s, identifier: saved }));
      setRememberMe(true);
    }
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors({});
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!resetEmail) {
      setResetStatus({
        loading: false,
        msg: "",
        error: "Please enter your email address.",
      });
      return;
    }

    setResetStatus({ loading: true, msg: "", error: "" });

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetStatus({
        loading: false,
        msg: "Password reset link sent! Check your inbox.",
        error: "",
      });
      setTimeout(() => setShowForgotPass(false), 3000);
    } catch (err) {
      console.error("Reset password error:", err);
      setResetStatus({
        loading: false,
        msg: "",
        error:
          err.code === "auth/user-not-found"
            ? "No account found with this email."
            : "Failed to send reset email.",
      });
    }
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setSubmitting(true);
    setErrors({});

    const email = form.identifier.trim();
    if (!email) {
      setErrors({ identifier: "Email address is required." });
      setSubmitting(false);
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setErrors({ identifier: "Enter a valid email address." });
      setSubmitting(false);
      return;
    }

    const password = form.password;
    if (!password) {
      setErrors({ password: "Password is required." });
      setSubmitting(false);
      return;
    }

    try {
      // 2. Set Persistence based on Remember Me
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence,
      );

      const cred = await signInWithEmailAndPassword(auth, email, form.password);

      // 3. Save/Clear remembered email
      if (rememberMe) {
        localStorage.setItem(
          "stream24:remembered_email",
          form.identifier.trim(),
        );
      } else {
        localStorage.removeItem("stream24:remembered_email");
      }

      await cred.user.reload();
      const token = await cred.user.getIdToken();

      const api = (await import("../../../services/api")).default;

      const res = await api.get("/auth/session", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const accountStatus = res.data?.data?.user?.accountStatus;

      let destination = "/";
      switch (accountStatus) {
        case "SIGNED_UP":
          destination = "/verify-email";
          break;
        case "EMAIL_VERIFIED":
          destination = "/plans";
          break;
        case "ACCOUNT_READY":
          destination = "/movies";
          break;
        default:
          destination = "/";
      }

      navigate(destination, { replace: true });
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ Login error:", err);
        if (err.message === "Network Error") {
          console.error(
            "🌐 API Network Error: Check if server is reachable and firewall allows port 5051",
          );
        }
      }

      setErrors({
        general:
          err?.code === "auth/invalid-credential"
            ? "Invalid email or password."
            : err?.code === "auth/unauthorized-domain"
              ? "This domain is not authorized in Firebase Console (add your local IP)."
              : `Login failed: ${err?.code || err.message}. check network connectivity.`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 relative"
      style={{ backgroundImage: `url(${BGImg})` }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      <div className="w-full max-w-md bg-black/85 backdrop-blur-sm rounded-xl p-8 shadow-2xl text-white relative z-10 border border-white/10">
        {showForgotPass ? (
          /* RESET PASSWORD VIEW */
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
            <p className="text-gray-400 mb-6 text-sm">
              Enter your email address and we’ll send you a reset link.
            </p>

            {resetStatus.msg && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded text-green-200 text-sm">
                {resetStatus.msg}
              </div>
            )}

            {resetStatus.error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
                {resetStatus.error}
              </div>
            )}

            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Email address"
                autoFocus
                className="w-full mb-4 px-4 py-3 bg-[#16181a] border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />

              <button
                type="submit"
                disabled={resetStatus.loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetStatus.loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <button
              onClick={() => setShowForgotPass(false)}
              className="mt-4 w-full text-sm text-gray-400 hover:text-white transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          /* LOGIN VIEW */
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            {/* Brand anchor */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-1">
                <div className="h-[1px] w-8 bg-blue-500" />
                <p className="text-sm text-blue-100/90 font-medium tracking-wide">
                  Welcome back
                </p>
                <div className="h-[1px] w-8 bg-blue-500" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Sign in to Stream24
              </h1>
            </div>

            {errors.general && (
              <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
                {errors.general}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="flex flex-col gap-1">
                <input
                  name="identifier"
                  value={form.identifier}
                  onChange={onChange}
                  placeholder="Email address"
                  className={`w-full px-4 py-3.5 bg-[#16181a] border rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-500 ${
                    errors.identifier ? "border-red-500" : "border-white/10"
                  }`}
                />
                {errors.identifier && (
                  <span className="text-red-500 text-xs ml-1">
                    {errors.identifier}
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={onChange}
                  placeholder="Password"
                  className="w-full px-4 py-3.5 bg-[#16181a] border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              {errors.password && (
                <span className="text-red-500 text-xs ml-1">
                  {errors.password}
                </span>
              )}

              <div className="flex items-center justify-between text-sm text-gray-400 my-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-[#16181a] bg-blue-600 focus:ring-blue-500 focus:ring-offset-black"
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(form.identifier);
                    setShowForgotPass(true);
                  }}
                  className="hover:text-white hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-2 text-center text-sm text-gray-400">
              <span className="opacity-70">New to Stream24?</span>{" "}
              <Link
                to="/signup"
                className="text-white hover:underline font-medium ml-1"
              >
                Sign up now
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
