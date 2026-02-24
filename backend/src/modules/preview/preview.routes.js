import { Router } from "express";
import { resolvePreviewController } from "./preview.controller.js";

const router = Router();

router.get("/resolve", resolvePreviewController);

export default router;
