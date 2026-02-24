import { firestore } from "../../config/firebase.js";

export const getUserProfile = async (uid) => {
  const doc = await firestore.collection("users").doc(uid).get();

  if (!doc.exists) {
    return {
      uid,
      email: null,
      onboarded: false,
    };
  }

  return doc.data();
};
