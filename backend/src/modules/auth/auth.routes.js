import { Router } from "express";
import {
  verifyAuth,
  verifyAuthStrict,
} from "../../middlewares/auth.middleware.js";
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
// Logout uses strict verification (revocation check) since it actually revokes tokens
router.post("/logout", verifyAuthStrict, noCache, logout);

export default router;
