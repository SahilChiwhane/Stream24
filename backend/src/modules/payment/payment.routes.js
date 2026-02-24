import { Router } from "express";
import { verifyAuth } from "../../middlewares/auth.middleware.js";
import { createPaymentOrder, verifyPayment } from "./payment.controller.js";

const router = Router();

router.post("/create-order", verifyAuth, createPaymentOrder);
router.post("/confirm", verifyAuth, verifyPayment);

export default router;
