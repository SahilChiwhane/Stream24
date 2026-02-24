import fetch from "node-fetch";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_KEY = process.env.TMDB_API_KEY;

export async function resolvePreview(contentType, contentId) {
  try {
    const url = `${TMDB_BASE}/${contentType}/${contentId}/videos?api_key=${TMDB_KEY}`;
    const res = await fetch(url);

    if (!res.ok) return null;

    const data = await res.json();
    const videos = data?.results || [];

    // Priority: teaser → trailer → clip → anything youtube
    const selected =
      videos.find((v) => v.type === "Teaser" && v.site === "YouTube") ||
      videos.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
      videos.find((v) => v.type === "Clip" && v.site === "YouTube") ||
      videos.find((v) => v.site === "YouTube");

    if (!selected) return null;

    return {
      available: true,
      provider: "youtube",
      videoId: selected.key,
      type: selected.type?.toLowerCase() || "unknown",
    };
  } catch {
    return null;
  }
}
