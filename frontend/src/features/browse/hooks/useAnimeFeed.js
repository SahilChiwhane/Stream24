import { useEffect, useState } from "react";
import { getAnimeFeed } from "../services/content.service";
import { cacheService } from "../../../services/cache";

const CACHE_KEY = "browse:anime_feed";
const CACHE_TTL = 600000; // 10 minutes

export function useAnimeFeed() {
  const [data, setData] = useState(() =>
    cacheService.getPersistent(CACHE_KEY, CACHE_TTL),
  );
  const [loading, setLoading] = useState(
    !cacheService.getPersistent(CACHE_KEY, CACHE_TTL),
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    // SWR-style check
    const cached = cacheService.getPersistent(CACHE_KEY, CACHE_TTL);
    if (cached) {
      if (active) {
        setLoading(false);
        setData(cached);
      }
      // SWR: fetch anyway in bg
    }

    async function load() {
      try {
        setLoading(true);
        const res = await getAnimeFeed();
        if (active) {
          cacheService.setPersistent(CACHE_KEY, res);
          setData(res);
        }
      } catch (err) {
        console.error("Anime feed error:", err);
        if (active) setError("Failed to load anime");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  // Normalize sections array → object for easy access
  const sectionMap = {};
  for (const section of data?.sections || []) {
    sectionMap[section.key] = section.items || [];
  }

  return {
    hero: data?.hero || null,
    heroPool: data?.heroPool || [],
    popular: sectionMap.popular || [],
    topRated: sectionMap.topRated || [],
    shonen: sectionMap.shonen || [],
    series: sectionMap.series || [],
    animeComedy: sectionMap.comedy || [],
    movies: sectionMap.movies || [],
    loading,
    error,
  };
}
