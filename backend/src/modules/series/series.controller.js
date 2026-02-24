import { success, failure } from "../../utils/response.js";
import { resolveNextEpisode } from "./series.service.js";

export const getNextEpisode = async (req, res) => {
  try {
    const { seriesId, season, episode } = req.query;

    if (!seriesId || !season || !episode) {
      return failure(res, "Missing query params", 400);
    }

    const result = await resolveNextEpisode({
      seriesId,
      season: Number(season),
      episode: Number(episode),
    });

    return success(res, result, "Next episode resolved");
  } catch (err) {
    return failure(res, err.message, 500);
  }
};
