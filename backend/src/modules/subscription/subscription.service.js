import { firestore } from "../../config/firebase.js";
import { subscriptionCollection } from "./subscription.model.js";

const subRef = firestore.collection(subscriptionCollection);

const now = () => new Date();
const toISO = (d) => d.toISOString();

const addDays = (d, days) => {
  const c = new Date(d);
  c.setDate(c.getDate() + days);
  return c;
};

// ---------- HELPERS ----------
const computeExpiryIfNeeded = async (uid, data) => {
  if (!data?.currentPeriodEnd) return data;

  const ends = new Date(data.currentPeriodEnd);

  if (now() <= ends) return data; // still active

  // period ended → expire
  const updated = {
    ...data,
    status: "expired",
    isActive: false,
    updatedAt: toISO(now()),
  };

  await subRef.doc(uid).set(updated, { merge: true });
  return updated;
};

// ---------- GET ----------
export const getUserSubscription = async (uid) => {
  const doc = await subRef.doc(uid).get();

  if (!doc.exists) {
    return { status: "none", isActive: false };
  }

  return await computeExpiryIfNeeded(uid, doc.data());
};

// ---------- ACTIVATE OR RENEW ----------
export const upsertSubscription = async (uid, payload = {}) => {
  const snap = await subRef.doc(uid).get();
  const existing = snap.exists ? snap.data() : null;

  const start = now();
  const end = addDays(start, 30);

  const updated = {
    uid,
    planId: payload.planId ?? existing?.planId ?? null,
    amount: payload.amount ?? existing?.amount ?? 0,

    status: "active",
    isActive: true,

    currentPeriodStart: toISO(start),
    currentPeriodEnd: toISO(end),

    cancelAtPeriodEnd: false,

    transactionId: payload.transactionId ?? null,
    source: payload.source ?? "payment_verify",

    createdAt: existing?.createdAt ?? toISO(start),
    updatedAt: toISO(start),
  };

  await subRef.doc(uid).set(updated, { merge: true });

  return updated;
};

// ---------- CANCEL (soft cancel) ----------
export const cancelSubscription = async (uid) => {
  const doc = await subRef.doc(uid).get();
  if (!doc.exists) return null;

  const data = doc.data();

  const updated = {
    ...data,
    status: "cancel_at_period_end",
    cancelAtPeriodEnd: true,
    updatedAt: toISO(now()),
  };

  await subRef.doc(uid).set(updated, { merge: true });
  return updated;
};

// ---------- TERMINATE (immediate) ----------
export const terminateSubscriptionImmediately = async (uid) => {
  const doc = await subRef.doc(uid).get();
  if (!doc.exists) return null;

  const updated = {
    ...doc.data(),
    status: "terminated",
    isActive: false,
    cancelAtPeriodEnd: false,
    updatedAt: toISO(now()),
    terminatedAt: toISO(now()),
  };

  await subRef.doc(uid).set(updated, { merge: true });
  return updated;
};
