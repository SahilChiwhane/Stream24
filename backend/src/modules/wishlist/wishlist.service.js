import { firestore } from "../../config/firebase.js";

const db = firestore;
const userRef = (userId) => db.collection("users").doc(userId);

/* -----------------------------
   Internal validator / normalizer
--------------------------------*/
const normalizeItem = (item) => {
  if (!item || !item.id) {
    throw new Error("Wishlist item must contain id");
  }

  return {
    id: String(item.id),
    title: typeof item.title === "string" ? item.title : "Untitled",
    posterUrl: typeof item.posterUrl === "string" ? item.posterUrl : null,
    mediaType:
      item.mediaType === "movie" ||
      item.mediaType === "tv" ||
      item.mediaType === "anime"
        ? item.mediaType
        : "movie",
    addedAt: Date.now(),
  };
};

/* -----------------------------
   Service methods
--------------------------------*/

export const getWishlist = async (userId) => {
  const snapshot = await userRef(userId)
    .collection("wishlist")
    .orderBy("addedAt", "desc")
    .limit(200); // hard safety limit

  const data = await snapshot.get();
  return data.docs.map((doc) => doc.data());
};

export const addWishlistItem = async (userId, item) => {
  const normalized = normalizeItem(item);

  await userRef(userId)
    .collection("wishlist")
    .doc(normalized.id)
    .set(normalized, { merge: true });

  return true;
};

export const removeWishlistItem = async (userId, contentId) => {
  await userRef(userId)
    .collection("wishlist")
    .doc(String(contentId))
    .delete();

  return true;
};

export const isInWishlist = async (userId, contentId) => {
  const doc = await userRef(userId)
    .collection("wishlist")
    .doc(String(contentId))
    .get();

  return doc.exists;
};
