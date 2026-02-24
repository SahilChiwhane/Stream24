import { Router } from "express";
import {
  home,
  list,
  details,
  episodes,
  stream,
  search,
} from "./anime.controller.js";

const router = Router();

router.get("/home", home);
router.get("/list/:type", list);
router.get("/details/:id", details);
router.get("/episodes/:id", episodes);
router.get("/stream/:episodeId", stream);
router.get("/search", search);

export default router;
