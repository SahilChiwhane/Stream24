import api from "../services/api";

/**
 * Proactively pings the backend to trigger cold starts
 * should be called early (e.g. LandingPage or Auth pages)
 */
export const warmupBackend = () => {
  // Fire and forget - don't await, just wake it up
  api.get("/auth/health").catch(() => {
    /* ignore - failure to wake is handled by actual requests */
  });
};
