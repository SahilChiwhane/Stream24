import "dotenv/config";
import admin from "firebase-admin";
import { initFirebaseAdmin } from "../src/config/firebase.js";
import { ACCOUNT_STATUS } from "../src/constants/accountStatus.js";

initFirebaseAdmin();

const db = admin.firestore();
const usersRef = db.collection("users");

const mapOnboardingToAccountStatus = (onboarding) => {
  switch (onboarding) {
    case "SIGNED_UP":
      return ACCOUNT_STATUS.SIGNED_UP;
    case "EMAIL_VERIFIED":
      return ACCOUNT_STATUS.EMAIL_VERIFIED;
    case "ACCOUNT_READY":
      return ACCOUNT_STATUS.ACCOUNT_READY;
    default:
      return ACCOUNT_STATUS.SIGNED_UP;
  }
};

async function migrate() {
  const snapshot = await usersRef.get();
  let touched = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const patch = {};

    // ─────────────────────────────
    // 1️⃣ Lifecycle normalization
    // ─────────────────────────────
    if (!data.accountStatus) {
      patch.accountStatus = mapOnboardingToAccountStatus(
        data.onboardingStatus
      );
    }

    // ─────────────────────────────
    // 2️⃣ Profile normalization
    // ─────────────────────────────
    const profile = data.profile || {};

    if (!profile.name && data.name) {
      profile.name = data.name;
    }

    if (!profile.dob && data.dob) {
      profile.dob = data.dob;
    }

    if (!profile.avatar && data.avatar !== undefined) {
      profile.avatar = data.avatar;
    }

    if (Object.keys(profile).length > 0) {
      patch.profile = profile;
    }

    // ─────────────────────────────
    // 3️⃣ Metadata safety
    // ─────────────────────────────
    if (!data.role) {
      patch.role = "user";
    }

    if (Object.keys(patch).length === 0) {
      continue; // already clean
    }

    patch.updatedAt = admin.firestore.Timestamp.now();

    await usersRef.doc(doc.id).set(patch, { merge: true });
    touched++;
  }

  console.log(`✅ Phase 2 migration complete. Updated ${touched} users.`);
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
