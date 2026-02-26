import Razorpay from "razorpay";
import crypto from "crypto";
import { firestore } from "../../config/firebase.js";
import { subscriptionCollection } from "../subscription/subscription.model.js";
import { ACCOUNT_STATUS } from "../../constants/accountStatus.js";
import { updateUserProfile, patchUser } from "../user/user.service.js";
import logger from "../../utils/logger.js";

const subRef = firestore.collection(subscriptionCollection);

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  throw new Error("Missing Razorpay env variables");
}

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

const now = () => new Date();
const toISO = (d) => d.toISOString();
const addDays = (d, days) => {
  const c = new Date(d);
  c.setDate(c.getDate() + days);
  return c;
};

// ================================
// CREATE ORDER (FIXED)
// ================================
export const createOrder = async ({ uid, planId, amount }) => {
  if (!uid || !planId || !amount || amount <= 0) {
    const err = new Error("Invalid planId or amount");
    err.status = 400;
    throw err;
  }

  // 🔐 Razorpay receipt MUST be <= 40 chars
  // Example: rcpt_premium_1712345678
  const receipt = `rcpt_${planId}_${Math.floor(Date.now() / 1000)}`;

  try {
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt,
      notes: {
        uid, // safe to keep UID here
        planId,
      },
    });

    return order;
  } catch (rawErr) {
    logger.error("Razorpay create-order failed:", rawErr);

    const message =
      rawErr?.error?.description ||
      rawErr?.message ||
      "Razorpay order creation failed";

    const err = new Error(message);
    err.status = rawErr?.statusCode || 500;
    throw err;
  }
};

// ================================
// VERIFY PAYMENT + ACTIVATE
// ================================
export const verifyAndActivate = async ({
  uid,
  planId,
  amount,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  if (
    !uid ||
    !planId ||
    !amount ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    const err = new Error("Missing payment verification fields");
    err.status = 400;
    throw err;
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expected = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expected !== razorpay_signature) {
    const err = new Error("Invalid Razorpay signature");
    err.status = 400;
    throw err;
  }

  const existing = await subRef.doc(uid).get();
  if (
    existing.exists &&
    existing.data()?.transactionId === razorpay_payment_id
  ) {
    const err = new Error("Duplicate payment detected");
    err.status = 409;
    throw err;
  }

  const start = now();
  const end = addDays(start, 30);

  const subscription = {
    uid,
    planId,
    amount,
    currency: "INR",

    status: "active",
    isActive: true,

    currentPeriodStart: toISO(start),
    currentPeriodEnd: toISO(end),

    cancelAtPeriodEnd: false,

    transactionId: razorpay_payment_id,
    razorpayOrderId: razorpay_order_id,

    source: "razorpay",
    createdAt: existing.exists ? existing.data().createdAt : toISO(start),
    updatedAt: toISO(start),
  };

  await subRef.doc(uid).set(subscription, { merge: true });

  // 🚀 Proactive Lifecycle Transition
  // Ensure the user is immediately marked as ready for the platform
  try {
    await patchUser(uid, {
      accountStatus: ACCOUNT_STATUS.ACCOUNT_READY,
    });
  } catch (err) {
    logger.warn("Proactive status update failed (non-critical):", err.message);
  }

  return {
    activated: true,
    validUntil: subscription.currentPeriodEnd,
  };
};
