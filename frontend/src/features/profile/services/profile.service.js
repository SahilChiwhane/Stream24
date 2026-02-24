// src/services/userProfileService.js
import { auth, db } from "../firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

const storage = getStorage();

/** Upload avatar → delete old → return {url, storagePath} */
export const uploadAvatarAndReturnMeta = async (file, existingAvatar) => {
  const uid = auth.currentUser?.uid;
  if (!uid || !file) return null;

  // delete old avatar if exists
  if (existingAvatar?.storagePath) {
    try {
      await deleteObject(ref(storage, existingAvatar.storagePath));
    } catch {}
  }

  const path = `avatars/${uid}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return { url, storagePath: path };
};

export const removeAvatarAndDeleteFile = async (existingAvatar) => {
  if (!existingAvatar?.storagePath) return;

  try {
    await deleteObject(ref(storage, existingAvatar.storagePath));
  } catch {}
};

/** Save profile changes (name / avatar meta) */
export const saveUserProfile = async (patch) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  await updateDoc(doc(db, "users", uid), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
};
