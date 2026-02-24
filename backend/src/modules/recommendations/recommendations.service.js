import fetch from "node-fetch";

const BASE = "https://api.themoviedb.org/3";
const KEY = process.env.TMDB_API_KEY;

const tmdbFetch = async (path) => {
  const res = await fetch(
    `${BASE}${path}${path.includes("?") ? "&" : "?"}api_key=${KEY}`,
  );
  const data = await res.json();
  return data?.results || [];
};

const mapMovie = (item) => ({
  id: item.id,
  title: item.title || item.name || "Untitled",
  overview: item.overview || "",
  posterUrl: item.poster_path
    ? `https://image.tmdb.org/t/p/w780${item.poster_path}`
    : null,
  backdropUrl: item.backdrop_path
    ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
    : null,
  rating: item.vote_average || null,
  releaseDate: item.release_date || item.first_air_date || null,
  year:
    item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || null,
  mediaType: item.media_type || "movie",
});

function takeUnique(source, used, limit) {
  const out = [];
  for (const item of source) {
    if (!used.has(item.id)) {
      used.add(item.id);
      out.push(item);
    }
    if (out.length >= limit) break;
  }
  return out;
}

function filterRecent(items, days = 45) {
  const cutoff = Date.now() - days * 86400000;
  return items.filter(
    (m) => m.releaseDate && new Date(m.releaseDate).getTime() >= cutoff,
  );
}

/* ===========================
   MOVIES HOME (PRODUCT LOGIC)
=========================== */
export async function buildMoviesHome() {
  const [trendingRaw, topRatedRaw, upcomingRaw, nowPlayingRaw] =
    await Promise.all([
      tmdbFetch("/trending/movie/week"),
      tmdbFetch("/movie/top_rated"),
      tmdbFetch("/movie/upcoming"),
      tmdbFetch("/movie/now_playing"),
    ]);

  const trending = trendingRaw.map(mapMovie);
  const topRated = topRatedRaw.map(mapMovie);
  const upcoming = upcomingRaw.map(mapMovie);
  const nowPlaying = nowPlayingRaw.map(mapMovie);

  const used = new Set();

  // Hero + Trending must come from SAME pool
  const heroPool = takeUnique(trending, used, 10);
  const hero = heroPool[0] || null;

  const trendingRow = heroPool;

  const newOnFiltered = filterRecent(nowPlaying);
  const newOn = takeUnique(newOnFiltered, used, 20);

  const topRatedRow = takeUnique(topRated, used, 20);
  const comingSoon = takeUnique(upcoming, used, 20);

  return {
    heroPool,
    hero,
    trending: trendingRow,
    newOn: newOn.length ? newOn : null,
    topRated: topRatedRow.length ? topRatedRow : null,
    becauseYouWatched: null,
    comingSoon: comingSoon.length ? comingSoon : null,
  };
}

/* ===========================
   TV HOME
=========================== */
export async function buildTvHome() {
  const [trendingRaw, topRatedRaw, airingRaw] = await Promise.all([
    tmdbFetch("/trending/tv/week"),
    tmdbFetch("/tv/top_rated"),
    tmdbFetch("/tv/on_the_air"),
  ]);

  const trending = trendingRaw.map(mapMovie);
  const topRated = topRatedRaw.map(mapMovie);
  const airing = airingRaw.map(mapMovie);

  const used = new Set();
  const heroPool = takeUnique(trending, used, 10);

  return {
    heroPool,
    hero: heroPool[0] || null,
    trending: heroPool,
    topRated: takeUnique(topRated, used, 20),
    airing: takeUnique(airing, used, 20),
  };
}

/* ===========================
   ANIME HOME
=========================== */
export async function buildAnimeHome() {
  const animeRaw = await tmdbFetch(
    "/discover/movie?with_genres=16&with_keywords=210024",
  );

  // INDUSTRIAL BLACKLIST: Global filter for children's cartoons
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

  const anime = animeRaw.map(mapMovie).filter((a) => {
    const name = a.title.toLowerCase();
    return !BLACKLIST.some((term) => name.includes(term.toLowerCase()));
  });
  const used = new Set();

  const heroPool = takeUnique(anime, used, 10);

  return {
    heroPool,
    hero: heroPool[0] || null,
    popular: takeUnique(anime, used, 20),
    topRated: takeUnique(anime, used, 20),
    movies: takeUnique(anime, used, 20),
  };
}
