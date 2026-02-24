export const subscriptionCollection = "subscriptions";

export const buildEmptySubscription = (uid) => ({
  uid,
  status: "none",
  isActive: false,

  planId: null,
  amount: 0,
  currency: "INR",

  currentPeriodStart: null,
  currentPeriodEnd: null,

  cancelAtPeriodEnd: false,

  transactionId: null,
  source: "system",

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
