import api from "../../../services/api";

/* ===============================
   MOVIES
   ================================ */
export async function getMoviesFeed() {
  const res = await api.get("/content/movies/home");

  if (!res?.data?.success) {
    throw new Error("Failed to fetch movies feed");
  }

  return res.data.data;
}

/* ===============================
   TV SHOWS
   ================================ */
export async function getTvFeed() {
  const res = await api.get("/content/tv/home");

  if (!res?.data?.success) {
    throw new Error("Failed to fetch TV feed");
  }

  return res.data.data;
}

/* ===============================
   ANIME
   ================================ */
export async function getAnimeFeed() {
  const res = await api.get("/content/anime/home");

  if (!res?.data?.success) {
    throw new Error("Failed to fetch anime feed");
  }

  return res.data.data;
}

/* ===============================
   DETAILS
   ================================ */
export async function getContentDetails(type, id) {
  const res = await api.get(`/content/${type}/${id}`);

  if (!res?.data?.success) {
    throw new Error("Failed to fetch details");
  }

  return res.data.data;
}
