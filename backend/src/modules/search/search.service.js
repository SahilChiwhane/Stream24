import fetch from "node-fetch";
import { env } from "../../config/env.js";
import { mapTMDBItem } from "../content/content.mapper.js";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export const searchMulti = async (query, page = 1) => {
  const url = new URL(`${TMDB_BASE_URL}/search/multi`);
  url.searchParams.append("api_key", env.TMDB_API_KEY);
  url.searchParams.append("query", query);
  url.searchParams.append("page", page);
  url.searchParams.append("include_adult", "false");
  url.searchParams.append("language", "en-US");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.statusText}`);
  }

  const raw = await response.json();

  // BLACKLIST: Filter out cartoons (Kodomo) from general results for consistency
  const BLACKLIST = [
    "Doraemon",
    "Shin-chan",
    "Shinchan",
    "Crayon Shin",
    "Anpanman",
    "Ninja Hattori",
    "Perman",
    "Kiteretsu",
    "Obake no Q-taro",
    "Chibi Maruko-chan",
    "Sazae-san",
    "Pokemon",
    "Pokémon",
    "Hamtaro",
    "BeyBlade",
    "Digimon",
  ];

  let baseResults = (raw.results || [])
    .map((item) => mapTMDBItem(item))
    .filter((item) => {
      const name = (item.title || item.name || "").toLowerCase();
      const isBlacklisted = BLACKLIST.some((term) =>
        name.includes(term.toLowerCase()),
      );
      return !isBlacklisted;
    });

  // Netflix-Style Expansion: Expand TV shows into separate seasons in search
  const expandedResults = [];
  const tvToExpand = baseResults
    .filter((r) => r.mediaType === "tv")
    .slice(0, 5);

  // Pre-fetch details for TV shows to get their seasons
  const tvDetails = await Promise.all(
    tvToExpand.map(async (tv) => {
      try {
        const dRes = await fetch(
          `${TMDB_BASE_URL}/tv/${tv.id}?api_key=${env.TMDB_API_KEY}`,
        );
        if (!dRes.ok) return null;
        return await dRes.json();
      } catch (e) {
        return null;
      }
    }),
  );

  for (const item of baseResults) {
    if (item.mediaType === "tv") {
      const details = tvDetails.find(
        (d) => d && String(d.id) === String(item.id),
      );
      if (details && details.seasons && details.seasons.length > 0) {
        // Add each season as a separate result
        for (const s of details.seasons) {
          if (s.season_number === 0) continue; // Skip specials

          expandedResults.push({
            ...item,
            id: item.id, // Keep original ID for TMDB fetching
            title:
              s.name && s.name !== `Season ${s.season_number}`
                ? `${item.title}: ${s.name}`
                : `${item.title} - Season ${s.season_number}`,
            posterUrl: s.poster_path
              ? `https://image.tmdb.org/t/p/original${s.poster_path}`
              : item.posterUrl,
            season: s.season_number,
            mediaType: "tv",
          });
        }
      } else {
        // Fallback: just add the main item
        expandedResults.push(item);
      }
    } else {
      expandedResults.push(item);
    }
  }

  return {
    ...raw,
    results: expandedResults,
  };
};
