import { Router } from "express";
import { verifyAuth } from "../../middlewares/auth.middleware.js";
import { trackPlaybackEvent } from "./analytics.controller.js";

const router = Router();

router.post("/track", verifyAuth, trackPlaybackEvent);

export default router;
