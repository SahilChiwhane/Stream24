import { Router } from "express";
import { verifyAuth } from "../../middlewares/auth.middleware.js";

import {
  getMyWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
} from "./wishlist.controller.js";

const router = Router();

// Always use real authentication for personalized wishlists
router.use(verifyAuth);

router.get("/", getMyWishlist);
router.post("/", addToWishlist);
router.delete("/:id", removeFromWishlist);
router.get("/:id", checkWishlist);

export default router;
