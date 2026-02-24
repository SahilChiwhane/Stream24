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
export const getWatchHistory = async (req, res) => {
  try {
    const { uid } = req.user;
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );

    const list = await getUserWatchHistory(uid);

    return success(res, { list }, "Watch history loaded");
  } catch (err) {
    logger.error(
      `Failed to fetch watch history for ${req.user?.uid}: ${err.message}`,
    );
    return failure(res, err.message || "Failed to load watch history", 500);
  }
};

/**
 * POST /watch-history
 * Body: { contentId, contentType, title, thumbnail, season, episode, durationSeconds, progress }
 */
export const upsertHistory = async (req, res) => {
  try {
    const { uid } = req.user;
    const { contentId, progress, durationSeconds } = req.body;

    console.log(
      `\n\x1b[42m[HISTORY_CONTROLLER] UPDATE RECEIVED\x1b[0m Content: ${contentId} | Progress: ${progress}s | Duration: ${durationSeconds}s`,
    );

    const payload = { ...req.body, uid };
    await upsertWatchHistory(payload);

    return success(res, null, "Watch history updated");
  } catch (err) {
    console.log(
      `\x1b[41m[HISTORY_CONTROLLER] FAILED\x1b[0m Error: ${err.message}`,
    );
    return failure(res, err.message || "Failed to update watch history", 500);
  }
};

/**
 * DELETE /watch-history/:id
 */
export const removeFromHistory = async (req, res) => {
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
    return failure(res, err.message || "Failed to remove item", 500);
  }
};
