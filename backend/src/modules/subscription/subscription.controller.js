import { success } from "../../utils/response.js";
import {
  getUserSubscription,
  cancelSubscription,
} from "./subscription.service.js";

/**
 * Fetch current subscription
 * (also performs lazy expiry check)
 */
export const fetchMySubscription = async (req, res, next) => {
  try {
    const data = await getUserSubscription(req.user.uid);
    return success(res, { subscription: data }, "Subscription loaded");
  } catch (err) {
    next(err);
  }
};

/**
 * Soft-cancel (cancel at period end)
 */
export const requestCancelSubscription = async (req, res, next) => {
  try {
    const result = await cancelSubscription(req.user.uid);

    return success(
      res,
      { subscription: result },
      "Subscription set to cancel at period end"
    );
  } catch (err) {
    next(err);
  }
};
