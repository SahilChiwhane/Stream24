import fetch from "node-fetch";
import { mapTMDBItem } from "./content.mapper.js";
import logger from "../../utils/logger.js";
import cache from "../../utils/cache.js";

const BASE = "https://api.themoviedb.org/3";
const KEY = process.env.TMDB_API_KEY;

if (!KEY) {
  logger.warn("TMDB_API_KEY missing in env");
}

/* -----------------------------------
   Config
----------------------------------- */
const TIMEOUT = 8000;
const RETRIES = 2;

/* -----------------------------------
   Robust fetch with timeout + retry
----------------------------------- */
const safeFetch = async (url, attempt = 1) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const res = await fetch(url, { signal: controller.signal });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    if (attempt <= RETRIES) {
      logger.debug(`Retry ${attempt} for ${url}`);
      return safeFetch(url, attempt + 1);
    }

    logger.error(`TMDB failed after retries: ${url}`, err.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

/* -----------------------------------
   TMDB wrapper (Multi-page support)
----------------------------------- */
const tmdbFetch = async (path, pages = 1) => {
  const separator = path.includes("?") ? "&" : "?";

  if (pages === 1) {
    const url = `${BASE}${path}${separator}api_key=${KEY}&page=1`;
    const data = await safeFetch(url);
    return data?.results || [];
  }

  // Fetch multiple pages in parallel for speed
  const requests = [];
  for (let p = 1; p <= pages; p++) {
    const url = `${BASE}${path}${separator}api_key=${KEY}&page=${p}`;
    requests.push(safeFetch(url));
  }

  const results = await Promise.all(requests);
  return results.flatMap((data) => data?.results || []);
};

/* -----------------------------------
   Normalizer (Backend owns contract)
----------------------------------- */
const mapTMDB = mapTMDBItem;

// ======================================================
// INDUSTRIAL BLACKLIST (Kodomo/Cartoons)
// ======================================================
const BLACKLIST = [
  "Doraemon",
  "Shin-chan",
  "Shinchan",
  "Shin Chan",
  "Shin_Chan",
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

const filterBlacklisted = (items) =>
  items.filter((item) => {
    const name = (item.name || item.title || "").toLowerCase();
    const isBad = BLACKLIST.some((term) => name.includes(term.toLowerCase()));
    return !isBad;
  });

const isAnime = (item) =>
  item.original_language === "ja" && item.genre_ids?.includes(16);

/* ======================================================
   MOVIES FEED
   ====================================================== */
/* ======================================================
     MOVIES FEED
     ====================================================== */
export const fetchMoviesHome = async () => {
  const cacheKey = "movies_home";
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const results = await Promise.allSettled([
    tmdbFetch("/trending/movie/week", 2), // 30 items -> 2 pages
    tmdbFetch("/movie/popular", 2),
    tmdbFetch("/movie/top_rated", 2),
    tmdbFetch("/movie/upcoming", 2),
    tmdbFetch("/movie/now_playing", 2),
    tmdbFetch("/discover/movie?with_genres=28&sort_by=popularity.desc", 2), // Action
    tmdbFetch("/discover/movie?with_genres=35&sort_by=popularity.desc", 2), // Comedy
    tmdbFetch("/discover/movie?with_genres=18&sort_by=popularity.desc", 2), // Drama
  ]);

  const [
    trendingRaw,
    popularRaw,
    topRatedRaw,
    upcomingRaw,
    nowPlayingRaw,
    actionRaw,
    comedyRaw,
    dramaRaw,
  ] = results.map((r) => (r.status === "fulfilled" ? r.value : []));

  // Filter Out Anime from Movies feed
  const filterMovies = (items) =>
    filterBlacklisted(items).filter((i) => !isAnime(i));

  const trending = filterMovies(trendingRaw).map((i) => mapTMDB(i));
  const popular = filterMovies(popularRaw).map((i) => mapTMDB(i));
  const topRated = filterMovies(topRatedRaw).map((i) => mapTMDB(i));
  const upcoming = filterMovies(upcomingRaw).map((i) => mapTMDB(i));
  const nowPlaying = filterMovies(nowPlayingRaw).map((i) => mapTMDB(i));
  const action = filterMovies(actionRaw).map((i) => mapTMDB(i));
  const comedy = filterMovies(comedyRaw).map((i) => mapTMDB(i));
  const drama = filterMovies(dramaRaw).map((i) => mapTMDB(i));

  // ---------------------------------------------------
  // Core product logic helpers
  // ---------------------------------------------------

  const used = new Set();

  const takeUnique = (items, limit) => {
    const out = [];
    for (const item of items) {
      if (!used.has(item.id)) {
        used.add(item.id);
        out.push(item);
      }
      if (out.length >= limit) break;
    }
    return out;
  };

  const filterRecent = (items, days = 45) => {
    const cutoff = Date.now() - days * 86400000;

    return items.filter((m) => {
      if (!m.releaseDate) return false;

      const time = new Date(m.releaseDate).getTime();
      return !Number.isNaN(time) && time >= cutoff;
    });
  };

  // ---------------------------------------------------
  // Hero & Trending (same pool)
  // ---------------------------------------------------

  const heroPool = takeUnique(trending, 30);
  const hero = heroPool[0] || null;

  // ---------------------------------------------------
  // Sections (product-grade rows)
  // ---------------------------------------------------

  const sections = [];

  const trendingRow = heroPool;
  if (trendingRow.length) {
    sections.push({
      key: "trending",
      title: "Trending Now",
      items: trendingRow,
    });
  }

  const popularRow = takeUnique(popular, 30);
  if (popularRow.length) {
    sections.push({
      key: "popular",
      title: "Popular on Stream24",
      items: popularRow,
    });
  }

  const newOnRow = takeUnique(filterRecent(nowPlaying), 30);
  if (newOnRow.length) {
    sections.push({
      key: "new",
      title: "New on Stream24",
      items: newOnRow,
    });
  }

  const topRatedRow = takeUnique(topRated, 30);
  if (topRatedRow.length) {
    sections.push({
      key: "topRated",
      title: "Top Rated",
      items: topRatedRow,
    });
  }

  const actionRow = takeUnique(action, 30);
  if (actionRow.length) {
    sections.push({
      key: "action",
      title: "Action Picks",
      items: actionRow,
    });
  }

  const comedyRow = takeUnique(comedy, 30);
  if (comedyRow.length) {
    sections.push({
      key: "comedy",
      title: "Comedy Picks",
      items: comedyRow,
    });
  }

  const dramaRow = takeUnique(drama, 30);
  if (dramaRow.length) {
    sections.push({
      key: "drama",
      title: "Drama Picks",
      items: dramaRow,
    });
  }

  const comingSoonRow = takeUnique(upcoming, 30);
  if (comingSoonRow.length) {
    sections.push({
      key: "comingSoon",
      title: "Coming Soon",
      items: comingSoonRow,
    });
  }

  // ---------------------------------------------------
  // Final response (product contract)
  // ---------------------------------------------------

  const final = {
    hero,
    heroPool,
    sections,
  };

  cache.set(cacheKey, final, 3600); // 1 hour TTL
  return final;
};

/* ======================================================
     TV SHOWS FEED
     ====================================================== */
export const fetchTvHome = async () => {
  const cacheKey = "tv_home";
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const results = await Promise.allSettled([
    tmdbFetch("/trending/tv/week", 2),
    tmdbFetch("/tv/popular", 2),
    tmdbFetch("/tv/top_rated", 2),
    tmdbFetch("/tv/on_the_air", 2),
  ]);

  const [trendingRaw, popularRaw, topRatedRaw, airingRaw] = results.map((r) =>
    r.status === "fulfilled" ? r.value : [],
  );

  const filterTv = (items) =>
    items
      .filter((i) => !isAnime(i))
      .filter((i) => {
        const name = (i.name || i.title || "").toLowerCase();
        return !BLACKLIST.some((term) => name.includes(term.toLowerCase()));
      });

  const trending = filterTv(trendingRaw).map((i) => mapTMDB(i));
  const popular = filterTv(popularRaw).map((i) => mapTMDB(i));
  const topRated = filterTv(topRatedRaw).map((i) => mapTMDB(i));
  const airing = filterTv(airingRaw).map((i) => mapTMDB(i));

  const used = new Set();
  const takeUnique = (items, limit) => {
    const out = [];
    for (const item of items) {
      if (!used.has(item.id)) {
        used.add(item.id);
        out.push(item);
      }
      if (out.length >= limit) break;
    }
    return out;
  };

  const heroPool = takeUnique(trending, 30);
  const hero = heroPool[0] || null;

  const sections = [];
  if (heroPool.length) {
    sections.push({
      key: "trending",
      title: "Trending TV Shows",
      items: heroPool,
    });
  }

  const popularRow = takeUnique(popular, 30);
  if (popularRow.length) {
    sections.push({
      key: "popular",
      title: "Popular Shows",
      items: popularRow,
    });
  }

  const topRatedRow = takeUnique(topRated, 30);
  if (topRatedRow.length) {
    sections.push({
      key: "topRated",
      title: "Top Rated Shows",
      items: topRatedRow,
    });
  }

  const airingRow = takeUnique(airing, 30);
  if (airingRow.length) {
    sections.push({
      key: "airing",
      title: "Currently Airing",
      items: airingRow,
    });
  }

  const final = { hero, heroPool, sections };
  cache.set(cacheKey, final, 3600); // 1 hour TTL
  return final;
};

/* ======================================================
     ANIME FEED (TMDB powered, real filtering)
     Definition:
     - Genre = Animation (16)
     - Original language = Japanese (ja)
     ====================================================== */
export const fetchAnimeHome = async () => {
  const cacheKey = "anime_home";
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const results = await Promise.allSettled([
    tmdbFetch(
      "/discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc",
      2,
    ),
    tmdbFetch(
      "/discover/movie?with_genres=16&with_original_language=ja&sort_by=popularity.desc",
      2,
    ),
    tmdbFetch(
      "/discover/tv?with_genres=16&with_original_language=ja&sort_by=vote_average.desc&vote_count.gte=100",
      2,
    ),
    tmdbFetch(
      "/discover/movie?with_genres=16&with_original_language=ja&sort_by=vote_average.desc&vote_count.gte=100",
      2,
    ),
    tmdbFetch(
      "/discover/tv?with_genres=16,10759&with_original_language=ja&sort_by=popularity.desc",
      2,
    ), // Shonen/Action
    tmdbFetch(
      "/discover/tv?with_genres=16,35&with_original_language=ja&sort_by=popularity.desc",
      2,
    ), // Comedy Anime
  ]);

  const [
    popularSeriesRaw,
    popularMoviesRaw,
    topSeriesRaw,
    topMoviesRaw,
    actionAnimeRaw,
    comedyAnimeRaw,
  ] = results.map((r) => (r.status === "fulfilled" ? r.value : []));

  const series = filterBlacklisted(popularSeriesRaw).map((i) => mapTMDB(i));
  const movies = filterBlacklisted(popularMoviesRaw).map((i) => mapTMDB(i));
  const topSeries = filterBlacklisted(topSeriesRaw).map((i) => mapTMDB(i));
  const topMovies = filterBlacklisted(topMoviesRaw).map((i) => mapTMDB(i));
  const actionAnime = filterBlacklisted(actionAnimeRaw).map((i) => mapTMDB(i));
  const comedyAnime = filterBlacklisted(comedyAnimeRaw).map((i) => mapTMDB(i));

  const popular = [...series, ...movies].sort(
    (a, b) => (b.popularity || 0) - (a.popularity || 0),
  );
  const topRated = [...topSeries, ...topMovies].sort(
    (a, b) => (b.rating || 0) - (a.rating || 0),
  );

  const used = new Set();
  const takeUnique = (items, limit) => {
    const out = [];
    for (const item of items) {
      if (!used.has(item.id)) {
        used.add(item.id);
        out.push(item);
      }
      if (out.length >= limit) break;
    }
    return out;
  };

  const heroPool = takeUnique(popular, 15);
  const hero = heroPool[0] || null;

  const sections = [];
  if (heroPool.length) {
    sections.push({
      key: "popular",
      title: "Popular Anime",
      items: heroPool,
    });
  }

  const topRatedRow = takeUnique(topRated, 30);
  if (topRatedRow.length) {
    sections.push({
      key: "topRated",
      title: "Top Rated Anime",
      items: topRatedRow,
    });
  }

  const actionRow = takeUnique(actionAnime, 30);
  if (actionRow.length) {
    sections.push({
      key: "shonen",
      title: "Shonen & Action",
      items: actionRow,
    });
  }

  const seriesRow = takeUnique(series, 30);
  if (seriesRow.length) {
    sections.push({
      key: "series",
      title: "Anime Series",
      items: seriesRow,
    });
  }

  const comedyRow = takeUnique(comedyAnime, 30);
  if (comedyRow.length) {
    sections.push({
      key: "comedy",
      title: "Comedy Classics",
      items: comedyRow,
    });
  }

  const moviesRow = takeUnique(movies, 30);
  if (moviesRow.length) {
    sections.push({
      key: "movies",
      title: "Anime Movies",
      items: moviesRow,
    });
  }

  const final = { hero, heroPool, sections };
  cache.set(cacheKey, final, 3600); // 1 hour TTL
  return final;
};

/* ======================================================
   DETAILS
====================================================== */
export const fetchDetails = async (type, id) => {
  const cacheKey = `details_${type}_${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const normalizedType =
    type === "anime" ? "tv" : type === "movie" ? "movie" : type;

  const [details, credits, recommendations] = await Promise.all([
    safeFetch(
      `${BASE}/${normalizedType}/${id}?api_key=${KEY}&append_to_response=external_ids`,
    ),
    safeFetch(`${BASE}/${normalizedType}/${id}/credits?api_key=${KEY}`),
    safeFetch(`${BASE}/${normalizedType}/${id}/recommendations?api_key=${KEY}`),
  ]);

  if (!details) {
    throw new Error("Content not found");
  }

  const baseData = mapTMDB(details);

  const final = {
    ...baseData,
    genres: details.genres?.map((g) => g.name) || [],
    runtime: details.runtime || details.episode_run_time?.[0] || null,
    cast:
      credits?.cast?.slice(0, 15).map((c) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profileUrl: c.profile_path
          ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
          : null,
      })) || [],
    similar: recommendations?.results?.map((i) => mapTMDB(i)) || [],
    number_of_seasons:
      details.number_of_seasons || baseData.number_of_seasons || null,
    seasons: details.seasons || baseData.seasons || [],
  };

  cache.set(cacheKey, final, 14400); // 4 hours TTL
  return final;
};
/* ======================================================
   SEASON DETAILS
====================================================== */
export const fetchSeasonDetails = async (id, seasonNumber) => {
  const cacheKey = `season_${id}_S${seasonNumber}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const data = await safeFetch(
    `${BASE}/tv/${id}/season/${seasonNumber}?api_key=${KEY}`,
  );

  if (!data) return null;

  const final = {
    seasonNumber: data.season_number,
    name: data.name,
    overview: data.overview,
    episodes:
      data.episodes?.map((ep) => ({
        id: ep.id,
        episodeNumber: ep.episode_number,
        name: ep.name,
        overview: ep.overview,
        airDate: ep.air_date,
        runtime: ep.runtime,
        stillUrl: ep.still_path
          ? `https://image.tmdb.org/t/p/w780${ep.still_path}`
          : null,
      })) || [],
  };

  cache.set(cacheKey, final, 43200); // 12 hours TTL (Seasonal data is static)
  return final;
};
