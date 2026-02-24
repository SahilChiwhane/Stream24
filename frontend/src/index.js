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
