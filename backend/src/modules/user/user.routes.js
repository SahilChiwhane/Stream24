import { Router } from "express";
import { verifyAuth } from "../../middlewares/auth.middleware.js";
import { getMe, updateMe, deleteMe, changePassword } from "./user.controller.js";

const router = Router();

router.use(verifyAuth); // apply once

router.get("/me", getMe);
router.put("/me", updateMe);
router.put("/me/password", changePassword);
router.delete("/me", deleteMe);

export default router;
