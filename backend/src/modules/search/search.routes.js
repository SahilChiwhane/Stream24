import { Router } from "express";
import * as searchController from "./search.controller.js";

const router = Router();

router.get("/multi", searchController.multiSearch);

export default router;
