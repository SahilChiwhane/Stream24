import admin from "firebase-admin";
import { env } from "./env.js";
import logger from "../utils/logger.js";

let initialized = false;
let adminApp = null;

export const initFirebaseAdmin = () => {
  if (initialized) return adminApp;

  const isEmulator =
    process.env.FUNCTIONS_EMULATOR === "true" ||
    !!process.env.FIRESTORE_EMULATOR_HOST;

  // ---------- EMULATOR MODE ----------
  if (isEmulator) {
    adminApp = admin.initializeApp();
    logger.info("Firebase decoupled to EMULATOR mode");

    if (process.env.FIRESTORE_EMULATOR_HOST) {
      logger.info(
        `Source: Firestore Emulator at ${process.env.FIRESTORE_EMULATOR_HOST}`,
      );
    }
  }

  // ---------- PRODUCTION MODE ----------
  else {
    if (!env.FIREBASE_SERVICE_ACCOUNT) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT is missing — cannot initialize Firebase Admin",
      );
    }

    const creds = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);

    if (creds.private_key) {
      creds.private_key = creds.private_key.replace(/\\n/g, "\n");
    }

    adminApp = admin.initializeApp({
      credential: admin.credential.cert(creds),
    });

    logger.auth("Firebase Admin Authority established (PRODUCTION)");
    logger.info(`Linked Project: ${creds.project_id}`);
  }

  initialized = true;
  return adminApp;
};

// Initialize immediately (safe singleton)
const app = initFirebaseAdmin();

export const firestore = app.firestore();
export const authAdmin = app.auth();
