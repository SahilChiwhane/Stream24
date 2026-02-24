import { useEffect, useState } from "react";
import { getTvFeed } from "../services/content.service";

export function useTvFeed() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const res = await getTvFeed();
        if (active) setData(res);
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
