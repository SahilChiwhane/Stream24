import { Router } from "express";
import { verifyAuth } from "../../middlewares/auth.middleware.js";
import { noCache } from "../../middlewares/cache.middleware.js";
import {
  healthCheck,
  resolveSession,
  logout,
  signupComplete,
} from "./auth.controller.js";

const router = Router();

router.get("/health", healthCheck);
router.post("/signup-complete", verifyAuth, noCache, signupComplete);
router.get("/session", verifyAuth, noCache, resolveSession);
router.post("/logout", verifyAuth, noCache, logout);

export default router;
