import api from "../../../services/api";

/**
 * syncUser
 *
 * Calls backend to ensure user exists and return profile.
 * Backend handles creation if missing.
 */
export async function syncUser() {
  const res = await api.get("/users/me");
  return res.data.data.profile;
}
