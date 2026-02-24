import { useEffect, useState } from "react";
import { getMoviesFeed } from "../services/content.service";
import { cacheService } from "../../../services/cache";

const CACHE_KEY = "browse:movies_feed";
const CACHE_TTL = 600000; // 10 minutes

export function useMoviesFeed() {
  const [data, setData] = useState(() =>
    cacheService.getPersistent(CACHE_KEY, CACHE_TTL),
  );
  const [loading, setLoading] = useState(
    !cacheService.getPersistent(CACHE_KEY, CACHE_TTL),
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    // If we already have cached data, don't show loader, but we could "Background refresh"
    // For now, if cached, just skip the immediate fetch if we want strict caching,
    // or re-fetch in background (SWR style). Let's do a smart fetch.
    const cached = cacheService.getPersistent(CACHE_KEY, CACHE_TTL);
    if (cached) {
      if (mounted) {
        setLoading(false);
        setData(cached);
      }
      // Industrial SWR: Still fetch in background to refresh
    }

    async function load() {
      try {
        setLoading(true);
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
