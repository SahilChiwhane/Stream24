import api from "../../../services/api";
import { cacheService } from "../../../services/cache";

const CACHE_TTL = 900000; // 15 minutes

export async function getContentDetails(type, id) {
  const cacheKey = `details:${type}:${id}`;
  const cached = cacheService.get(cacheKey, CACHE_TTL);
  if (cached) return cached;

  const res = await api.get(`/content/${type}/${id}`);

  if (!res?.data?.success) {
    throw new Error("Failed to load content");
  }

  const data = res.data.data;
  cacheService.set(cacheKey, data);
  return data;
}

export async function getSeasonDetails(id, seasonNumber) {
  const cacheKey = `details:tv:${id}:s${seasonNumber}`;
  const cached = cacheService.get(cacheKey, CACHE_TTL);
  if (cached) return cached;

  const res = await api.get(`/content/tv/${id}/season/${seasonNumber}`);

  if (!res?.data?.success) {
    throw new Error("Failed to load season details");
  }

  const data = res.data.data;
  cacheService.set(cacheKey, data);
  return data;
}
