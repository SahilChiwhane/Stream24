import { firestore } from "../../config/firebase.js";
import logger from "../../utils/logger.js";

const userHistoryRef = (uid) =>
  firestore.collection("users").doc(uid).collection("watch_history");

const now = () => new Date().toISOString();

/**
 * UPSERT completed content into watch history
 */
export const upsertWatchHistory = async (payload) => {
  const {
    uid,
    contentId,
    contentType,
    title,
    thumbnail,
    season = null,
    episode = null,
    durationSeconds,
    progress = 0,
  } = payload;

  try {
    const isEpisodic = ["tv", "series", "anime"].includes(contentType);
    const docId = isEpisodic
      ? `${contentId}_S${season}_E${episode}`
      : `${contentId}`;

    // Safeguard: Ensure duration is either positive or null (never 0)
    const sanitizedDuration =
      typeof durationSeconds === "number" && durationSeconds > 0
        ? durationSeconds
        : null;

    logger.debug(`[HISTORY] Upserting session for user ${uid}: ${docId}`, {
      title,
      progress,
      durationSeconds,
    });

    const ref = userHistoryRef(uid).doc(docId);

    // --- AUTO-CLEANUP LOGIC: Delete if completed ---
    // Only run completion check when we have a reliable, measured duration (> 60s).
    // A null or very small durationSeconds means the YT player hasn't reported
    // duration yet — skip cleanup to avoid false-positive deletions.
    if (sanitizedDuration && sanitizedDuration > 10) {
      const ratio = progress / sanitizedDuration;
      const remaining = sanitizedDuration - progress;
      const isCompleted =
        ratio >= 0.95 || (sanitizedDuration > 20 && remaining < 10);

      if (isCompleted) {
        const doc = await ref.get();
        if (doc.exists) {
          await ref.delete();
          logger.info(
            `[CLEANUP] Deleted completed session ${docId} for user ${uid}`,
          );
        }
        return; // Stop here if completed
      }
    }

    const doc = await ref.get();
    const existingData = doc.exists ? doc.data() : {};

    // PERSISTENCE LOGIC: If incoming duration is missing/null, preserve the existing one
    const finalDuration =
      sanitizedDuration || existingData.durationSeconds || null;

    const data = {
      uid,
      contentId,
      contentType,
      title,
      thumbnail,
      season,
      episode,
      durationSeconds: finalDuration,
      progress,
      isAnime: payload.isAnime || false,
      lastWatchedAt: now(),
      updatedAt: now(),
    };

    if (!doc.exists) {
      data.createdAt = now();
    }

    await ref.set(data, { merge: true });
    logger.debug(`[SUCCESS] Wrote ${docId} for user ${uid}`);
  } catch (err) {
    logger.error(`[HISTORY_SERVICE] CRITICAL ERROR: ${err.message}`);
    throw err;
  }
};

/**
 * GET user's watch history
 */
export const getUserWatchHistory = async (uid, limit = 50) => {
  try {
    logger.debug(`Fetching watch history for UID: ${uid}`);
    const snap = await userHistoryRef(uid).limit(limit).get();

    let list = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    // Sort manually in case index is missing
    list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    logger.debug(`Found ${list.length} personalized history items for ${uid}`);
    return list;
  } catch (err) {
    logger.error(`Firestore History Query Error: ${err.message}`);
    throw err;
  }
};

/**
 * DELETE history item
 */
export const deleteWatchHistoryItem = async (uid, docId) => {
  const ref = userHistoryRef(uid).doc(docId);
  const doc = await ref.get();
  if (doc.exists) {
    await ref.delete();
    return true;
  }
  return false;
};
