import { Router } from "express";
import { verifyAuth } from "../../middlewares/auth.middleware.js";
import { requireActiveSubscription } from "../../middlewares/subscription.middleware.js";
import {
  resolvePlayback,
  getNextPlayback,
  resumePlayback,
} from "./playback.controller.js";
import { devAuthBypass } from "../../middlewares/devAuth.middleware.js";

const router = Router();

const isProd = process.env.NODE_ENV === "production";

/**
 * Resolve initial playback entitlement
 */
const isDevAuth = process.env.AUTH_MODE === "dev";

router.post(
  "/resolve",
  isDevAuth ? devAuthBypass : verifyAuth,
  resolvePlayback
);


/**
 * Autoplay next episode
 */
router.get("/next", verifyAuth, requireActiveSubscription, getNextPlayback);

/**
 * ⏯ Resume playback
 */
router.get("/resume", verifyAuth, requireActiveSubscription, resumePlayback);

export default router;
