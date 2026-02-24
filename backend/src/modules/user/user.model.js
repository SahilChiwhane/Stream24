import { ACCOUNT_STATUS } from "../../constants/accountStatus.js";

export const userCollection = "users";

export const buildUserProfile = (uid, data = {}) => ({
  uid,

  email: data.email ?? null,
  role: "user",

  // 🔥 SINGLE SOURCE OF TRUTH
  accountStatus: ACCOUNT_STATUS.SIGNED_UP,

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
