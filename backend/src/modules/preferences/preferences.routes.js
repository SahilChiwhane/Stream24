// backend/src/modules/preferences/preferences.routes.js

import { Router } from "express";
import { verifyAuth } from "../../middlewares/auth.middleware.js";
import {
  getMyPreferences,
  updateMyPreferences,
} from "./preferences.controller.js";

const router = Router();

router.use(verifyAuth);

router.get("/me", getMyPreferences);
router.put("/me", updateMyPreferences);

export default router;
