import { firestore } from "../../config/firebase.js";

/**
 * Decide if user can START playback
 * (NOT autoplay, NOT resume)
 */
export const resolvePlaybackAccess = async ({
  uid,
  contentId,
  contentType,
}) => {
  // --------------------------------
  // 1. Subscription check
  // --------------------------------
  const subSnap = await firestore.collection("subscriptions").doc(uid).get();

  if (!subSnap.exists || subSnap.data().status !== "active") {
    return {
      allowed: false,
      reason: "subscription_required",
      cta: {
        type: "subscribe",
        message: "Subscribe to watch this title",
      },
    };
  }

  // --------------------------------
  // 2. Entitled
  // --------------------------------
  return {
    allowed: true,
    contentId,
    contentType,
    mode: "full", // future: trailer | preview | kids
  };
};
