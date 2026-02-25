import { success, failure } from "../../utils/response.js";
import { resolvePreview } from "./preview.service.js";

export const resolvePreviewController = async (req, res, next) => {
  try {
    const { contentId, contentType } = req.query;

    if (!contentId || !contentType) {
      return failure(res, "contentId and contentType required", 400);
    }

    const preview = await resolvePreview(contentType, contentId);

    if (!preview) {
      return success(res, { preview: { available: false } });
    }

    return success(res, { preview });
  } catch (err) {
    next(err);
  }
};
