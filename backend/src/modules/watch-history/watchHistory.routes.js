import { Router } from "express";
import { verifyAuth } from "../../middlewares/auth.middleware.js";
import {
  getWatchHistory,
  upsertHistory,
  removeFromHistory,
} from "./watchHistory.controller.js";

const router = Router();

router.get("/", verifyAuth, getWatchHistory);
router.post("/", verifyAuth, upsertHistory);
router.delete("/:id", verifyAuth, removeFromHistory);

export default router;
