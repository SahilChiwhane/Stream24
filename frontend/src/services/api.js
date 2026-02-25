import axios from "axios";
import { auth } from "./firebase";

// Reads from .env → REACT_APP_API_BASE_URL
// Falls back to localhost for pure desktop dev.
// To change the network IP: update .env only — never edit this file.
const baseURL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5051/api/v1";

const api = axios.create({
  baseURL,
  timeout: 15000,
});

// Helper to wait for the auth state to initialize if it's currently null but might be loading
const getAuthenticatedUser = () => {
  return new Promise((resolve) => {
    // 1. Immediate check
    if (auth.currentUser) return resolve(auth.currentUser);

    // 2. Poll for a short duration (handles the gap between event and singleton update)
    let attempts = 0;
    const maxAttempts = 20; // 2 seconds (20 * 100ms)

    const interval = setInterval(() => {
      attempts++;
      if (auth.currentUser) {
        clearInterval(interval);
        resolve(auth.currentUser);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        resolve(null);
      }
    }, 100);

    // 3. Fallback: Also listen for one state change just in case
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        clearInterval(interval);
        unsubscribe();
        resolve(user);
      }
    });
  });
};

api.interceptors.request.use(async (config) => {
  try {
    let user = auth.currentUser;

    // If no user immediately available, wait briefly (handles bootstrap race)
    if (!user) {
      // console.debug(`[API] Waiting for auth for: ${config.url}`);
      user = await getAuthenticatedUser();
      // if (user) console.debug(`[API] Auth found for: ${config.url}`);
    }

    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Only warn if it's not a common public route
      const publicRoutes = [
        "/auth/login",
        "/auth/signup",
        "/auth/session",
        "/assets",
      ];
      const isPublic = publicRoutes.some((route) => config.url.includes(route));

      if (!isPublic) {
        // Silenced polling timeout warning
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[API] Interceptor error:", err);
    }
  }
  return config;
});

export default api;
