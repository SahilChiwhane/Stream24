import { getUserSubscription } from "../modules/subscription/subscription.service.js";
import { failure } from "../utils/response.js";

export const requireActiveSubscription = async (req, res, next) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return failure(res, "Unauthorized", 401);
    }

    const sub = await getUserSubscription(uid);

    if (!sub || sub.status !== "active" || sub.isActive !== true) {
      return failure(res, "Subscription required", 403);
    }

    req.subscription = sub;
    next();
  } catch (err) {
    next(err);
  }
};
