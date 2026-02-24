import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase configuration
 */
const firebaseConfig = {
  apiKey: "AIzaSyCCzrUf1P-bncdvZTpM2VhSx4W1PSV0kZY",
  authDomain: "stream24-ott-3d01b.firebaseapp.com",
  projectId: "stream24-ott-3d01b",
  storageBucket: "stream24-ott-3d01b.firebasestorage.app",
  messagingSenderId: "439789118236",
  appId: "1:439789118236:web:f60296651e901bcc2810d9",
  measurementId: "G-WBM56XE365",
};

/**
 * Initialize Firebase app
 */
const app = initializeApp(firebaseConfig);

/**
 * Firebase Auth + Firestore
 */
export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * FORCE persistent auth session (Netflix-style)
 *
 * IMPORTANT:
 * This is async but intentionally NOT awaited here.
 * Firebase internally queues auth operations safely.
 */
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Failed to set auth persistence:", err);
});
