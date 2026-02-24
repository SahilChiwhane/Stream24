import { Router } from "express";
import { moviesHome, tvHome, animeHome } from "./recommendations.controller.js";

const router = Router();

router.get("/movies/home", moviesHome);
router.get("/tv/home", tvHome);
router.get("/anime/home", animeHome);

export default router;
