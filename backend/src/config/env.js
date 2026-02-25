import dotenv from "dotenv";
dotenv.config();

const requireEnv = (key) => {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required env variable: ${key}`);
  }
  return value;
};

export const env = {
  PORT: process.env.PORT || 5050,

  // required in prod — optional in emulator
  FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT || null,

  NODE_ENV: process.env.NODE_ENV || "development",
  TMDB_API_KEY: customRequireEnv("TMDB_API_KEY"),
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://192.168.1.109:3000",
        "http://192.168.1.105:3000",
        "http://192.168.1.109:5051",
        "http://192.168.1.105:5051",
      ],
};

import logger from "../utils/logger.js";

function customRequireEnv(key) {
  const value = process.env[key];
  if (!value) {
    // Warn instead of throw for now to avoid breaking if .env is missing locally
    logger.warn(`Missing env variable: ${key}`);
    return "";
  }
  return value;
}
