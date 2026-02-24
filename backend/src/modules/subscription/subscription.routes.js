import { Router } from "express";
import { verifyAuth } from "../../middlewares/auth.middleware.js";
import {
  fetchMySubscription,
  requestCancelSubscription,
} from "./subscription.controller.js";

const router = Router();

router.use(verifyAuth); // all subscription routes require auth

router.get("/me", fetchMySubscription);
router.post("/cancel", requestCancelSubscription);

export default router;
