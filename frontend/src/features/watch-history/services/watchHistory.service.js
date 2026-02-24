import api from "../../../services/api";

export async function fetchWatchHistory() {
  const res = await api.get("/watch-history");
  if (!res.data?.success) throw new Error("Failed to load history");
  return res.data.data.list || [];
}

export async function upsertWatchHistory(payload) {
  const res = await api.post("/watch-history", payload);
  if (!res.data?.success) {
    throw new Error("Failed to save history");
  }
  return true;
}
export async function removeFromWatchHistory(historyId) {
  const res = await api.delete(`/watch-history/${historyId}`);
  if (!res.data?.success) throw new Error("Failed to remove from history");
  return true;
}
