import { success, failure } from "../../utils/response.js";
import { createOrder, verifyAndActivate } from "./payment.service.js";

export const createPaymentOrder = async (req, res, next) => {
  try {
    const { planId, amount } = req.body;

    if (!planId || !amount) {
      return failure(res, "Missing planId or amount", 400);
    }

    const order = await createOrder({
      uid: req.user.uid,
      planId,
      amount,
    });

    return success(
      res,
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
      "Order created"
    );
  } catch (err) {
    next(err);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const result = await verifyAndActivate({
      uid: req.user.uid,
      ...req.body,
    });

    return success(res, result, "Payment verified");
  } catch (err) {
    next(err);
  }
};
