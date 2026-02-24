

const BASE = "https://api.themoviedb.org/3";
const KEY = process.env.TMDB_API_KEY;

async function safeFetch(url, retries = 2) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`TMDB ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    if (retries > 0) {
      return safeFetch(url, retries - 1);
    }
    throw err;
  }
}

export const getTrending = () =>
  safeFetch(`${BASE}/trending/all/week?api_key=${KEY}`);

export const getPopularMovies = () =>
  safeFetch(`${BASE}/movie/popular?api_key=${KEY}`);

export const getPopularTV = () =>
  safeFetch(`${BASE}/tv/popular?api_key=${KEY}`);
