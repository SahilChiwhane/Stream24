import { success, failure } from "../../utils/response.js";
import {
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
  isInWishlist,
} from "./wishlist.service.js";
import logger from "../../utils/logger.js";

export const getMyWishlist = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const data = await getWishlist(userId);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const item = req.body;

    await addWishlistItem(userId, item);
    return success(res, null, "Added to wishlist");
  } catch (err) {
    next(err);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    await removeWishlistItem(userId, id);
    return success(res, null, "Removed from wishlist");
  } catch (err) {
    next(err);
  }
};

export const checkWishlist = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    const exists = await isInWishlist(userId, id);
    return success(res, { exists });
  } catch (err) {
    next(err);
  }
};
