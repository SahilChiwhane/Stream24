import { useEffect, useState } from "react";
import { getMoviesFeed } from "../services/content.service";
import { cacheService } from "../../../services/cache";

const CACHE_KEY = "browse:movies_feed";
const CACHE_TTL = 600000; // 10 minutes

export function useMoviesFeed() {
  const cachedData = cacheService.getPersistent(CACHE_KEY, CACHE_TTL);

  const [data, setData] = useState(cachedData);
  // If we already have cached data, start with loading=false so cards render instantly
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    // If fresh cache exists, skip the network fetch entirely
    if (cachedData) {
      return;
    }

    async function load() {
      try {
        const res = await getMoviesFeed();
        if (!mounted) return;

        // Normalize sections array → object
        const sectionMap = {};
        for (const section of res?.sections || []) {
          sectionMap[section.key] = section.items || [];
        }

        const normalized = {
          hero: res.hero,
          heroPool: res.heroPool || [],
          trending: sectionMap.trending || [],
          popular: sectionMap.popular || [],
          newOn: sectionMap.new || [],
          topRated: sectionMap.topRated || [],
          comingSoon: sectionMap.comingSoon || [],
          action: sectionMap.action || [],
          comedy: sectionMap.comedy || [],
          drama: sectionMap.drama || [],
        };

        cacheService.setPersistent(CACHE_KEY, normalized);
        setData(normalized);
      } catch (err) {
        console.error(err);
        if (mounted) setError("Failed to load movies");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    hero: data?.hero || null,
    heroPool: data?.heroPool || [],
    trending: data?.trending || [],
    popular: data?.popular || [],
    newOn: data?.newOn || [],
    topRated: data?.topRated || [],
    comingSoon: data?.comingSoon || [],
    action: data?.action || [],
    comedy: data?.comedy || [],
    drama: data?.drama || [],
    loading,
    error,
  };
}
