import { useEffect, useState } from "react";
import { getTvFeed } from "../services/content.service";
import { cacheService } from "../../../services/cache";

const CACHE_KEY = "browse:tv_feed";
const CACHE_TTL = 600000; // 10 minutes

export function useTvFeed() {
  const cachedData = cacheService.getPersistent(CACHE_KEY, CACHE_TTL);

  const [data, setData] = useState(cachedData);
  // If cached, show instantly — no loading skeleton
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    // Skip fetch if fresh cache exists
    if (cachedData) {
      return;
    }

    async function load() {
      try {
        const res = await getTvFeed();
        if (active) {
          cacheService.setPersistent(CACHE_KEY, res);
          setData(res);
        }
      } catch (err) {
        console.error("TV feed error:", err);
        if (active) setError("Failed to load TV shows");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Normalize sections array → object for easy access
  const sectionMap = {};
  for (const section of data?.sections || []) {
    sectionMap[section.key] = section.items || [];
  }

  return {
    hero: data?.hero || null,
    heroPool: data?.heroPool || [],
    trending: sectionMap.trending || [],
    popular: sectionMap.popular || [],
    topRated: sectionMap.topRated || [],
    airing: sectionMap.airing || [],
    loading,
    error,
  };
}
