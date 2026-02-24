/**
 * Maps TMDB raw item to internal content model
 * (Industrial-grade normalization)
 */
export const mapTMDBItem = (item, forcedType = null) => {
  const releaseDate = item.release_date || item.first_air_date || null;
  const mediaType =
    forcedType || item.media_type || (item.first_air_date ? "tv" : "movie");

  const isAnime =
    item.original_language === "ja" && item.genre_ids?.includes(16);

  return {
    id: item.id,
    title:
      item.title ||
      item.name ||
      item.original_title ||
      item.original_name ||
      "Untitled",

    originalTitle: item.original_title || item.original_name || null,
    external_ids: item.external_ids || null,

    overview: item.overview || "",

    posterUrl: item.poster_path
      ? `https://image.tmdb.org/t/p/original${item.poster_path}`
      : null,

    backdropUrl: item.backdrop_path
      ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
      : null,

    mediaType,
    isAnime,
    rating: item.vote_average || null,
    year: releaseDate ? releaseDate.slice(0, 4) : null,
    releaseDate,
    tagline: item.tagline || null,
    number_of_seasons: item.number_of_seasons || null,
    number_of_episodes: item.number_of_episodes || null,
    seasons: item.seasons || [],
  };
};

/**
 * Normalizes any frontend contentType into TMDB-compatible type
 */
export const normalizeContentType = (type) => {
  if (!type) return null;
  const t = type.toLowerCase();
  if (["anime", "tvshows", "series", "show", "tv"].includes(t)) return "tv";
  if (["movies", "movie"].includes(t)) return "movie";
  return type;
};
