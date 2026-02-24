import axios from "axios";

// Reads from .env → REACT_APP_API_BASE_URL
// Falls back to localhost for pure desktop dev.
// To change the network IP: update .env only — never edit this file.
const baseURL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5050/api/v1";

const api = axios.create({
  baseURL,
  timeout: 15000, // 15s — tolerates slow WiFi between phone & dev machine
});

// Attach Firebase token automatically to every request
api.interceptors.request.use(async (config) => {
  const { auth } = await import("./firebase");

  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
