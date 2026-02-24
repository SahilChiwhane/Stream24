import api from "../../../services/api";

export async function resolvePlayback({
  contentId,
  contentType,
  season,
  episode,
}) {
  const res = await api.post("/playback/resolve", {
    contentId,
    contentType,
    season,
    episode,
  });

  if (!res?.data?.success) {
    throw new Error("Playback denied");
  }

  return res.data.data;
}
