import { firestore } from "../../config/firebase.js";
import { userCollection } from "./user.model.js";
import { ACCOUNT_STATUS } from "../../constants/accountStatus.js";
import { terminateSubscriptionImmediately } from "../subscription/subscription.service.js";
import admin from "firebase-admin";
import logger from "../../utils/logger.js";

const usersRef = firestore.collection(userCollection);
const now = () => admin.firestore.Timestamp.now();

/**
 * Fetch user by UID
 */
export const getUserById = async (uid) => {
  const doc = await usersRef.doc(uid).get();
  return doc.exists ? doc.data() : null;
};

/**
 * Legacy-compatible fetch-or-create
 * Used by resolveSession
 */
export const getOrCreateUser = async (uid, payload = {}) => {
  const ref = usersRef.doc(uid);
  const snap = await ref.get();

  if (snap.exists) {
    const data = snap.data();

    // Self-heal missing lifecycle field
    if (!data.accountStatus) {
      const patched = {
        accountStatus: ACCOUNT_STATUS.SIGNED_UP,
        updatedAt: now(),
      };
      await ref.set(patched, { merge: true });
      return { ...data, ...patched };
    }

    // Ensure firstName/lastName exist (backward compatibility)
    if (!data.firstName && !data.lastName && data.name) {
      const nameParts = data.name.trim().split(/\s+/);
      const f = nameParts[0] || "";
      const l = nameParts.slice(1).join(" ") || "";

      const patched = {
        firstName: f,
        lastName: l,
        updatedAt: now(),
      };
      await ref.set(patched, { merge: true });
      Object.assign(data, patched);
    }

    // Ensure avatarUrl exists (backward compatibility)
    if (!data.avatarUrl && data.profile?.avatar) {
      const patched = {
        avatarUrl: data.profile.avatar,
        updatedAt: now(),
      };
      await ref.set(patched, { merge: true });
      Object.assign(data, patched);
    }

    return data;
  }

  // Fallback legacy creation (rare)
  // Extract firstName/lastName from name if provided
  const nameParts = (payload.name || "").trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const user = {
    uid,
    email: payload.email || null,
    firstName,
    lastName,
    name: payload.name || null, // Keep for backward compatibility
    avatarUrl: payload.avatar || null,
    avatarId: null,
    role: "user",
    accountStatus: ACCOUNT_STATUS.SIGNED_UP,
    profile: null, // Keep for backward compatibility if any
    createdAt: now(),
    updatedAt: now(),
  };

  await ref.set(user);
  return user;
};

/**
 * Backend-authoritative creation
 * Used ONLY by signup-complete
 */
export const createUserIfNotExists = async (uid, payload = {}) => {
  const ref = usersRef.doc(uid);
  const snap = await ref.get();

  const profileData = payload.profile || {};
  const firstName = profileData.firstName || "";
  const lastName = profileData.lastName || "";
  const name = profileData.name || `${firstName} ${lastName}`.trim();

  const user = {
    uid,
    email: payload.email || null,
    role: payload.role || "user",
    accountStatus: payload.accountStatus || ACCOUNT_STATUS.SIGNED_UP,

    // Flattened profile for frontend compatibility
    firstName: firstName || null,
    lastName: lastName || null,
    name: name || null,
    avatarUrl: profileData.avatar || null,
    avatarId: null,

    profile: {
      firstName: firstName || null,
      lastName: lastName || null,
      name: name || null,
      dob: profileData.dob || null,
      avatar: profileData.avatar || null,
    },

    planIntent: payload.planIntent || null,
    funnel: payload.funnel || "standard",
    emailVerified: payload.emailVerified || false,
    source: payload.source || "firebase",
    updatedAt: now(),
  };

  if (!snap.exists) {
    user.createdAt = now();
    await ref.set(user);
    return user;
  } else {
    // If user exists, merge the new details
    // This handles the "stub" user created by resolveSession
    const existing = snap.data();

    // Merge but don't overwrite email if it's already there
    const merged = {
      ...user,
      email: existing.email || user.email,
      createdAt: existing.createdAt || now(),
    };

    await ref.set(merged, { merge: true });
    return merged;
  }
};

/**
 * Safe patch updates
 */
export const updateUserProfile = async (uid, patch = {}) => {
  // Ensure nested profile stays in sync with flattened fields
  const safePatch = {
    ...patch,
    updatedAt: now(),
  };

  // Synchronize avatarId/avatarUrl with nested profile if they exist
  if (patch.avatarUrl !== undefined || patch.avatarId !== undefined) {
    if (!safePatch.profile) safePatch.profile = {};
    if (patch.avatarUrl !== undefined)
      safePatch.profile.avatar = patch.avatarUrl;
  }

  // Synchronize names with nested profile
  if (patch.firstName || patch.lastName) {
    if (!safePatch.profile) safePatch.profile = {};
    const existing = await usersRef.doc(uid).get();
    const currentProfile = existing.data()?.profile || {};
    const f = patch.firstName || existing.data()?.firstName || "";
    const l = patch.lastName || existing.data()?.lastName || "";
    safePatch.profile.name = `${f} ${l}`.trim();
  }

  await usersRef.doc(uid).set(safePatch, { merge: true });

  const refreshed = await usersRef.doc(uid).get();
  return refreshed.data();
};

export const updatePassword = async (uid, newPassword) => {
  // Update in Firebase Auth
  await admin.auth().updateUser(uid, {
    password: newPassword,
  });

  // Optionally update Firestore metadata
  await usersRef.doc(uid).set(
    {
      updatedAt: now(),
    },
    { merge: true },
  );
};

export const deleteUser = async (uid) => {
  // 1. Terminate Subscription IMMEDIATELY
  try {
    await terminateSubscriptionImmediately(uid);
  } catch (e) {
    logger.error("Failed to terminate subscription during user delete", e);
  }

  // Soft delete in Firestore
  await usersRef.doc(uid).set(
    {
      accountStatus: ACCOUNT_STATUS.DELETED,
      deletedAt: now(),
      updatedAt: now(),
    },
    { merge: true },
  );

  // Delete from Auth
  try {
    await admin.auth().deleteUser(uid);
  } catch (e) {
    if (e.code !== "auth/user-not-found") {
      logger.error("Failed to delete auth user", e);
    }
  }

  return true;
};
