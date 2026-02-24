import { success, failure } from "../../utils/response.js";
import {
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
  isInWishlist,
} from "./wishlist.service.js";

export const getMyWishlist = async (req, res) => {
  try {
    const userId = req.user.uid;
    const data = await getWishlist(userId);
    return success(res, data);
  } catch (err) {
    console.error("getMyWishlist:", err);
    return failure(res, "Failed to load wishlist");
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.uid;
    const item = req.body;

    await addWishlistItem(userId, item);
    return success(res, null, "Added to wishlist");
  } catch (err) {
    console.error("addToWishlist:", err);
    return failure(res, "Failed to add to wishlist");
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    await removeWishlistItem(userId, id);
    return success(res, null, "Removed from wishlist");
  } catch (err) {
    console.error("removeFromWishlist:", err);
    return failure(res, "Failed to remove from wishlist");
  }
};

export const checkWishlist = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    const exists = await isInWishlist(userId, id);
    return success(res, { exists });
  } catch (err) {
    console.error("checkWishlist:", err);
    return failure(res, "Failed to check wishlist");
  }
};
