import { success, failure } from "../../utils/response.js";
import { logPlaybackEvent } from "./analytics.service.js";

export const trackPlaybackEvent = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { contentId, contentType, event, meta } = req.body;

    if (!contentId || !contentType || !event) {
      return failure(res, "Missing required fields", 400);
    }

    const result = await logPlaybackEvent({
      uid,
      contentId,
      contentType,
      event,
      meta,
    });

    return success(res, result, "Event tracked");
  } catch (err) {
    return failure(res, err.message || "Tracking failed");
  }
};
