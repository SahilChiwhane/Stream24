// backend/src/modules/preferences/preferences.service.js

import { firestore } from "../../config/firebase.js";
import {
  preferencesCollection,
  buildDefaultPreferences,
} from "./preferences.model.js";

const ref = firestore.collection(preferencesCollection);

export const getOrCreatePreferences = async (uid) => {
  const doc = await ref.doc(uid).get();

  if (doc.exists) return doc.data();

  const defaults = buildDefaultPreferences(uid);
  await ref.doc(uid).set(defaults);
  return defaults;
};

export const updatePreferences = async (uid, patch = {}) => {
  const safePatch = {
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  await ref.doc(uid).set(safePatch, { merge: true });

  const updated = await ref.doc(uid).get();
  return updated.data();
};
