import api from "../../../services/api";

export async function getMyPreferences() {
  const res = await api.get("/preferences/me");

  if (!res?.data?.success) {
    throw new Error("Failed to load preferences");
  }

  return res.data.data;
}

export async function updateMyPreferences(patch) {
  const res = await api.put("/preferences/me", patch);

  if (!res?.data?.success) {
    throw new Error("Failed to update preferences");
  }

  return res.data.data;
}
