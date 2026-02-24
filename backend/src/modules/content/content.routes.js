import { Router } from "express";
import { cacheResponse } from "../../middlewares/cache.middleware.js";
import {
  getMoviesHome,
  getTvHome,
  getAnimeHome,
  getDetails,
  getSeasonDetails,
} from "./content.controller.js";

const router = Router();

// Cache home listings for 5 minutes
router.get("/movies/home", cacheResponse(300), getMoviesHome);
router.get("/tv/home", cacheResponse(300), getTvHome);
router.get("/anime/home", cacheResponse(300), getAnimeHome);

// Cache details for 10 minutes (rarely changes)
router.get(
  "/tv/:id/season/:seasonNumber",
  cacheResponse(600),
  getSeasonDetails,
);
router.get("/:type/:id", cacheResponse(600), getDetails);

export default router;
