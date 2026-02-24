import { Router } from "express";
import { verifyAuth } from "../../middlewares/auth.middleware.js";
import { getNextEpisode } from "./series.controller.js";

const router = Router();

router.get("/next-episode", verifyAuth, getNextEpisode);

export default router;
