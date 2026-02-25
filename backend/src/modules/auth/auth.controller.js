import { success } from "../../utils/response.js";
import {
  getOrCreateUser,
  updateUserProfile,
  createUserIfNotExists,
} from "../user/user.service.js";
import { getUserSubscription } from "../subscription/subscription.service.js";
import { authAdmin } from "../../config/firebase.js";
import { ACCOUNT_STATUS } from "../../constants/accountStatus.js";
import logger from "../../utils/logger.js";

/**
 * Health check
 */
export const healthCheck = (req, res) => {
  return success(res, { status: "ok" }, "Backend running");
};

/**
 * Signup completion
 * Backend-authoritative user creation
 */
export const signupComplete = async (req, res, next) => {
  try {
    const { uid } = req.user;
    logger.auth(`Completing signup for UID: ${uid}`);

    // Firebase is identity authority
    const fbUser = await authAdmin.getUser(uid);
    if (!fbUser?.email) {
      throw new Error("Firebase user missing email");
    }

    const {
      profile = {},
      planIntent = null,
      funnel = "standard",
    } = req.body || {};

    const user = await createUserIfNotExists(uid, {
      email: fbUser.email,
      role: "user",
      accountStatus: ACCOUNT_STATUS.SIGNED_UP,

      profile: {
        firstName: profile?.firstName || null,
        lastName: profile?.lastName || null,
        name:
          profile?.firstName && profile?.lastName
            ? `${profile.firstName} ${profile.lastName}`
            : profile?.name || fbUser.displayName || null,
        dob: profile?.dob || null,
        avatar: null,
      },

      planIntent,
      funnel,
      emailVerified: fbUser.emailVerified === true,
      source: "firebase",
    });

    return success(
      res,
      {
        user: {
          uid: user.uid,
          accountStatus: user.accountStatus,
        },
      },
      "Signup completed",
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Resolve active session
 * Lifecycle state machine lives here
 */
export const resolveSession = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const email = req.user.email;
    logger.auth(`Resolving session for ${email} (${uid})`);

    // Firebase is verification authority
    const userRecord = await authAdmin.getUser(uid);
    const emailVerified = userRecord.emailVerified === true;

    const user = await getOrCreateUser(uid, { email });
    const subscription = await getUserSubscription(uid);

    let accountStatus = user.accountStatus || ACCOUNT_STATUS.SIGNED_UP;

    // ─────────────────────────────
    // LIFECYCLE TRANSITIONS
    // ─────────────────────────────

    if (emailVerified && accountStatus === ACCOUNT_STATUS.SIGNED_UP) {
      accountStatus = ACCOUNT_STATUS.EMAIL_VERIFIED;
      logger.auth(`User ${uid} transitioned to EMAIL_VERIFIED`);
    }

    if (
      emailVerified &&
      subscription?.status === "active" &&
      accountStatus !== ACCOUNT_STATUS.ACCOUNT_READY
    ) {
      accountStatus = ACCOUNT_STATUS.ACCOUNT_READY;
      logger.auth(`User ${uid} transitioned to ACCOUNT_READY`);
    }

    if (
      accountStatus !== user.accountStatus ||
      !user.firstName ||
      !user.lastName
    ) {
      const patch = { accountStatus };

      // Self-heal names if missing from stub
      if (!user.firstName || !user.lastName) {
        const nameParts = (userRecord.displayName || "").trim().split(/\s+/);
        patch.firstName = user.firstName || nameParts[0] || "";
        patch.lastName = user.lastName || nameParts.slice(1).join(" ") || "";
        patch.name = user.name || userRecord.displayName || "";
      }

      await updateUserProfile(uid, patch);
    }

    return success(res, {
      user: {
        uid,
        email,
        role: user.role || "user",
        accountStatus,
        profile: user.profile || null,
      },
      subscription: {
        status: subscription?.status || "none",
        planId: subscription?.planId || null,
        currentPeriodEnd: subscription?.currentPeriodEnd || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Secure logout
 */
export const logout = async (req, res, next) => {
  try {
    logger.auth(`Revoking session for UID: ${req.user.uid}`);
    await authAdmin.revokeRefreshTokens(req.user.uid);
    return success(res, null, "Session revoked");
  } catch (err) {
    next(err);
  }
};
