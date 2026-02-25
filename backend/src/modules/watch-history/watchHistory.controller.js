import { success, failure } from "../../utils/response.js";
import {
  getUserWatchHistory,
  upsertWatchHistory,
  deleteWatchHistoryItem,
} from "./watchHistory.service.js";
import logger from "../../utils/logger.js";

/**
 * GET /watch-history
 */
export const getWatchHistory = async (req, res, next) => {
  try {
    const { uid } = req.user;
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );

    const list = await getUserWatchHistory(uid);

    return success(res, { list }, "Watch history loaded");
  } catch (err) {
    next(err);
  }
};

/**
 * POST /watch-history
 * Body: { contentId, contentType, title, thumbnail, season, episode, durationSeconds, progress }
 */
export const upsertHistory = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const payload = { ...req.body, uid };
    await upsertWatchHistory(payload);

    return success(res, null, "Watch history updated");
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /watch-history/:id
 */
export const removeFromHistory = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    if (!id) return failure(res, "Missing record ID", 400);

    const deleted = await deleteWatchHistoryItem(uid, id);

    if (deleted) {
      return success(res, null, "Item removed from history");
    } else {
      return failure(res, "Item not found or unauthorized", 404);
    }
  } catch (err) {
    next(err);
  }
};
