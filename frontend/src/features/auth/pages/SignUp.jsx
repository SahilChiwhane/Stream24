import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut,
} from "firebase/auth";

import BGImg from "../../../assets/authBg.png";
import { auth } from "../../../services/firebase";
import api from "../../../services/api";
import { FiEye, FiEyeOff } from "react-icons/fi";

import { warmupBackend } from "../../../utils/warmup";

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  day: "",
  month: "",
  year: "",
  password: "",
  confirmPassword: "",
};

export default function SignUp() {
  const location = useLocation();
  const navigate = useNavigate();

  const preselectedPlan = location?.state?.plan || null;
  const fromPlan = location?.state?.fromPlan || false;
  const identifier = location?.state?.identifier || "";

  const [emailLocked, setEmailLocked] = useState(false);
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [friendlyError, setFriendlyError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [signupStep, setSignupStep] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    warmupBackend();
  }, []);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from(
    { length: 100 },
    (_, i) => new Date().getFullYear() - i,
  );

  const strongPasswordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+= {[\]};:'",.<>/?\\|`~]).{8,}$/;

  const validateAge18Plus = (day, month, year) => {
    if (!day || !month || !year) return false;
    const dob = new Date(year, month, day);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age >= 18;
  };

  // Email autofill + lock (same as before)
  useEffect(() => {
    const emailRe = /^\S+@\S+\.\S+$/;
    if (identifier && emailRe.test(identifier.trim())) {
      setForm((s) => ({ ...s, email: identifier.trim() }));
      setEmailLocked(true);
    }
  }, [identifier]);

  const validate = (f) => {
    const e = {};
    if (!f.firstName.trim()) e.firstName = "First name is required.";
    if (!f.lastName.trim()) e.lastName = "Last name is required.";

    if (!f.email.trim()) e.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(f.email))
      e.email = "Enter a valid email address.";

    if (!f.day || !f.month || !f.year)
      e.dob = "Please select your complete date of birth.";
    else if (!validateAge18Plus(f.day, f.month, f.year))
      e.dob = "Age must be at least 18.";

    if (!f.password) e.password = "Password is required.";
    else if (!strongPasswordRegex.test(f.password))
      e.password =
        "Password must contain 8+ chars, 1 uppercase, 1 number, and 1 special symbol.";

    if (f.password !== f.confirmPassword)
      e.confirmPassword = "Passwords do not match.";

    return e;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "email" && emailLocked) return;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined, dob: undefined }));
    setFriendlyError(null);
  };

  const mapFirebaseError = (code) => {
    switch (code) {
      case "auth/email-already-in-use":
        return {
          title: "Account already exists",
          message:
            "This email is already registered. Sign in instead to continue.",
          action: { text: "Go to Login", link: "/login" },
        };
      case "auth/unauthorized-domain":
        return {
          title: "Domain not authorized",
          message:
            "Your local IP (192.168.1.109) must be added to Authorized Domains in Firebase Console.",
        };
      case "network-error":
        return {
          title: "Network Error",
          message:
            "Could not connect to the server. Check your firewall or Wi-Fi.",
        };
      default:
        return {
          title: "Signup failed",
          message: `Something went wrong: ${code}. Please try again.`,
        };
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const eObj = validate(form);
    setErrors(eObj);
    if (Object.keys(eObj).length) return;

    setSubmitting(true);
    setSignupStep("Creating security credentials...");
    setFriendlyError(null);

    try {
      // 1. Create User (Must be first)
      const res = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password,
      );

      // 2. Get ID Token immediately
      const token = await res.user.getIdToken(true);

      setSignupStep("Initializing your profile...");

      // 3. Parallelize everything else to save time
      await Promise.all([
        updateProfile(res.user, {
          displayName: `${form.firstName} ${form.lastName}`,
        }),
        api.post(
          "/auth/signup-complete",
          {
            profile: {
              firstName: form.firstName,
              lastName: form.lastName,
              dob: { day: form.day, month: form.month, year: form.year },
            },
            planIntent: preselectedPlan,
            funnel: fromPlan ? "subscribe" : "standard",
          },
          { headers: { Authorization: `Bearer ${token}` } },
        ),
        sendEmailVerification(res.user).catch((e) =>
          console.error("Verification email failed:", e),
        ),
      ]);

      setSignupStep("Finishing up...");

      // 4. Secure Sign Out and Navigate
      await signOut(auth);

      navigate("/verify-email", {
        state: { email: form.email, plan: preselectedPlan, fromPlan },
        replace: true,
      });
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("SIGNUP ERROR:", err);
      }
      setFriendlyError(
        mapFirebaseError(
          err?.code ||
            (err.message === "Network Error" ? "network-error" : "unknown"),
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 relative"
      style={{ backgroundImage: `url(${BGImg})` }}
    >
      {/* Same overlay as Sign In */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      <div className="w-full max-w-md bg-black/85 backdrop-blur-sm rounded-xl p-6 sm:p-10 shadow-2xl text-white relative z-10 border border-white/10">
        {/* Brand anchor – SAME PATTERN AS SIGN IN */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="h-[1px] w-8 bg-blue-500" />
            <p className="text-sm text-blue-100/90 font-medium tracking-wide">
              Stream Now
            </p>
            <div className="h-[1px] w-8 bg-blue-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Create your Stream24 account
          </h1>
        </div>

        {friendlyError && (
          <div className="mb-4 bg-red-500/20 border border-red-500/40 rounded-lg p-3 text-red-200">
            <div className="font-semibold">{friendlyError.title}</div>
            <div className="text-sm mt-1">{friendlyError.message}</div>
            {friendlyError.action && (
              <Link
                to={friendlyError.action.link}
                className="inline-block mt-2 underline text-white font-medium"
              >
                {friendlyError.action.text}
              </Link>
            )}
          </div>
        )}

        <form onSubmit={onSubmit} noValidate className="space-y-3.5">
          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <input
                name="firstName"
                value={form.firstName}
                onChange={onChange}
                placeholder="First name"
                className={`px-3 py-2 rounded-lg bg-[#16181a] border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                  errors.firstName ? "border-red-500" : "border-white/10"
                }`}
              />
              {errors.firstName && (
                <span className="text-red-500 text-xs ml-1">
                  {errors.firstName}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <input
                name="lastName"
                value={form.lastName}
                onChange={onChange}
                placeholder="Last name"
                className={`px-3 py-2 rounded-lg bg-[#16181a] border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                  errors.lastName ? "border-red-500" : "border-white/10"
                }`}
              />
              {errors.lastName && (
                <span className="text-red-500 text-xs ml-1">
                  {errors.lastName}
                </span>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              readOnly={emailLocked}
              placeholder="Email address"
              className={`w-full px-3 py-2 rounded-lg bg-[#16181a] border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                errors.email ? "border-red-500" : "border-white/10"
              } ${emailLocked ? "opacity-70 cursor-not-allowed" : ""}`}
            />
            {errors.email && (
              <span className="text-red-500 text-xs ml-1">{errors.email}</span>
            )}
          </div>

          {/* DOB */}
          <div className="my-4">
            <div className="grid grid-cols-3 gap-2">
              <select
                name="day"
                value={form.day}
                onChange={onChange}
                className={`px-3 py-2 rounded-lg bg-[#16181a] border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                  errors.dob ? "border-red-500" : "border-white/10"
                }`}
              >
                <option value="">Day</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                name="month"
                value={form.month}
                onChange={onChange}
                className={`px-3 py-2 rounded-lg bg-[#16181a] border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                  errors.dob ? "border-red-500" : "border-white/10"
                }`}
              >
                <option value="">Month</option>
                {months.map((m, i) => (
                  <option key={i} value={i}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                name="year"
                value={form.year}
                onChange={onChange}
                className={`px-3 py-2 rounded-lg bg-[#16181a] border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                  errors.dob ? "border-red-500" : "border-white/10"
                }`}
              >
                <option value="">Year</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            {errors.dob && (
              <span className="text-red-500 text-xs mt-1 ml-1 block">
                {errors.dob}
              </span>
            )}
          </div>

          {/* Passwords */}
          <div className="flex flex-col gap-1">
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={onChange}
                placeholder="Password"
                className={`w-full px-3 py-2 rounded-lg bg-[#16181a] border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                  errors.password ? "border-red-500" : "border-white/10"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-red-500 text-xs ml-1">
                {errors.password}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={onChange}
                placeholder="Confirm password"
                className={`w-full px-3 py-2 rounded-lg bg-[#16181a] border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                  errors.confirmPassword ? "border-red-500" : "border-white/10"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? (
                  <FiEyeOff size={18} />
                ) : (
                  <FiEye size={18} />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-red-500 text-xs ml-1">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-500 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {submitting ? signupStep : "Create Account"}
          </button>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-white hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
