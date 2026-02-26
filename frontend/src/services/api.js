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

    // 2. Wait for auth to initialize (max 3 seconds)
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });

    // Timeout fallback
    setTimeout(() => {
      unsubscribe();
      resolve(null);
    }, 3000);
  });
};

/**
 * Smart token getter — only force-refreshes when the token is
 * within 5 minutes of expiry. This avoids a 200-800ms Firebase
 * round-trip on every single request.
 */
const getToken = async (user) => {
  try {
    // getIdTokenResult gives us the expiry time without forcing a refresh
    const result = await user.getIdTokenResult(false);
    const expiresAt = new Date(result.expirationTime).getTime();
    const fiveMinutes = 5 * 60 * 1000;
    const needsRefresh = expiresAt - Date.now() < fiveMinutes;
    // Only force-refresh if the token is close to/past expiry
    return await user.getIdToken(needsRefresh);
  } catch {
    // Fallback: get token without forcing refresh
    return await user.getIdToken(false);
  }
};

api.interceptors.request.use(async (config) => {
  try {
    let user = auth.currentUser;

    // If no user immediately available, wait for bootstrap
    if (!user) {
      user = await getAuthenticatedUser();
    }

    if (user) {
      const token = await getToken(user);
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[API] Interceptor error:", err);
    }
  }
  return config;
});

export default api;
