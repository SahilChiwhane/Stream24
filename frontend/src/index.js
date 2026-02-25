import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { SearchProvider } from "./features/search/context/SearchContext";
import { AuthProvider } from "./features/auth/context/AuthContext";
import LazyBoundary from "./shared/components/LazyBoundary";
import ScrollToTop from "./shared/components/ScrollToTop";
import ErrorBoundary from "./shared/components/ErrorBoundary";
import "./shared/styles/base.css";

(function applySavedTheme() {
  const STORAGE_KEY = "stream24_settings_v1";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const theme = parsed && parsed.theme ? parsed.theme : "dark";

    if (theme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }
  } catch (e) {
    // If storage read/parsing fails for any reason, default to dark
    document.documentElement.classList.add("dark");
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <LazyBoundary>
        <AuthProvider>
          <SearchProvider>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </SearchProvider>
        </AuthProvider>
      </LazyBoundary>
    </BrowserRouter>
  </React.StrictMode>,
);

// Register Service Worker to satisfy Manifest/PWA requirements
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {}) // Silenced for production-like feel
      .catch((err) => {}); // Silenced
  });
}

/**
 * 🛠️ DEVELOPMENT HACK: Filter Razorpay "Noise"
 * Razorpay SDK scans local ports for anti-fraud, causing ERR_CONNECTION_REFUSED.
 * This silences those specific errors in the console to keep it clean.
 */
if (process.env.NODE_ENV !== "development") {
  const originalLog = console.log;
  console.log = (...args) => {
    const msg = args[0]?.toString() || "";
    // Filter out React DevTools reminder noise
    if (msg.includes("Download the React DevTools")) return;
    originalLog.apply(console, args);
  };
}

if (process.env.NODE_ENV === "development") {
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args) => {
    const msg = args[0]?.toString() || "";
    // Filter out Razorpay localhost scanning errors
    if (msg.includes("localhost:7070") || msg.includes("localhost:37857"))
      return;
    originalError.apply(console, args);
  };

  console.warn = (...args) => {
    const msg = args[0]?.toString() || "";
    // Filter out Razorpay permissions/fingerprint warnings
    if (msg.includes("x-rtb-fingerprint-id") || msg.includes("accelerometer"))
      return;
    originalWarn.apply(console, args);
  };
}
